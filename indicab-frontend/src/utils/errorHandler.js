import { logger } from './logger';
import { captureException, getSentry } from '../config/sentry';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Custom error class for network errors
 */
export class NetworkError extends Error {
  constructor(message = 'Network connection error') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Parse error response from various API formats
 */
const parseErrorResponse = (error) => {
  if (!error) return 'An unknown error occurred';

  // Axios error
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || error.message;
    return {
      message,
      status,
      data,
    };
  }

  // Network error
  if (error.request && !error.response) {
    return {
      message: 'Network error: Unable to reach the server',
      status: 0,
      isNetworkError: true,
    };
  }

  // Client setup error
  if (error.message) {
    return {
      message: error.message,
      status: null,
    };
  }

  return {
    message: 'An unknown error occurred',
    status: null,
  };
};

/**
 * Map HTTP status codes to user-friendly messages
 */
const getStatusMessage = (status) => {
  const statusMessages = {
    400: 'Invalid request. Please check your input.',
    401: 'Unauthorized. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'Conflict. This resource already exists or has been modified.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. The server is not responding.',
  };

  return statusMessages[status] || 'An error occurred. Please try again.';
};

/**
 * Handle API errors with logging and user-friendly messages
 */
export const handleApiError = (error, component = 'API', fallbackMessage = null) => {
  const { message, status, data, isNetworkError } = parseErrorResponse(error);

  // Log the error
  if (isNetworkError) {
    logger.error(component, message);
  } else {
    logger.logApiError('ERROR', component, status, error);
  }

  // Send error to Sentry if critical (5xx errors or network errors)
  if ((status && status >= 500) || isNetworkError) {
    captureException(error, {
      component,
      status,
      isNetworkError,
    });
  }

  // Return structured error object
  return {
    message: fallbackMessage || message || getStatusMessage(status),
    status,
    originalError: error,
    data,
    isNetworkError: isNetworkError || false,
  };
};

/**
 * Handle validation errors
 */
export const handleValidationError = (validationErrors, component = 'VALIDATION') => {
  logger.warn(component, 'Validation errors', validationErrors);
  
  const errors = {};
  if (Array.isArray(validationErrors)) {
    validationErrors.forEach((err) => {
      errors[err.field] = err.message;
    });
  } else if (typeof validationErrors === 'object') {
    Object.assign(errors, validationErrors);
  }

  return {
    message: 'Please check your input and try again.',
    errors,
  };
};

/**
 * Safe async operation wrapper with error handling
 */
export const safeAsync = async (fn, component = 'ASYNC', fallbackResult = null) => {
  try {
    logger.logAsyncOperation(component, 'START');
    const result = await fn();
    logger.logAsyncOperation(component, 'SUCCESS', 'Operation completed successfully');
    return result;
  } catch (error) {
    logger.logAsyncOperation(component, 'ERROR', error.message);
    const handled = handleApiError(error, component);
    
    if (fallbackResult !== null) {
      return fallbackResult;
    }
    
    throw new ApiError(handled.message, handled.status, handled.data);
  }
};

/**
 * Retry logic for failed operations
 */
export const retryAsync = async (
  fn,
  maxRetries = 3,
  delayMs = 1000,
  component = 'RETRY'
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(component, `Attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        logger.error(component, `Failed after ${maxRetries} attempts`, error);
        throw error;
      }

      logger.warn(component, `Attempt ${attempt} failed, retrying in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

/**
 * Format error for display to user
 */
export const formatErrorForUser = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return 'An error occurred. Please try again.';
};

export default {
  ApiError,
  ValidationError,
  NetworkError,
  handleApiError,
  handleValidationError,
  safeAsync,
  retryAsync,
  formatErrorForUser,
};
