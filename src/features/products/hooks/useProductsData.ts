// useProductsData - Data fetching and state management
// Uses the consolidated product gateway

import { useState, useEffect, useCallback, useMemo } from 'react';
import { productGateway } from '@/services/product.gateway';
import { Product, ProductFilters, ProductStats, ProductView } from '@/types/product.types';
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

// Transform Product to ProductView
const toProductView = (product: Product): ProductView => ({
  id: product.id,
  name: product.name,
  nameAr: product.nameAr || product.name,
  sku: product.sku,
  category: product.category,
  price: product.price,
  stock: product.stock,
  status: product.status,
  image: product.image,
  variants: product.variants?.map(v => v.name),
  barcode: product.barcode,
});

export const useProductsData = (options: UseProductsDataOptions = {}) => {
  const { toast } = useToast();
  const { initialPage = 1, initialLimit = 50, autoFetch = true } = options;

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
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
  const [stats, setStats] = useState<ProductStats | null>(null);

  // Transform to ProductView
  const allProducts = useMemo(() => rawProducts.map(toProductView), [rawProducts]);

  // Apply local filters for quick UI filtering without API calls
  const products = useMemo(() => {
    let result = [...allProducts];
    
    if (localFilters.status !== 'all') {
      result = result.filter(p => p.status === localFilters.status);
    }
    
    if (localFilters.stockStatus !== 'all') {
      result = result.filter(p => {
        const product = rawProducts.find(rp => rp.id === p.id);
        if (!product) return true;
        if (localFilters.stockStatus === 'in-stock') return product.stock > product.min_stock;
        if (localFilters.stockStatus === 'low-stock') return product.stock > 0 && product.stock <= product.min_stock;
        if (localFilters.stockStatus === 'out-of-stock') return product.stock === 0;
        return true;
      });
    }
    
    return result;
  }, [allProducts, localFilters, rawProducts]);

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
      setRawProducts(response.data.data);
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

  const fetchStats = useCallback(async () => {
    const response = await productGateway.getStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
  }, []);

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
      fetchStats();
    }
  }, [pagination.page, pagination.limit, search, filters, autoFetch]);

  return {
    products,
    allProducts,
    loading,
    error,
    pagination,
    search,
    filters,
    localFilters,
    stats,
    updateSearch,
    updateFilters,
    updateLocalFilters,
    updatePagination,
    refresh: fetch,
    refreshStats: fetchStats,
  };
};

export default useProductsData;
