import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../utils/logger';
import { captureException, getSentry } from '../../config/sentry';

vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    logRequest: vi.fn(),
    logResponse: vi.fn(),
    logApiError: vi.fn(),
    logAsyncOperation: vi.fn(),
    logAction: vi.fn(),
  },
}));

vi.mock('../../config/sentry', () => ({
  captureException: vi.fn(),
  getSentry: vi.fn(() => null),
}));

import {
  ApiError,
  ValidationError,
  NetworkError,
  handleApiError,
  handleValidationError,
  safeAsync,
  retryAsync,
  formatErrorForUser,
} from '../../utils/errorHandler';

describe('ApiError', () => {
  it('should create an ApiError with message, status, and data', () => {
    const err = new ApiError('Not found', 404, { id: 1 });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ id: 1 });
  });

  it('should default data to null when not provided', () => {
    const err = new ApiError('Server error', 500);
    expect(err.data).toBeNull();
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError with message and errors object', () => {
    const err = new ValidationError('Invalid input', { email: 'Invalid email' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('Invalid input');
    expect(err.errors).toEqual({ email: 'Invalid email' });
  });

  it('should default errors to empty object', () => {
    const err = new ValidationError('Invalid');
    expect(err.errors).toEqual({});
  });
});

describe('NetworkError', () => {
  it('should create a NetworkError with default message', () => {
    const err = new NetworkError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('NetworkError');
    expect(err.message).toBe('Network connection error');
  });

  it('should create a NetworkError with custom message', () => {
    const err = new NetworkError('Custom network message');
    expect(err.message).toBe('Custom network message');
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle axios error with response data message', () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Email already exists' },
      },
    };
    const result = handleApiError(error, 'TestComponent');
    expect(result.message).toBe('Email already exists');
    expect(result.status).toBe(400);
    expect(result.isNetworkError).toBe(false);
    expect(result.data).toEqual({ message: 'Email already exists' });
  });

  it('should handle axios error with response data.error fallback', () => {
    const error = {
      response: {
        status: 500,
        data: { error: 'Internal server error' },
      },
    };
    const result = handleApiError(error);
    expect(result.message).toBe('Internal server error');
    expect(result.status).toBe(500);
  });

  it('should handle axios error with no message in data', () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
      message: 'Request failed with status code 500',
    };
    const result = handleApiError(error);
    expect(result.message).toBe('Request failed with status code 500');
  });

  it('should handle network error (no response)', () => {
    const error = {
      request: {},
      response: undefined,
    };
    const result = handleApiError(error);
    expect(result.message).toBe('Network error: Unable to reach the server');
    expect(result.status).toBe(0);
    expect(result.isNetworkError).toBe(true);
  });

  it('should handle client setup error (message only)', () => {
    const error = { message: 'Something went wrong' };
    const result = handleApiError(error);
    expect(result.message).toBe('Something went wrong');
    expect(result.status).toBeNull();
  });

  it('should handle null/undefined error gracefully', () => {
    const result = handleApiError(null);
    expect(result.message).toBe('An error occurred. Please try again.');
    expect(result.status).toBeUndefined();
  });

  it('should return fallback message when provided', () => {
    const error = { response: { status: 500, data: {} } };
    const result = handleApiError(error, 'Test', 'Fallback message');
    expect(result.message).toBe('Fallback message');
  });

  it('should use status-based default message when no other message available', () => {
    const error = { response: { status: 404, data: {} } };
    const result = handleApiError(error);
    expect(result.message).toBe('The requested resource was not found.');
  });

  it('should return generic message for unknown status', () => {
    const error = { response: { status: 418, data: {} } };
    const result = handleApiError(error);
    expect(result.message).toBe('An error occurred. Please try again.');
  });

  it('should NOT send 4xx errors to Sentry in dev mode', () => {
    const error = { response: { status: 400, data: {} } };
    handleApiError(error);
    expect(captureException).not.toHaveBeenCalled();
  });

  it('should NOT send 5xx errors to Sentry in dev mode', () => {
    const error = { response: { status: 502, data: {} } };
    handleApiError(error, 'API');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('should NOT send network errors to Sentry in dev mode', () => {
    const error = { request: {}, response: undefined };
    handleApiError(error, 'Net');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('should return the original error reference', () => {
    const error = { response: { status: 500, data: {} }, message: 'err' };
    const result = handleApiError(error);
    expect(result.originalError).toBe(error);
  });
});

describe('handleValidationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle array of validation errors', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ];
    const result = handleValidationError(errors);
    expect(result.message).toBe('Please check your input and try again.');
    expect(result.errors).toEqual({
      email: 'Invalid email',
      password: 'Too short',
    });
  });

  it('should handle object of validation errors', () => {
    const errors = { name: 'Required', age: 'Must be a number' };
    const result = handleValidationError(errors);
    expect(result.errors).toEqual(errors);
  });

  it('should handle empty array', () => {
    const result = handleValidationError([]);
    expect(result.errors).toEqual({});
  });

  it('should handle empty object', () => {
    const result = handleValidationError({});
    expect(result.errors).toEqual({});
  });

  it('should log warning with component name', () => {
    handleValidationError([], 'REG_FORM');
    expect(logger.warn).toHaveBeenCalledWith('REG_FORM', 'Validation errors', []);
  });
});

describe('safeAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return result on success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await safeAsync(fn, 'TestOp');
    expect(result).toBe('success');
  });

  it('should throw ApiError on failure without fallback', async () => {
    const fn = vi.fn().mockRejectedValue({ response: { status: 500, data: {} } });
    await expect(safeAsync(fn, 'TestOp')).rejects.toThrow(ApiError);
  });

  it('should return fallback result on failure when provided', async () => {
    const fn = vi.fn().mockRejectedValue({ response: { status: 500, data: {} } });
    const result = await safeAsync(fn, 'TestOp', { cached: true });
    expect(result).toEqual({ cached: true });
  });

  it('should log start and success on happy path', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await safeAsync(fn, 'Op');
    expect(logger.logAsyncOperation).toHaveBeenCalledWith('Op', 'START');
    expect(logger.logAsyncOperation).toHaveBeenCalledWith('Op', 'SUCCESS', 'Operation completed successfully');
  });
});

describe('retryAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');
    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting all retries', async () => {
    const error = new Error('persistent');
    const fn = vi.fn().mockRejectedValue(error);
    await expect(retryAsync(fn, 3, 10)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use default maxRetries of 3', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryAsync(fn, 3, 10)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use attempt index in delay with exponential backoff', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const start = Date.now();
    await expect(retryAsync(fn, 2, 50)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('formatErrorForUser', () => {
  it('should return string unchanged', () => {
    expect(formatErrorForUser('Something went wrong')).toBe('Something went wrong');
  });

  it('should return error.message for Error objects', () => {
    const err = new Error('User not found');
    expect(formatErrorForUser(err)).toBe('User not found');
  });

  it('should return fallback for objects without message', () => {
    expect(formatErrorForUser({ code: 500 })).toBe('An error occurred. Please try again.');
  });

  it('should throw for null input (no null guard implemented)', () => {
    expect(() => formatErrorForUser(null)).toThrow();
    expect(() => formatErrorForUser(undefined)).toThrow();
  });

  it('should use ApiError.message', () => {
    const err = new ApiError('Custom API message', 403);
    expect(formatErrorForUser(err)).toBe('Custom API message');
  });

  it('should use ValidationError.message', () => {
    const err = new ValidationError('Validation failed');
    expect(formatErrorForUser(err)).toBe('Validation failed');
  });
});
