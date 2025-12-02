// useProducts Hook - Clean, focused state management (Single Responsibility)

import { useState, useEffect, useCallback, useMemo } from 'react';
import { productGateway } from '@/services/product.gateway';
import { Product, ProductView, CreateProductDTO, UpdateProductDTO, ProductFilters, ProductStats } from '@/types/product.types';
import { toProductViews, toCreateDTO, toUpdateDTO, calculateStats } from '@/lib/product/transformers';
import { filterProducts } from '@/lib/product/filters';
import { errorHandler } from '@/lib/api/error-handler';
import { useToast } from '@/hooks/use-toast';

interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsState {
  products: ProductView[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

export const useProductsRefactored = (options: UseProductsOptions = {}) => {
  const { toast } = useToast();
  const { initialPage = 1, initialLimit = 50, autoFetch = true } = options;

  // State
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    pagination: { page: initialPage, limit: initialLimit, total: 0, totalPages: 0 },
  });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [localFilters, setLocalFilters] = useState({ status: 'all', stockStatus: 'all' });

  // Computed
  const filteredProducts = useMemo(() => 
    filterProducts(state.products, localFilters),
    [state.products, localFilters]
  );

  const stats = useMemo(() => 
    calculateStats(state.products),
    [state.products]
  );

  // Actions
  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const response = await productGateway.getAll({
      page: state.pagination.page,
      limit: state.pagination.limit,
      search,
      filters,
    });

    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        loading: false,
        products: toProductViews(response.data.data),
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        },
      }));
    } else {
      const error = response.error || 'Failed to fetch products';
      setState(prev => ({ ...prev, loading: false, error }));
      errorHandler.handle('SERVER_ERROR', error);
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [state.pagination.page, state.pagination.limit, search, filters, toast]);

  const create = useCallback(async (data: Partial<ProductView>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true }));
    
    const response = await productGateway.create(toCreateDTO(data));
    
    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product created' });
      await fetch();
      return true;
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to create', variant: 'destructive' });
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [fetch, toast]);

  const update = useCallback(async (id: string, data: Partial<ProductView>): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true }));
    
    const response = await productGateway.update(toUpdateDTO(id, data));
    
    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product updated' });
      await fetch();
      return true;
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to update', variant: 'destructive' });
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [fetch, toast]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true }));
    
    const response = await productGateway.delete(id);
    
    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product deleted' });
      await fetch();
      return true;
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to delete', variant: 'destructive' });
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [fetch, toast]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  const updateLocalFilters = useCallback((key: 'status' | 'stockStatus', value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page } }));
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [state.pagination.page, state.pagination.limit, search, filters]);

  return {
    // State
    products: filteredProducts,
    allProducts: state.products,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    search,
    filters,
    localFilters,
    stats,

    // Actions
    fetch,
    create,
    update,
    remove,
    updateSearch,
    updateFilters,
    updateLocalFilters,
    updatePage,

    // Computed
    hasProducts: state.products.length > 0,
    isEmpty: !state.loading && state.products.length === 0,
  };
};
