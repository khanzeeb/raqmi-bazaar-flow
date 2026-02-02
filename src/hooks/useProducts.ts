// useProducts - Consolidated hook using real product gateway
import { useState, useEffect, useCallback } from 'react';
import { productGateway } from '@/modules/product';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductFiltersType as ProductFilters, ProductStats } from '@/modules/product';
import { QueryParams, PaginatedResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: ProductFilters;
  initialSearch?: string;
  autoFetch?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { toast } = useToast();
  const { autoFetch = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: options.initialPage || 1,
    limit: options.initialLimit || 50,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ProductFilters>(options.initialFilters || {});
  const [search, setSearch] = useState(options.initialSearch || '');
  const [stats, setStats] = useState<ProductStats | null>(null);

  const fetchProducts = useCallback(async (params?: QueryParams & { filters?: ProductFilters }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productGateway.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...params,
        filters: { ...filters, ...params?.filters },
      });

      if (response.success && response.data) {
        setProducts(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      } else {
        setError(response.error || 'Failed to fetch products');
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch products',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters, toast]);

  const fetchStats = useCallback(async () => {
    const response = await productGateway.getStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
  }, []);

  const createProduct = useCallback(async (productData: CreateProductDTO): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.create(productData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product created successfully',
        });
        await fetchProducts(); // Refresh the list
        await fetchStats();
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create product',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchStats, toast]);

  const updateProduct = useCallback(async (productData: UpdateProductDTO): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.update(productData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product updated successfully',
        });
        await fetchProducts(); // Refresh the list
        await fetchStats();
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update product',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchStats, toast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.delete(id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product deleted successfully',
        });
        await fetchProducts(); // Refresh the list
        await fetchStats();
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete product',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchStats, toast]);

  const updateStock = useCallback(async (id: string, stock: number, reason?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.updateStock(id, { stock, reason });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Stock updated successfully',
        });
        await fetchProducts();
        await fetchStats();
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update stock',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchStats, toast]);

  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const response = await productGateway.getById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch product',
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getLowStockProducts = useCallback(async (limit = 10): Promise<Product[]> => {
    try {
      const response = await productGateway.getLowStock(limit);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updatePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
      fetchStats();
    }
  }, [pagination.page, pagination.limit, search, filters, autoFetch]);

  return {
    // Data
    products,
    loading,
    error,
    pagination,
    filters,
    search,
    stats,
    
    // Actions
    fetchProducts,
    fetchStats,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProduct,
    getLowStockProducts,
    
    // Filters and pagination
    updateSearch,
    updateFilters,
    updatePage,
    updateLimit,
    
    // Computed values
    hasProducts: products.length > 0,
    isEmpty: !loading && products.length === 0,
  };
};

export default useProducts;
