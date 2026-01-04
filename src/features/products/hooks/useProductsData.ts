// useProductsData - Data fetching and state management
import { useState, useEffect, useCallback, useMemo } from 'react';
import { productGateway } from '@/services/product.gateway';
import { ProductView, ProductFilters } from '@/types/product.types';
import { toProductViews } from '@/lib/product/transformers';
import { filterProducts } from '@/lib/product/filters';
import { errorHandler } from '@/lib/api/error-handler';
import { useToast } from '@/hooks/use-toast';

interface UseProductsDataOptions {
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

export const useProductsData = (options: UseProductsDataOptions = {}) => {
  const { toast } = useToast();
  const { initialPage = 1, initialLimit = 50, autoFetch = true } = options;

  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [localFilters, setLocalFilters] = useState({ status: 'all', stockStatus: 'all' });

  const filteredProducts = useMemo(
    () => filterProducts(products, localFilters),
    [products, localFilters]
  );

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await productGateway.getAll({
      page: pagination.page,
      limit: pagination.limit,
      search,
      filters,
    });

    if (response.success && response.data) {
      setProducts(toProductViews(response.data.data));
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } else {
      const errorMsg = response.error || 'Failed to fetch products';
      setError(errorMsg);
      errorHandler.handle('SERVER_ERROR', errorMsg);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
    
    setLoading(false);
  }, [pagination.page, pagination.limit, search, filters, toast]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateLocalFilters = useCallback((key: 'status' | 'stockStatus', value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updatePagination = useCallback((updates: Partial<Pagination>) => {
    setPagination(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [pagination.page, pagination.limit, search, filters]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    pagination,
    search,
    filters,
    localFilters,
    updateSearch,
    updateFilters,
    updateLocalFilters,
    updatePagination,
    refresh: fetch,
  };
};
