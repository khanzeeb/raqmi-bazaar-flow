/**
 * usePaginatedData - Reusable hook for fetching paginated data with search and filters
 * Provides consistent data fetching patterns across all list views
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedDataOptions<TFilters = Record<string, unknown>> {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialFilters?: TFilters;
  autoFetch?: boolean;
}

export interface PaginatedDataReturn<TData, TFilters> {
  // Data
  data: TData[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: Pagination;
  
  // Search & Filters
  search: string;
  filters: TFilters;
  
  // Actions
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  setSearch: (search: string) => void;
  setFilters: (filters: TFilters) => void;
  updateFilters: (updates: Partial<TFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Computed
  hasData: boolean;
  isEmpty: boolean;
}

/**
 * Generic hook for paginated data fetching with consistent patterns
 */
export function usePaginatedData<TData, TFilters = Record<string, unknown>>(
  fetcher: (params: QueryParams & { filters?: TFilters }) => Promise<ApiResponse<PaginatedResponse<TData>>>,
  options: PaginatedDataOptions<TFilters> = {}
): PaginatedDataReturn<TData, TFilters> {
  const {
    initialPage = 1,
    initialLimit = 50,
    initialSearch = '',
    initialFilters = {} as TFilters,
    autoFetch = true,
  } = options;

  // State
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);

  // Fetch function
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        filters,
      });

      if (response.success && response.data) {
        setData(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data!.total,
          totalPages: response.data!.totalPages,
        }));
      } else {
        const errorMsg = response.error || 'Failed to fetch data';
        setError(errorMsg);
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [fetcher, pagination.page, pagination.limit, search, filters]);

  // Search with page reset
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Filters with page reset
  const setFilters = useCallback((newFilters: TFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Partial filter updates
  const updateFilters = useCallback((updates: Partial<TFilters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Pagination controls
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Computed values
  const hasData = data.length > 0;
  const isEmpty = !loading && data.length === 0;

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [pagination.page, pagination.limit, search, filters, autoFetch]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Pagination
    pagination,
    
    // Search & Filters
    search,
    filters,
    
    // Actions
    fetch,
    refresh: fetch,
    setSearch,
    setFilters,
    updateFilters,
    setPage,
    setLimit,
    
    // Computed
    hasData,
    isEmpty,
  };
}
