/**
 * useFiltering - Reusable hook for local filtering and searching of data
 * Provides consistent client-side filtering patterns
 */

import { useState, useMemo, useCallback } from 'react';

export interface FilteringOptions<TData, TFilters> {
  /** Initial filter values */
  initialFilters?: TFilters;
  /** Custom filter function */
  filterFn?: (item: TData, filters: TFilters, search: string) => boolean;
  /** Fields to search in (for default search) */
  searchFields?: (keyof TData)[];
}

export interface FilteringReturn<TData, TFilters> {
  filteredData: TData[];
  search: string;
  filters: TFilters;
  setSearch: (search: string) => void;
  setFilters: (filters: TFilters) => void;
  updateFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Default search function that searches in specified fields
 */
function defaultSearch<TData>(
  item: TData,
  search: string,
  searchFields: (keyof TData)[]
): boolean {
  if (!search) return true;
  
  const searchLower = search.toLowerCase();
  
  return searchFields.some(field => {
    const value = item[field];
    if (typeof value === 'string') {
      return value.toLowerCase().includes(searchLower);
    }
    if (typeof value === 'number') {
      return value.toString().includes(search);
    }
    return false;
  });
}

/**
 * Generic hook for local filtering and searching
 */
export function useFiltering<TData, TFilters extends Record<string, unknown> = Record<string, unknown>>(
  data: TData[],
  options: FilteringOptions<TData, TFilters> = {}
): FilteringReturn<TData, TFilters> {
  const {
    initialFilters = {} as TFilters,
    filterFn,
    searchFields = [],
  } = options;

  const [search, setSearch] = useState('');
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply custom filter function if provided
      if (filterFn) {
        return filterFn(item, filters, search);
      }
      
      // Default: apply search only
      return defaultSearch(item, search, searchFields);
    });
  }, [data, filters, search, filterFn, searchFields]);

  // Set full filters object
  const setFilters = useCallback((newFilters: TFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset to initial filters
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearch('');
  }, [initialFilters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (search) return true;
    return Object.entries(filters).some(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (value === 'all') return false;
      return true;
    });
  }, [search, filters]);

  return {
    filteredData,
    search,
    filters,
    setSearch,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}

/**
 * Pre-configured filtering for common entity patterns
 */
export function useStatusFiltering<TData extends { status: string }>(
  data: TData[],
  searchFields: (keyof TData)[]
) {
  return useFiltering<TData, { status: string }>(data, {
    initialFilters: { status: 'all' },
    searchFields,
    filterFn: (item, filters, search) => {
      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      // Search
      return defaultSearch(item, search, searchFields);
    },
  });
}
