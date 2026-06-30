import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start in idle state', () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should execute async function on mount when immediate is true (default)', async () => {
    const asyncFn = vi.fn().mockResolvedValue('loaded');
    const { result } = renderHook(() => useAsync(asyncFn));
    expect(result.current.loading).toBe(true);
    expect(result.current.status).toBe('pending');
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current.data).toBe('loaded');
    expect(result.current.loading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should NOT execute on mount when immediate is false', () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    expect(asyncFn).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('should set data on successful execution', async () => {
    const asyncFn = vi.fn().mockResolvedValue([1, 2, 3]);
    const { result } = renderHook(() => useAsync(asyncFn, false));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set error on failed execution', async () => {
    const testError = new Error('Network failure');
    const asyncFn = vi.fn().mockRejectedValue(testError);
    const { result } = renderHook(() => useAsync(asyncFn, false));
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // expected
      }
    });
    expect(result.current.error).toBe(testError);
    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('should throw error on failed execution for caller to handle', async () => {
    const testError = new Error('Rejected');
    const asyncFn = vi.fn().mockRejectedValue(testError);
    const { result } = renderHook(() => useAsync(asyncFn, false));
    let caught;
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBe(testError);
  });

  it('should set loading state during execution', async () => {
    let resolveFn;
    const asyncFn = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFn = resolve; }),
    );
    const { result } = renderHook(() => useAsync(asyncFn, false));
    expect(result.current.loading).toBe(false);
    let execPromise;
    act(() => {
      execPromise = result.current.execute();
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.status).toBe('pending');
    await act(async () => {
      resolveFn('done');
      await execPromise;
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('success');
  });

  it('should clear previous data and error before each execution', async () => {
    const asyncFn = vi.fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockResolvedValueOnce('second success');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    await act(async () => {
      try { await result.current.execute(); } catch (e) { /* expected */ }
    });
    expect(result.current.status).toBe('error');
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('second success');
    expect(result.current.error).toBeNull();
  });

  it('should pass arguments to the async function', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    await act(async () => {
      await result.current.execute('arg1', { key: 'val' });
    });
    expect(asyncFn).toHaveBeenCalledWith('arg1', { key: 'val' });
  });

  it('should return the async function result from execute', async () => {
    const asyncFn = vi.fn().mockResolvedValue('returnVal');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    let returned;
    await act(async () => {
      returned = await result.current.execute();
    });
    expect(returned).toBe('returnVal');
  });

  it('should expose isIdle, isSuccess, isError boolean flags', async () => {
    const asyncFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsync(asyncFn, false));
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should update execute callback reference when asyncFunction changes', async () => {
    const fn1 = vi.fn().mockResolvedValue('first');
    const { result, rerender } = renderHook(
      ({ fn }) => useAsync(fn, false),
      { initialProps: { fn: fn1 } },
    );
    const execute1 = result.current.execute;
    const fn2 = vi.fn().mockResolvedValue('second');
    rerender({ fn: fn2 });
    expect(result.current.execute).not.toBe(execute1);
  });
});
