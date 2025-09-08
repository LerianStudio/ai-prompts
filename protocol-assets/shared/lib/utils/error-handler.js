import { createLogger } from '../logger.js';

/**
 * Standard error classes for consistent error handling
 */
export class BaseError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends BaseError {
  constructor(field, message, value = null) {
    super(`Validation failed for ${field}: ${message}`, 400, 'VALIDATION_ERROR', {
      field,
      value: typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value
    });
  }
}

export class NotFoundError extends BaseError {
  constructor(resource, id = null) {
    super(`${resource} not found${id ? ` with id: ${id}` : ''}`, 404, 'NOT_FOUND', { resource, id });
  }
}

export class ConflictError extends BaseError {
  constructor(resource, message) {
    super(`Conflict with ${resource}: ${message}`, 409, 'CONFLICT', { resource });
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class RateLimitError extends BaseError {
  constructor(limit, window, retryAfter = null) {
    super(`Rate limit exceeded: ${limit} requests per ${window}`, 429, 'RATE_LIMIT', {
      limit,
      window,
      retryAfter
    });
  }
}

/**
 * Centralized error handling middleware factory
 */
export function createErrorHandler(serviceName = 'unknown-service') {
  const logger = createLogger(`${serviceName}-error-handler`);

  return (error, req, res, next) => {
    // Generate unique error ID for tracking
    const errorId = Math.random().toString(36).substring(2, 11);
    
    // Determine if this is a known error type
    const isKnownError = error instanceof BaseError;
    const statusCode = isKnownError ? error.statusCode : 500;
    const errorCode = isKnownError ? error.code : 'INTERNAL_ERROR';
    
    // Log error with structured context
    const logContext = {
      errorId,
      code: errorCode,
      message: error.message,
      statusCode,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.socket.remoteAddress,
      timestamp: new Date().toISOString()
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      logContext.stack = error.stack;
    }

    // Add error context if available
    if (isKnownError && error.context) {
      logContext.context = error.context;
    }

    // Log at appropriate level
    if (statusCode >= 500) {
      logger.error('Server error occurred', logContext);
    } else {
      logger.warn('Client error occurred', logContext);
    }

    // Build response
    const errorResponse = {
      error: true,
      code: errorCode,
      message: getPublicErrorMessage(error, statusCode),
      errorId,
      timestamp: logContext.timestamp,
      path: req.path,
      method: req.method
    };

    // Add details for client errors in development
    if (statusCode < 500 && process.env.NODE_ENV === 'development' && isKnownError) {
      errorResponse.details = error.context;
    }

    // Set retry-after header for rate limit errors
    if (error instanceof RateLimitError && error.context.retryAfter) {
      res.set('Retry-After', error.context.retryAfter.toString());
    }

    res.status(statusCode).json(errorResponse);
  };
}

/**
 * Get a safe error message to return to clients
 */
function getPublicErrorMessage(error, statusCode) {
  // For client errors (4xx), return the actual message
  if (statusCode >= 400 && statusCode < 500) {
    return error.message;
  }

  // For server errors (5xx), return generic message in production
  if (process.env.NODE_ENV === 'production') {
    return 'An internal server error occurred. Please try again later.';
  }

  return error.message;
}

/**
 * Async error wrapper for route handlers
 * Eliminates need for try/catch in every route
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation helper for request data
 */
export function validateRequired(data, fields, prefix = '') {
  const missing = [];
  
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(
      `${prefix}${missing.join(', ')}`,
      'Required fields are missing',
      missing
    );
  }
}

/**
 * Length validation helper
 */
export function validateLength(value, field, min = 0, max = Infinity) {
  if (typeof value !== 'string') {
    throw new ValidationError(field, 'Must be a string', typeof value);
  }
  
  if (value.length < min) {
    throw new ValidationError(field, `Must be at least ${min} characters`, value.length);
  }
  
  if (value.length > max) {
    throw new ValidationError(field, `Must not exceed ${max} characters`, value.length);
  }
}

/**
 * Type validation helper
 */
export function validateType(value, field, expectedType) {
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  
  if (actualType !== expectedType) {
    throw new ValidationError(field, `Expected ${expectedType}, got ${actualType}`, actualType);
  }
}