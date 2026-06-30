import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../utils/logger';

describe('logger', () => {
  let consoleDebugSpy;
  let consoleInfoSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('should not call console.debug in non-development mode', () => {
      logger.debug('TestComponent', 'debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should not log debug with data in non-development mode', () => {
      logger.debug('TestComponent', 'debug message', { key: 'value' });
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should call console.info with formatted message and component', () => {
      logger.info('UserService', 'User created');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const callArg = consoleInfoSpy.mock.calls[0][0];
      expect(callArg).toContain('[INFO]');
      expect(callArg).toContain('[UserService]');
      expect(callArg).toContain('User created');
      expect(callArg).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('should include data as second argument when provided', () => {
      const data = { userId: 1 };
      logger.info('Test', 'Message', data);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message'),
        data,
      );
    });

    it('should log without data when data is null', () => {
      logger.info('Test', 'Message', null);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message'),
      );
    });
  });

  describe('warn', () => {
    it('should call console.warn with formatted message', () => {
      logger.warn('Auth', 'Token expired');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const arg = consoleWarnSpy.mock.calls[0][0];
      expect(arg).toContain('[WARN]');
      expect(arg).toContain('[Auth]');
      expect(arg).toContain('Token expired');
    });

    it('should pass data as second argument', () => {
      const data = { retry: true };
      logger.warn('Test', 'Warning', data);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning'),
        data,
      );
    });
  });

  describe('error', () => {
    it('should call console.error with formatted message', () => {
      logger.error('DbService', 'Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const arg = consoleErrorSpy.mock.calls[0][0];
      expect(arg).toContain('[ERROR]');
      expect(arg).toContain('[DbService]');
      expect(arg).toContain('Connection failed');
    });

    it('should pass error object as second argument', () => {
      const err = new Error('DB down');
      logger.error('Test', 'Error occurred', err);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred'),
        err,
      );
    });

    it('should handle null error parameter', () => {
      logger.error('Test', 'Error message', null);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
      );
    });
  });

  describe('logRequest', () => {
    it('should call logger.debug with API component and method+url format', () => {
      const debugSpy = vi.spyOn(logger, 'debug');
      logger.logRequest('GET', '/api/users');
      expect(debugSpy).toHaveBeenCalledWith('API', 'GET /api/users', null);
      debugSpy.mockRestore();
    });

    it('should pass config as data when provided', () => {
      const debugSpy = vi.spyOn(logger, 'debug');
      const config = { headers: { Authorization: 'Bearer x' } };
      logger.logRequest('POST', '/api/login', config);
      expect(debugSpy).toHaveBeenCalledWith('API', 'POST /api/login', config);
      debugSpy.mockRestore();
    });
  });

  describe('logResponse', () => {
    it('should call logger.info with status', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      logger.logResponse('GET', '/api/users', 200);
      expect(infoSpy).toHaveBeenCalledWith(
        'API',
        'GET /api/users - Status: 200',
        null,
      );
      infoSpy.mockRestore();
    });

    it('should pass data when provided', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      const data = { count: 5 };
      logger.logResponse('GET', '/api/users', 200, data);
      expect(infoSpy).toHaveBeenCalledWith(
        'API',
        'GET /api/users - Status: 200',
        data,
      );
      infoSpy.mockRestore();
    });
  });

  describe('logApiError', () => {
    it('should call logger.error with API component and status', () => {
      const errorSpy = vi.spyOn(logger, 'error');
      const err = new Error('Timeout');
      logger.logApiError('GET', '/api/bookings', 500, err);
      expect(errorSpy).toHaveBeenCalledWith(
        'API',
        'GET /api/bookings - Status: 500',
        err,
      );
      errorSpy.mockRestore();
    });
  });

  describe('logAsyncOperation', () => {
    it('should call logger.info for START status', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      logger.logAsyncOperation('FetchUsers', 'START');
      expect(infoSpy).toHaveBeenCalledWith(
        'ASYNC',
        'Starting: FetchUsers',
        null,
      );
      infoSpy.mockRestore();
    });

    it('should call logger.info for SUCCESS status', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      logger.logAsyncOperation('FetchUsers', 'SUCCESS', 'Completed');
      expect(infoSpy).toHaveBeenCalledWith(
        'ASYNC',
        'Completed: FetchUsers - Completed',
        null,
      );
      infoSpy.mockRestore();
    });

    it('should call logger.error for ERROR status', () => {
      const errorSpy = vi.spyOn(logger, 'error');
      logger.logAsyncOperation('FetchUsers', 'ERROR', 'Failed');
      expect(errorSpy).toHaveBeenCalledWith(
        'ASYNC',
        'Failed: FetchUsers - Failed',
        null,
      );
      errorSpy.mockRestore();
    });

    it('should pass details as data parameter', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      const details = { duration: 120 };
      logger.logAsyncOperation('Op', 'SUCCESS', 'Done', details);
      expect(infoSpy).toHaveBeenCalledWith(
        'ASYNC',
        expect.stringContaining('Op'),
        details,
      );
      infoSpy.mockRestore();
    });
  });

  describe('logAction', () => {
    it('should not call console.debug in non-development mode', () => {
      logger.logAction('admin/createUser', { name: 'Test' });
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('should include ISO timestamp in all log messages', () => {
      logger.info('Test', 'msg');
      const arg = consoleInfoSpy.mock.calls[0][0];
      expect(arg).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include level, component and message in output', () => {
      logger.warn('TestComp', 'Something is off');
      const arg = consoleWarnSpy.mock.calls[0][0];
      expect(arg).toContain('[WARN]');
      expect(arg).toContain('[TestComp]');
      expect(arg).toContain('Something is off');
    });
  });

  describe('edge cases', () => {
    it('should handle empty component name', () => {
      logger.info('', 'message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle null component', () => {
      logger.error(null, 'message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle undefined message gracefully', () => {
      logger.warn('Test', undefined);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });
});
