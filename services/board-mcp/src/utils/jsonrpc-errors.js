/**
 * JSON-RPC 2.0 compliant error handling for MCP servers
 * Specification: https://www.jsonrpc.org/specification
 */

// Standard JSON-RPC 2.0 error codes
export const JSONRPC_ERRORS = {
  // Standard JSON-RPC errors
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  
  // Server error range: -32000 to -32099
  SERVER_ERROR: -32000,
  
  // MCP-specific errors: -32100 to -32199
  MCP_TOOL_ERROR: -32100,
  MCP_RESOURCE_ERROR: -32101,
  MCP_VALIDATION_ERROR: -32102,
  MCP_NETWORK_ERROR: -32103,
  MCP_TIMEOUT_ERROR: -32104,
  MCP_SERVICE_UNAVAILABLE: -32105,
  MCP_RATE_LIMIT_ERROR: -32106,
  MCP_AUTHENTICATION_ERROR: -32107,
  MCP_AUTHORIZATION_ERROR: -32108,
  MCP_NOT_FOUND_ERROR: -32109
};

/**
 * Creates a JSON-RPC 2.0 compliant error object
 */
export function createJsonRpcError(code, message, data = null) {
  const error = {
    code,
    message
  };
  
  if (data !== null) {
    error.data = data;
  }
  
  return error;
}

/**
 * MCP-specific error creation helpers
 */
export class McpError extends Error {
  constructor(code, message, data = null) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.data = data;
  }
  
  toJsonRpc() {
    return createJsonRpcError(this.code, this.message, this.data);
  }
}

/**
 * Tool execution error
 */
export class ToolError extends McpError {
  constructor(toolName, message, originalError = null) {
    const data = {
      tool: toolName,
      timestamp: new Date().toISOString()
    };
    
    if (originalError) {
      data.details = originalError.message;
      data.stack = process.env.NODE_ENV === 'development' ? originalError.stack : undefined;
    }
    
    super(JSONRPC_ERRORS.MCP_TOOL_ERROR, message, data);
  }
}

/**
 * Network/HTTP error
 */
export class NetworkError extends McpError {
  constructor(message, statusCode = null, url = null) {
    const data = {
      timestamp: new Date().toISOString()
    };
    
    if (statusCode) data.statusCode = statusCode;
    if (url) data.url = url;
    
    super(JSONRPC_ERRORS.MCP_NETWORK_ERROR, message, data);
  }
}

/**
 * Validation error
 */
export class ValidationError extends McpError {
  constructor(field, message, value = null) {
    const data = {
      field,
      timestamp: new Date().toISOString()
    };
    
    if (value !== null) data.invalidValue = value;
    
    super(JSONRPC_ERRORS.MCP_VALIDATION_ERROR, message, data);
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends McpError {
  constructor(service, message = null) {
    const defaultMessage = `Service ${service} is currently unavailable`;
    const data = {
      service,
      timestamp: new Date().toISOString()
    };
    
    super(JSONRPC_ERRORS.MCP_SERVICE_UNAVAILABLE, message || defaultMessage, data);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends McpError {
  constructor(resource, id) {
    const message = `${resource} with ID ${id} not found`;
    const data = {
      resource,
      id,
      timestamp: new Date().toISOString()
    };
    
    super(JSONRPC_ERRORS.MCP_NOT_FOUND_ERROR, message, data);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends McpError {
  constructor(limit, window, retryAfter = null) {
    const message = `Rate limit exceeded: ${limit} requests per ${window}`;
    const data = {
      limit,
      window,
      timestamp: new Date().toISOString()
    };
    
    if (retryAfter) data.retryAfter = retryAfter;
    
    super(JSONRPC_ERRORS.MCP_RATE_LIMIT_ERROR, message, data);
  }
}

/**
 * Converts standard JavaScript errors to JSON-RPC format
 */
export function convertToJsonRpcError(error, context = null) {
  // If already a JSON-RPC error, return as-is
  if (error instanceof McpError) {
    return error.toJsonRpc();
  }
  
  // Handle common error types
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return createJsonRpcError(
      JSONRPC_ERRORS.INTERNAL_ERROR,
      'Internal server error',
      process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack,
        context
      } : { context }
    );
  }
  
  if (error.message && error.message.includes('not found')) {
    return createJsonRpcError(
      JSONRPC_ERRORS.MCP_NOT_FOUND_ERROR,
      error.message,
      { context }
    );
  }
  
  if (error.message && error.message.includes('validation')) {
    return createJsonRpcError(
      JSONRPC_ERRORS.MCP_VALIDATION_ERROR,
      error.message,
      { context }
    );
  }
  
  if (error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'))) {
    return createJsonRpcError(
      JSONRPC_ERRORS.MCP_TIMEOUT_ERROR,
      'Request timeout',
      { context, originalMessage: error.message }
    );
  }
  
  if (error.message && error.message.includes('network')) {
    return createJsonRpcError(
      JSONRPC_ERRORS.MCP_NETWORK_ERROR,
      error.message,
      { context }
    );
  }
  
  // Default server error
  return createJsonRpcError(
    JSONRPC_ERRORS.SERVER_ERROR,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? {
      originalError: error.message,
      stack: error.stack,
      context
    } : { context }
  );
}

/**
 * Helper to create proper MCP tool response with JSON-RPC error
 */
export function createErrorResponse(error, toolName = null) {
  const jsonRpcError = convertToJsonRpcError(error, toolName);
  
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${jsonRpcError.message}`
      }
    ],
    isError: true,
    data: {
      success: false,
      error: jsonRpcError
    }
  };
}