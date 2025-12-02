// useProductsActions - CRUD operations
import { useCallback, useState } from 'react';
import { productGateway } from '@/services/product.gateway';
import { ProductView } from '@/types/product.types';
import { toCreateDTO, toUpdateDTO } from '@/lib/product/transformers';
import { useToast } from '@/hooks/use-toast';

interface UseProductsActionsOptions {
  onSuccess?: () => void;
}

export const useProductsActions = (options: UseProductsActionsOptions = {}) => {
  const { toast } = useToast();
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: Partial<ProductView>): Promise<boolean> => {
    setLoading(true);
    const response = await productGateway.create(toCreateDTO(data));
    setLoading(false);

    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product created' });
      onSuccess?.();
      return true;
    }
    
    toast({ title: 'Error', description: response.error || 'Failed to create', variant: 'destructive' });
    return false;
  }, [toast, onSuccess]);

  const update = useCallback(async (id: string, data: Partial<ProductView>): Promise<boolean> => {
    setLoading(true);
    const response = await productGateway.update(toUpdateDTO(id, data));
    setLoading(false);

    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product updated' });
      onSuccess?.();
      return true;
    }
    
    toast({ title: 'Error', description: response.error || 'Failed to update', variant: 'destructive' });
    return false;
  }, [toast, onSuccess]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    const response = await productGateway.delete(id);
    setLoading(false);

    if (response.success) {
      toast({ title: 'Success', description: response.message || 'Product deleted' });
      onSuccess?.();
      return true;
    }
    
    toast({ title: 'Error', description: response.error || 'Failed to delete', variant: 'destructive' });
    return false;
  }, [toast, onSuccess]);

  return { create, update, remove, loading };
};
