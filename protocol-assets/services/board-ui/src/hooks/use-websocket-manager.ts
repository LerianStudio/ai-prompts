import { useEffect, useRef, useCallback, useState } from 'react'
import { getWebSocketUrl } from '@/config/environment'

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: number | null
  successCount: number
}

interface WebSocketMetrics {
  totalConnections: number
  totalDisconnections: number
  totalReconnectAttempts: number
  totalMessagesSent: number
  totalMessagesReceived: number
  totalErrors: number
  connectionUptime: number
  currentConnectionUptime: number
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
}

interface WebSocketStatus {
  connectionState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING'
  connectionId: string
  url: string
  reconnectAttempts: number
  maxReconnectAttempts: number
  queuedMessages: number
  maxQueueSize: number
  circuitBreaker: CircuitBreakerState
  metrics: WebSocketMetrics
  isConnected: boolean
}

interface WebSocketManagerOptions {
  maxReconnectAttempts?: number
  baseReconnectDelay?: number
  maxReconnectDelay?: number
  heartbeatInterval?: number
  connectionTimeout?: number
  maxQueueSize?: number
  autoConnect?: boolean
}

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketManagerReturn {
  status: WebSocketStatus | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  send: (message: WebSocketMessage) => boolean
  reset: () => Promise<void>
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private options: Required<WebSocketManagerOptions>
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private connectionState: WebSocketStatus['connectionState'] = 'DISCONNECTED'
  private lastPongTime: number | null = null
  private intentionalDisconnect = false
  private connectionId = ''
  private messageQueue: Array<{ message: string; timestamp: number; attempts: number }> = []
  private listeners = new Map<string, Set<Function>>()

  // Circuit breaker state
  private circuitBreakerState: CircuitBreakerState = {
    state: 'CLOSED',
    failureCount: 0,
    lastFailureTime: null,
    successCount: 0
  }

  // Metrics
  private metrics: WebSocketMetrics = {
    totalConnections: 0,
    totalDisconnections: 0,
    totalReconnectAttempts: 0,
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    totalErrors: 0,
    connectionUptime: 0,
    currentConnectionUptime: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null
  }

  constructor(url: string, options: WebSocketManagerOptions = {}) {
    this.url = url
    this.options = {
      maxReconnectAttempts: 10,
      baseReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      maxQueueSize: 100,
      autoConnect: true,
      ...options
    }
    this.connectionId = this.generateConnectionId()
  }

  async connect(): Promise<void> {
    if (this.connectionState === 'CONNECTED' || this.connectionState === 'CONNECTING') {
      return Promise.resolve()
    }

    this.intentionalDisconnect = false

    return this.executeWithCircuitBreaker(async () => {
      return new Promise<void>((resolve, reject) => {
        try {
          this.connectionState = 'CONNECTING'
          this.connectionId = this.generateConnectionId()
          this.emit('connecting', { connectionId: this.connectionId })

          const connectTimeout = setTimeout(() => {
            if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
              this.ws.close()
              reject(new Error('WebSocket connection timeout'))
            }
          }, this.options.connectionTimeout)

          this.ws = new WebSocket(this.url)

          this.ws.onopen = () => {
            clearTimeout(connectTimeout)
            this.onConnectionOpen()
            resolve()
          }

          this.ws.onmessage = (event) => {
            this.onMessage(event)
          }

          this.ws.onclose = (event) => {
            clearTimeout(connectTimeout)
            this.onConnectionClose(event)
          }

          this.ws.onerror = (error) => {
            clearTimeout(connectTimeout)
            this.onConnectionError(error)
            reject(error)
          }

        } catch (error) {
          this.connectionState = 'DISCONNECTED'
          reject(error)
        }
      })
    })
  }

  disconnect(): void {
    this.intentionalDisconnect = true
    this.clearTimers()

    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
    }

    this.connectionState = 'DISCONNECTED'
    this.emit('disconnected', { intentional: true, connectionId: this.connectionId })
  }

  send(message: WebSocketMessage): boolean {
    const messageData = JSON.stringify(message)

    if (this.connectionState === 'CONNECTED' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(messageData)
        this.metrics.totalMessagesSent++
        this.emit('messageSent', { message: messageData, connectionId: this.connectionId })
        return true
      } catch (error) {
        this.emit('error', {
          type: 'send_error',
          error: error instanceof Error ? error.message : 'Unknown send error',
          connectionId: this.connectionId
        })
        this.queueMessage(messageData)
        return false
      }
    } else {
      this.queueMessage(messageData)
      return false
    }
  }

  async reset(): Promise<void> {
    this.disconnect()
    this.reconnectAttempts = 0
    this.messageQueue = []
    await this.connect()
  }

  getStatus(): WebSocketStatus {
    return {
      connectionState: this.connectionState,
      connectionId: this.connectionId,
      url: this.url,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.options.maxReconnectAttempts,
      queuedMessages: this.messageQueue.length,
      maxQueueSize: this.options.maxQueueSize,
      circuitBreaker: this.circuitBreakerState,
      metrics: {
        ...this.metrics,
        currentConnectionUptime: this.metrics.lastConnectedAt
          ? Date.now() - this.metrics.lastConnectedAt
          : 0
      },
      isConnected: this.connectionState === 'CONNECTED' && this.ws?.readyState === WebSocket.OPEN
    }
  }

  addEventListener(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  removeEventListener(event: string, listener: Function): void {
    this.listeners.get(event)?.delete(listener)
  }

  destroy(): void {
    this.intentionalDisconnect = true
    this.clearTimers()
    this.listeners.clear()

    if (this.ws) {
      this.ws.close(1000, 'Manager destroyed')
      this.ws = null
    }
  }

  private async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    if (this.circuitBreakerState.state === 'OPEN') {
      if (this.circuitBreakerState.lastFailureTime &&
          Date.now() - this.circuitBreakerState.lastFailureTime >= 30000) {
        this.circuitBreakerState.state = 'HALF_OPEN'
        this.circuitBreakerState.successCount = 0
        this.emit('circuitBreakerStateChange', { state: 'HALF_OPEN' })
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked')
      }
    }

    try {
      const result = await operation()
      this.onCircuitBreakerSuccess()
      return result
    } catch (error) {
      this.onCircuitBreakerFailure()
      throw error
    }
  }

  private onCircuitBreakerSuccess(): void {
    this.circuitBreakerState.failureCount = 0

    if (this.circuitBreakerState.state === 'HALF_OPEN') {
      this.circuitBreakerState.successCount++
      if (this.circuitBreakerState.successCount >= 3) {
        this.circuitBreakerState.state = 'CLOSED'
        this.emit('circuitBreakerStateChange', { state: 'CLOSED' })
      }
    }
  }

  private onCircuitBreakerFailure(): void {
    this.circuitBreakerState.failureCount++
    this.circuitBreakerState.lastFailureTime = Date.now()

    if (this.circuitBreakerState.failureCount >= 3) {
      this.circuitBreakerState.state = 'OPEN'
      this.emit('circuitBreakerStateChange', { state: 'OPEN' })
    }
  }

  private queueMessage(message: string): void {
    if (this.messageQueue.length >= this.options.maxQueueSize) {
      const dropped = this.messageQueue.shift()
      this.emit('messageDropped', { droppedMessage: dropped, queueSize: this.messageQueue.length })
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      attempts: 0
    })
  }

  private sendQueuedMessages(): void {
    const messages = [...this.messageQueue]
    this.messageQueue = []

    for (const queuedMessage of messages) {
      if (this.send(JSON.parse(queuedMessage.message))) {
        this.emit('queuedMessageSent', { message: queuedMessage })
      }
    }
  }

  private onConnectionOpen(): void {
    this.connectionState = 'CONNECTED'
    this.reconnectAttempts = 0
    this.metrics.totalConnections++
    this.metrics.lastConnectedAt = Date.now()

    this.emit('connected', {
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts
    })

    this.sendQueuedMessages()
    this.startHeartbeat()
  }

  private onMessage(event: MessageEvent): void {
    try {
      this.metrics.totalMessagesReceived++
      const data = JSON.parse(event.data)

      if (data.type === 'pong') {
        this.lastPongTime = Date.now()
        this.emit('heartbeatResponse', {
          latency: this.lastPongTime - data.timestamp,
          connectionId: this.connectionId
        })
        return
      }

      this.emit('message', { data, raw: event.data, connectionId: this.connectionId })

    } catch (error) {
      this.emit('error', {
        type: 'message_parse_error',
        error: error instanceof Error ? error.message : 'Parse error',
        raw: event.data,
        connectionId: this.connectionId
      })
    }
  }

  private onConnectionClose(event: CloseEvent): void {
    this.connectionState = 'DISCONNECTED'
    this.clearTimers()
    this.updateConnectionUptime()
    this.metrics.totalDisconnections++
    this.metrics.lastDisconnectedAt = Date.now()

    this.emit('disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      intentional: this.intentionalDisconnect,
      connectionId: this.connectionId
    })

    if (!this.intentionalDisconnect) {
      this.scheduleReconnect()
    }
  }

  private onConnectionError(error: Event): void {
    this.metrics.totalErrors++
    this.emit('error', {
      type: 'connection_error',
      error: 'WebSocket connection error',
      connectionId: this.connectionId
    })
  }

  private scheduleReconnect(): void {
    if (this.intentionalDisconnect || this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('reconnectFailed', {
        maxAttempts: this.options.maxReconnectAttempts,
        connectionId: this.connectionId
      })
      return
    }

    this.connectionState = 'RECONNECTING'
    this.reconnectAttempts++
    this.metrics.totalReconnectAttempts++

    const delay = Math.min(
      this.options.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.options.maxReconnectDelay
    )

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.options.maxReconnectAttempts,
      connectionId: this.connectionId
    })

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        this.emit('reconnectError', {
          attempt: this.reconnectAttempts,
          error: error instanceof Error ? error.message : 'Reconnect error',
          connectionId: this.connectionId
        })
        this.scheduleReconnect()
      }
    }, delay)
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return

    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === 'CONNECTED' && this.ws?.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'ping',
          timestamp: Date.now()
        }

        this.send(pingMessage)

        if (this.lastPongTime &&
            (Date.now() - this.lastPongTime > this.options.heartbeatInterval * 2)) {
          this.emit('heartbeatMissed', {
            lastPong: this.lastPongTime,
            connectionId: this.connectionId
          })
          this.ws.close(1000, 'Heartbeat missed')
        }
      }
    }, this.options.heartbeatInterval)
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private updateConnectionUptime(): void {
    if (this.metrics.lastConnectedAt) {
      this.metrics.connectionUptime += Date.now() - this.metrics.lastConnectedAt
    }
  }

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error in WebSocket event listener for ${event}:`, error)
      }
    })
  }
}

export function useWebSocketManager(
  options: WebSocketManagerOptions = {}
): UseWebSocketManagerReturn {
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const [status, setStatus] = useState<WebSocketStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const updateStatus = useCallback(() => {
    if (wsManagerRef.current) {
      const currentStatus = wsManagerRef.current.getStatus()
      setStatus(currentStatus)
      setIsConnected(currentStatus.isConnected)
    }
  }, [])

  const connect = useCallback(async () => {
    if (wsManagerRef.current) {
      await wsManagerRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect()
    }
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    if (wsManagerRef.current) {
      return wsManagerRef.current.send(message)
    }
    return false
  }, [])

  const reset = useCallback(async () => {
    if (wsManagerRef.current) {
      await wsManagerRef.current.reset()
    }
  }, [])

  useEffect(() => {
    const wsUrl = getWebSocketUrl()
    wsManagerRef.current = new WebSocketManager(wsUrl, options)

    const manager = wsManagerRef.current

    // Setup event listeners
    const events = [
      'connecting', 'connected', 'disconnected', 'reconnecting',
      'reconnectError', 'reconnectFailed', 'error', 'message',
      'circuitBreakerStateChange', 'heartbeatMissed'
    ]

    events.forEach(event => {
      manager.addEventListener(event, updateStatus)
    })

    // Setup message handler
    manager.addEventListener('message', (data: any) => {
      console.log('📨 WebSocket message received:', data.data)

      // Handle different message types
      if (data.data.type === 'task_created' ||
          data.data.type === 'task_updated' ||
          data.data.type === 'task_deleted' ||
          data.data.type === 'agent_execution_started' ||
          data.data.type === 'agent_execution_running' ||
          data.data.type === 'agent_execution_completed' ||
          data.data.type === 'agent_execution_failed') {
        // Emit custom event for task updates
        window.dispatchEvent(new CustomEvent('wsTaskUpdate', { detail: data.data }))
      }
    })

    // Auto-connect if enabled
    if (options.autoConnect !== false) {
      manager.connect().catch(error => {
        console.error('Failed to connect WebSocket:', error)
      })
    }

    updateStatus()

    return () => {
      manager.destroy()
      wsManagerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove updateStatus from dependencies to prevent infinite loop

  return {
    status,
    isConnected,
    connect,
    disconnect,
    send,
    reset
  }
}