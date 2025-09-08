/**
 * Input validation utilities for API endpoints
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'blocked'];

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validate a UUID string
 */
export function validateUUID(value, fieldName = 'ID') {
  if (!value) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase());
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName.toLowerCase());
  }
  if (!UUID_REGEX.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`, fieldName.toLowerCase());
  }
  return value;
}

/**
 * Validate task status
 */
export function validateStatus(status, fieldName = 'status') {
  if (status && !VALID_STATUSES.includes(status)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${VALID_STATUSES.join(', ')}`, 
      fieldName
    );
  }
  return status;
}

/**
 * Validate string with length constraints
 */
export function validateString(value, fieldName, options = {}) {
  const { required = false, minLength = 0, maxLength = Infinity, trim = true } = options;
  
  if (required && (!value || value.trim().length === 0)) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase());
  }
  
  if (!value) {
    return null;
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName.toLowerCase());
  }
  
  const processedValue = trim ? value.trim() : value;
  
  if (processedValue.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`, 
      fieldName.toLowerCase()
    );
  }
  
  if (processedValue.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters long`, 
      fieldName.toLowerCase()
    );
  }
  
  return processedValue;
}

/**
 * Validate array of strings (for todos)
 */
export function validateStringArray(value, fieldName, options = {}) {
  const { maxItems = 100, maxItemLength = 500 } = options;
  
  if (!value) {
    return [];
  }
  
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName.toLowerCase());
  }
  
  if (value.length > maxItems) {
    throw new ValidationError(
      `${fieldName} can have at most ${maxItems} items`, 
      fieldName.toLowerCase()
    );
  }
  
  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new ValidationError(
        `${fieldName}[${index}] must be a string`, 
        fieldName.toLowerCase()
      );
    }
    
    const trimmed = item.trim();
    if (trimmed.length === 0) {
      throw new ValidationError(
        `${fieldName}[${index}] cannot be empty`, 
        fieldName.toLowerCase()
      );
    }
    
    if (trimmed.length > maxItemLength) {
      throw new ValidationError(
        `${fieldName}[${index}] must be at most ${maxItemLength} characters long`, 
        fieldName.toLowerCase()
      );
    }
    
    return trimmed;
  });
}

/**
 * Validate task creation input
 */
export function validateCreateTask(data) {
  const errors = {};
  
  try {
    const title = validateString(data.title, 'Title', { 
      required: true, 
      minLength: 1, 
      maxLength: 200 
    });
    
    const description = validateString(data.description, 'Description', { 
      maxLength: 1000 
    });
    
    const todos = validateStringArray(data.todos, 'Todos', { 
      maxItems: 50, 
      maxItemLength: 500 
    });
    
    const status = validateStatus(data.status);
    
    return { title, description, todos, status };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid input data');
  }
}

/**
 * Validate task update input
 */
export function validateUpdateTask(data) {
  const errors = {};
  
  try {
    const updates = {};
    
    if ('title' in data) {
      updates.title = validateString(data.title, 'Title', { 
        required: true, 
        minLength: 1, 
        maxLength: 200 
      });
    }
    
    if ('description' in data) {
      updates.description = validateString(data.description, 'Description', { 
        maxLength: 1000 
      });
    }
    
    if ('status' in data) {
      updates.status = validateStatus(data.status);
    }
    
    return updates;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid update data');
  }
}

/**
 * Express middleware for handling validation errors
 */
export function validationErrorHandler(error, req, res, next) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      field: error.field
    });
  }
  next(error);
}