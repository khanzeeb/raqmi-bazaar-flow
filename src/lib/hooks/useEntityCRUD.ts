/**
 * useEntityCRUD - Reusable hook for CRUD operations on entities
 * Provides consistent create, update, delete patterns across features
 */

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/api';

interface EntityGateway<TEntity, TCreateDTO, TUpdateDTO> {
  create(data: TCreateDTO): Promise<ApiResponse<TEntity>>;
  update(id: string, data: Partial<TUpdateDTO>): Promise<ApiResponse<TEntity>>;
  delete(id: string): Promise<ApiResponse<boolean>>;
  getById?(id: string): Promise<ApiResponse<TEntity>>;
}

interface EntityCRUDOptions {
  entityName: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

interface EntityCRUDReturn<TEntity, TCreateDTO, TUpdateDTO> {
  loading: boolean;
  create: (data: TCreateDTO) => Promise<TEntity | null>;
  update: (id: string, data: Partial<TUpdateDTO>) => Promise<TEntity | null>;
  remove: (id: string) => Promise<boolean>;
  getById: (id: string) => Promise<TEntity | null>;
}

/**
 * Generic hook for entity CRUD operations
 */
export function useEntityCRUD<
  TEntity,
  TCreateDTO = Partial<TEntity>,
  TUpdateDTO = Partial<TEntity>
>(
  gateway: EntityGateway<TEntity, TCreateDTO, TUpdateDTO>,
  options: EntityCRUDOptions
): EntityCRUDReturn<TEntity, TCreateDTO, TUpdateDTO> {
  const { entityName, onCreateSuccess, onUpdateSuccess, onDeleteSuccess } = options;
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: TCreateDTO): Promise<TEntity | null> => {
    setLoading(true);
    try {
      const response = await gateway.create(data);

      if (response.success && response.data) {
        toast({ title: 'Success', description: `${entityName} created successfully` });
        onCreateSuccess?.();
        return response.data;
      } else {
        toast({ 
          title: 'Error', 
          description: response.error || `Failed to create ${entityName.toLowerCase()}`, 
          variant: 'destructive' 
        });
        return null;
      }
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'An unexpected error occurred', 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [gateway, entityName, onCreateSuccess]);

  const update = useCallback(async (id: string, data: Partial<TUpdateDTO>): Promise<TEntity | null> => {
    setLoading(true);
    try {
      const response = await gateway.update(id, data);

      if (response.success && response.data) {
        toast({ title: 'Success', description: `${entityName} updated successfully` });
        onUpdateSuccess?.();
        return response.data;
      } else {
        toast({ 
          title: 'Error', 
          description: response.error || `Failed to update ${entityName.toLowerCase()}`, 
          variant: 'destructive' 
        });
        return null;
      }
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'An unexpected error occurred', 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [gateway, entityName, onUpdateSuccess]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await gateway.delete(id);

      if (response.success) {
        toast({ title: 'Success', description: `${entityName} deleted successfully` });
        onDeleteSuccess?.();
        return true;
      } else {
        toast({ 
          title: 'Error', 
          description: response.error || `Failed to delete ${entityName.toLowerCase()}`, 
          variant: 'destructive' 
        });
        return false;
      }
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'An unexpected error occurred', 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [gateway, entityName, onDeleteSuccess]);

  const getById = useCallback(async (id: string): Promise<TEntity | null> => {
    if (!gateway.getById) {
      console.warn(`getById not implemented for ${entityName}`);
      return null;
    }

    setLoading(true);
    try {
      const response = await gateway.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [gateway, entityName]);

  return {
    loading,
    create,
    update,
    remove,
    getById,
  };
}
