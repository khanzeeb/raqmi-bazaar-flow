import { useState, useEffect, useCallback } from 'react';
import { productApiService } from '@/services/api/product.service';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '@/types/product';
import { QueryParams, PaginatedResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: ProductFilters;
  initialSearch?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { toast } = useToast();
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

  const fetchProducts = useCallback(async (params?: QueryParams & { filters?: ProductFilters }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productApiService.getProducts({
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

  const createProduct = useCallback(async (productData: CreateProductRequest): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productApiService.createProduct(productData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product created successfully',
        });
        await fetchProducts(); // Refresh the list
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
  }, [fetchProducts, toast]);

  const updateProduct = useCallback(async (productData: UpdateProductRequest): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productApiService.updateProduct(productData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product updated successfully',
        });
        await fetchProducts(); // Refresh the list
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
  }, [fetchProducts, toast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productApiService.deleteProduct(id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Product deleted successfully',
        });
        await fetchProducts(); // Refresh the list
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
  }, [fetchProducts, toast]);

  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const response = await productApiService.getProduct(id);
      
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

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit, search, filters]);

  return {
    // Data
    products,
    loading,
    error,
    pagination,
    filters,
    search,
    
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    
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