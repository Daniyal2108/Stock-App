import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandler';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showError?: boolean;
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    customOptions?: UseApiOptions
  ) => {
    const opts = { ...options, ...customOptions };
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      opts.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      opts.onError?.(errorMessage);
      
      if (opts.showError !== false) {
        console.error('API Error:', errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
};

