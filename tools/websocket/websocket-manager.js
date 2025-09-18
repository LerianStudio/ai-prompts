/**
 * WebSocket Connection Manager with Circuit Breaker Pattern
 * Provides resilient WebSocket connections with automatic reconnection,
 * circuit breaker pattern, and connection health monitoring
 */

const EventEmitter = require('events')

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.recoveryTimeout = options.recoveryTimeout || 60000
    this.monitoringPeriod = options.monitoringPeriod || 10000

    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0

    this.stateChangeCallbacks = new Set()
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
        this.successCount = 0
        this.notifyStateChange('HALF_OPEN')
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= 3) {
        this.state = 'CLOSED'
        this.notifyStateChange('CLOSED')
      }
    }
  }

  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
      this.notifyStateChange('OPEN')
    }
  }

  onStateChange(callback) {
    this.stateChangeCallbacks.add(callback)
  }

  notifyStateChange(newState) {
    this.stateChangeCallbacks.forEach((callback) => {
      try {
        callback(newState, this.failureCount)
      } catch (error) {
        console.error(
          'Error in circuit breaker state change callback:',
          error.message
        )
      }
    })
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount
    }
  }
}

class WebSocketManager extends EventEmitter {
  constructor(url, options = {}) {
    super()

    this.url = url
    this.options = {
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      baseReconnectDelay: options.baseReconnectDelay || 1000,
      maxReconnectDelay: options.maxReconnectDelay || 30000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      connectionTimeout: options.connectionTimeout || 10000,
      ...options
    }

    this.ws = null
    this.reconnectAttempts = 0
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.connectionState = 'DISCONNECTED' // DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING
    this.lastPongTime = null
    this.intentionalDisconnect = false
    this.connectionId = this.generateConnectionId()

    // Circuit breaker for connection attempts
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000
    })

    this.circuitBreaker.onStateChange((state, failures) => {
      this.emit('circuitBreakerStateChange', {
        state,
        failures,
        connectionId: this.connectionId
      })
    })

    // Message queue for when disconnected
    this.messageQueue = []
    this.maxQueueSize = options.maxQueueSize || 100

    // Connection metrics
    this.metrics = {
      totalConnections: 0,
      totalDisconnections: 0,
      totalReconnectAttempts: 0,
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      totalErrors: 0,
      connectionUptime: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null
    }

    this.setupCleanupHandlers()
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    if (
      this.connectionState === 'CONNECTED' ||
      this.connectionState === 'CONNECTING'
    ) {
      return Promise.resolve()
    }

    this.intentionalDisconnect = false

    return this.circuitBreaker.execute(async () => {
      return new Promise((resolve, reject) => {
        try {
          this.connectionState = 'CONNECTING'
          this.connectionId = this.generateConnectionId()
          this.emit('connecting', { connectionId: this.connectionId })

          // Create WebSocket with connection timeout
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

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.intentionalDisconnect = true
    this.clearTimers()

    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
    }

    this.connectionState = 'DISCONNECTED'
    this.emit('disconnected', {
      intentional: true,
      connectionId: this.connectionId
    })
  }

  /**
   * Send message with queuing support
   */
  send(message) {
    const messageData =
      typeof message === 'string' ? message : JSON.stringify(message)

    if (
      this.connectionState === 'CONNECTED' &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      try {
        this.ws.send(messageData)
        this.metrics.totalMessagesSent++
        this.emit('messageSent', {
          message: messageData,
          connectionId: this.connectionId
        })
        return true
      } catch (error) {
        this.emit('error', {
          type: 'send_error',
          error: error.message,
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

  /**
   * Queue message for later delivery
   */
  queueMessage(message) {
    if (this.messageQueue.length >= this.maxQueueSize) {
      const dropped = this.messageQueue.shift()
      this.emit('messageDropped', {
        droppedMessage: dropped,
        queueSize: this.messageQueue.length,
        connectionId: this.connectionId
      })
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      attempts: 0
    })
  }

  /**
   * Send queued messages
   */
  sendQueuedMessages() {
    const messages = [...this.messageQueue]
    this.messageQueue = []

    for (const queuedMessage of messages) {
      if (this.send(queuedMessage.message)) {
        this.emit('queuedMessageSent', {
          message: queuedMessage,
          connectionId: this.connectionId
        })
      }
    }
  }

  /**
   * Handle connection open
   */
  onConnectionOpen() {
    this.connectionState = 'CONNECTED'
    this.reconnectAttempts = 0
    this.metrics.totalConnections++
    this.metrics.lastConnectedAt = Date.now()

    this.emit('connected', {
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts
    })

    // Send queued messages
    this.sendQueuedMessages()

    // Start heartbeat
    this.startHeartbeat()
  }

  /**
   * Handle incoming messages
   */
  onMessage(event) {
    try {
      this.metrics.totalMessagesReceived++

      const data = JSON.parse(event.data)

      // Handle pong response
      if (data.type === 'pong') {
        this.lastPongTime = Date.now()
        this.emit('heartbeatResponse', {
          latency: this.lastPongTime - data.timestamp,
          connectionId: this.connectionId
        })
        return
      }

      this.emit('message', {
        data,
        raw: event.data,
        connectionId: this.connectionId
      })
    } catch (error) {
      this.emit('error', {
        type: 'message_parse_error',
        error: error.message,
        raw: event.data,
        connectionId: this.connectionId
      })
    }
  }

  /**
   * Handle connection close
   */
  onConnectionClose(event) {
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

    // Attempt reconnection if not intentional
    if (!this.intentionalDisconnect) {
      this.scheduleReconnect()
    }
  }

  /**
   * Handle connection error
   */
  onConnectionError(error) {
    this.metrics.totalErrors++
    this.emit('error', {
      type: 'connection_error',
      error: error.message || 'WebSocket connection error',
      connectionId: this.connectionId
    })
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (
      this.intentionalDisconnect ||
      this.reconnectAttempts >= this.options.maxReconnectAttempts
    ) {
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
          error: error.message,
          connectionId: this.connectionId
        })
        this.scheduleReconnect()
      }
    }, delay)
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    if (this.options.heartbeatInterval <= 0) return

    this.heartbeatTimer = setInterval(() => {
      if (
        this.connectionState === 'CONNECTED' &&
        this.ws?.readyState === WebSocket.OPEN
      ) {
        const pingMessage = {
          type: 'ping',
          timestamp: Date.now()
        }

        this.send(pingMessage)

        // Check for missed pongs
        if (
          this.lastPongTime &&
          Date.now() - this.lastPongTime > this.options.heartbeatInterval * 2
        ) {
          this.emit('heartbeatMissed', {
            lastPong: this.lastPongTime,
            connectionId: this.connectionId
          })
          this.ws.close(1000, 'Heartbeat missed')
        }
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Update connection uptime metrics
   */
  updateConnectionUptime() {
    if (this.metrics.lastConnectedAt) {
      this.metrics.connectionUptime += Date.now() - this.metrics.lastConnectedAt
    }
  }

  /**
   * Generate unique connection ID
   */
  generateConnectionId() {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Setup cleanup handlers
   */
  setupCleanupHandlers() {
    const cleanup = () => {
      this.disconnect()
    }

    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
    process.on('exit', cleanup)
  }

  /**
   * Get connection status and metrics
   */
  getStatus() {
    return {
      connectionState: this.connectionState,
      connectionId: this.connectionId,
      url: this.url,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.options.maxReconnectAttempts,
      queuedMessages: this.messageQueue.length,
      maxQueueSize: this.maxQueueSize,
      circuitBreaker: this.circuitBreaker.getState(),
      metrics: {
        ...this.metrics,
        currentConnectionUptime: this.metrics.lastConnectedAt
          ? Date.now() - this.metrics.lastConnectedAt
          : 0
      },
      isConnected:
        this.connectionState === 'CONNECTED' &&
        this.ws?.readyState === WebSocket.OPEN
    }
  }

  /**
   * Reset connection (force reconnect)
   */
  async reset() {
    this.disconnect()
    this.reconnectAttempts = 0
    this.messageQueue = []
    await this.connect()
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.intentionalDisconnect = true
    this.clearTimers()
    this.removeAllListeners()

    if (this.ws) {
      this.ws.close(1000, 'Manager destroyed')
      this.ws = null
    }
  }
}

module.exports = { WebSocketManager, CircuitBreaker }
