import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api';

// Generic hook state
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook options
interface UseApiOptions {
  immediate?: boolean; // Fetch on mount
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

/**
 * Generic hook for API calls
 * Handles loading, error states, and data caching
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  
  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'An error occurred';
        setState({ data: null, loading: false, error: errorMsg });
        onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMsg });
      onError?.(errorMsg);
      return null;
    }
  }, [apiCall, onSuccess, onError]);
  
  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);
  
  const refetch = useCallback(() => {
    return execute();
  }, [execute]);
  
  return {
    ...state,
    refetch,
    execute,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * Does not auto-execute, waits for manual trigger
 */
export function useMutation<TData, TPayload = unknown>(
  mutationFn: (payload: TPayload) => Promise<ApiResponse<TData>>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const mutate = useCallback(async (payload: TPayload) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await mutationFn(payload);
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'An error occurred';
        setState({ data: null, loading: false, error: errorMsg });
        onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMsg });
      onError?.(errorMsg);
      return null;
    }
  }, [mutationFn, onSuccess, onError]);
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  return {
    ...state,
    mutate,
    reset,
    isLoading: state.loading,
  };
}

/**
 * Hook for paginated data
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ data: T[]; pagination: { total: number; totalPages: number } }>,
  options: { limit?: number; immediate?: boolean } = {}
) {
  const { limit = 20, immediate = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(immediate);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await apiCall(pageNum, limit);
      
      if (append) {
        setData(prev => [...prev, ...response.data]);
      } else {
        setData(response.data);
      }
      
      setPage(pageNum);
      setTotal(response.pagination.total);
      setHasMore(pageNum < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiCall, limit]);
  
  useEffect(() => {
    if (immediate) {
      fetchPage(1);
    }
  }, [immediate]);
  
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(page + 1, true);
    }
  }, [loadingMore, hasMore, page, fetchPage]);
  
  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);
  
  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    page,
    loadMore,
    refresh,
  };
}

export default useApi;
