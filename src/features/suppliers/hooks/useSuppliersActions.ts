import { useState, useCallback } from 'react';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO } from '../types';
import { supplierGateway } from '../services/supplier.gateway';
import { showToast } from '@/lib/toast';

export const useSuppliersActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSupplier = useCallback(async (data: Partial<Supplier>): Promise<Supplier | null> => {
    setIsSubmitting(true);
    try {
      const createData: CreateSupplierDTO = {
        name: data.name || '',
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address || { street: '', city: '', state: '', postalCode: '', country: 'Saudi Arabia' },
        taxId: data.taxId,
        creditLimit: data.creditLimit,
        notes: data.notes,
      };
      const response = await supplierGateway.create(createData);
      if (response.success && response.data) {
        setSuppliers(prev => [...prev, response.data!]);
        showToast.success('Supplier created successfully');
        onSuccess?.();
        return response.data;
      }
      showToast.error(response.error || 'Failed to create supplier');
      return null;
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to create supplier');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setSuppliers, onSuccess]);

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>): Promise<Supplier | null> => {
    setIsSubmitting(true);
    try {
      const updateData: Partial<UpdateSupplierDTO> = {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        status: data.status,
        address: data.address,
        taxId: data.taxId,
        creditLimit: data.creditLimit,
        notes: data.notes,
      };
      const response = await supplierGateway.update(id, updateData);
      if (response.success && response.data) {
        setSuppliers(prev => prev.map(s => s.id === id ? response.data! : s));
        showToast.success('Supplier updated successfully');
        onSuccess?.();
        return response.data;
      }
      showToast.error(response.error || 'Failed to update supplier');
      return null;
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to update supplier');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setSuppliers, onSuccess]);

  const deleteSupplier = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await supplierGateway.delete(id);
      if (response.success) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
        showToast.success('Supplier deleted successfully');
        onSuccess?.();
        return true;
      }
      showToast.error(response.error || 'Failed to delete supplier');
      return false;
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete supplier');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [setSuppliers, onSuccess]);

  return { addSupplier, updateSupplier, deleteSupplier, isSubmitting };
};
