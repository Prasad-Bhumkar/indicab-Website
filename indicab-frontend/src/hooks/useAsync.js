import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing async operations with loading, error, and success states
 * Simplifies handling of async requests across components
 * 
 * Usage:
 * const { data, loading, error, execute } = useAsync(asyncFunction);
 * 
 * const handleClick = async () => {
 *   const result = await execute(args);
 * };
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Execute async function
  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (err) {
        setError(err);
        setStatus('error');
        throw err;
      }
    },
    [asyncFunction]
  );

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    loading: status === 'pending',
    error,
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
  };
};

export default useAsync;
