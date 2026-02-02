// useProductsActions - CRUD operations using consolidated gateway
import { useCallback, useState } from 'react';
import { productGateway } from '../services/product.gateway';
import { Product, CreateProductDTO, UpdateProductDTO, ProductView } from '../types';
import { useToast } from '@/hooks/use-toast';

interface UseProductsActionsOptions {
  onSuccess?: () => void;
}

export const useProductsActions = (options: UseProductsActionsOptions = {}) => {
  const { toast } = useToast();
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: Partial<ProductView> | CreateProductDTO): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.create(data as CreateProductDTO);
      
      if (response.success && response.data) {
        toast({ title: 'Success', description: 'Product created successfully' });
        onSuccess?.();
        return true;
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to create product', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, onSuccess]);

  const update = useCallback(async (id: string, data: Partial<ProductView> | Partial<UpdateProductDTO>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.update({ id, ...data } as UpdateProductDTO);
      
      if (response.success && response.data) {
        toast({ title: 'Success', description: 'Product updated successfully' });
        onSuccess?.();
        return true;
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to update product', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, onSuccess]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.delete(id);
      
      if (response.success) {
        toast({ title: 'Success', description: 'Product deleted successfully' });
        onSuccess?.();
        return true;
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to delete product', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, onSuccess]);

  const updateStock = useCallback(async (id: string, stock: number, reason?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await productGateway.updateStock(id, { stock, reason });
      
      if (response.success && response.data) {
        toast({ title: 'Success', description: 'Stock updated successfully' });
        onSuccess?.();
        return true;
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to update stock', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, onSuccess]);

  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    setLoading(true);
    try {
      const response = await productGateway.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLowStock = useCallback(async (limit = 10): Promise<Product[]> => {
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

  // Backward compatible aliases
  const createProduct = create;
  const updateProduct = update;
  const deleteProduct = remove;

  return {
    loading,
    // New method names (used by Products page)
    create,
    update,
    remove,
    updateStock,
    getProduct,
    getLowStock,
    // Backward compatible method names
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProductsActions;
