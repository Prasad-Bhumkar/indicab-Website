/**
 * Logging utility for consistent logging across the application
 * Supports different log levels: DEBUG, INFO, WARN, ERROR
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Default log level (change to DEBUG for development)
const CURRENT_LOG_LEVEL = import.meta.env.MODE === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * Format timestamp for log messages
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

/**
 * Format log message with context
 */
const formatMessage = (level, component, message, data = null) => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}] [${component}]`;
  
  if (data) {
    return `${prefix} ${message}`, data;
  }
  return `${prefix} ${message}`;
};

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  /**
   * Debug level logging - lowest priority
   */
  debug: (component, message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      if (data) {
        console.debug(formatMessage('DEBUG', component, message), data);
      } else {
        console.debug(formatMessage('DEBUG', component, message));
      }
    }
  },

  /**
   * Info level logging - general information
   */
  info: (component, message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      if (data) {
        console.info(formatMessage('INFO', component, message), data);
      } else {
        console.info(formatMessage('INFO', component, message));
      }
    }
  },

  /**
   * Warn level logging - warnings and deprecated usage
   */
  warn: (component, message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      if (data) {
        console.warn(formatMessage('WARN', component, message), data);
      } else {
        console.warn(formatMessage('WARN', component, message));
      }
    }
  },

  /**
   * Error level logging - errors and exceptions
   */
  error: (component, message, error = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      if (error) {
        console.error(formatMessage('ERROR', component, message), error);
      } else {
        console.error(formatMessage('ERROR', component, message));
      }
    }
  },

  /**
   * Log API request
   */
  logRequest: (method, url, config = null) => {
    logger.debug('API', `${method} ${url}`, config);
  },

  /**
   * Log API response
   */
  logResponse: (method, url, status, data = null) => {
    logger.info('API', `${method} ${url} - Status: ${status}`, data);
  },

  /**
   * Log API error
   */
  logApiError: (method, url, status, error = null) => {
    logger.error('API', `${method} ${url} - Status: ${status}`, error);
  },

  /**
   * Log async operation
   */
  logAsyncOperation: (operation, status, message, details = null) => {
    if (status === 'START') {
      logger.info('ASYNC', `Starting: ${operation}`, details);
    } else if (status === 'SUCCESS') {
      logger.info('ASYNC', `Completed: ${operation} - ${message}`, details);
    } else if (status === 'ERROR') {
      logger.error('ASYNC', `Failed: ${operation} - ${message}`, details);
    }
  },

  /**
   * Log Redux action
   */
  logAction: (action, payload = null) => {
    if (import.meta.env.MODE === 'development') {
      logger.debug('REDUX', `Dispatching ${action}`, payload);
    }
  },
};

export default logger;
