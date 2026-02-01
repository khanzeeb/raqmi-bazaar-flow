import { useState, useCallback } from 'react';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../types';
import { customerGateway } from '../services/customer.gateway';
import { showToast } from '@/lib/toast';

export const useCustomersActions = (
  customers: Customer[],
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCustomer = useCallback(async (customerData: Partial<Customer>): Promise<Customer | null> => {
    setIsSubmitting(true);
    try {
      const createData: CreateCustomerDTO = {
        name: customerData.name || '',
        nameAr: customerData.nameAr,
        email: customerData.email || '',
        phone: customerData.phone || '',
        customerType: customerData.customerType || 'individual',
        billingAddress: customerData.billingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Saudi Arabia'
        },
        shippingAddress: customerData.shippingAddress,
        taxId: customerData.taxId,
        notes: customerData.notes,
        tags: customerData.tags
      };

      const response = await customerGateway.create(createData);
      
      if (response.success && response.data) {
        setCustomers(prev => [...prev, response.data!]);
        showToast.success('Customer created successfully');
        onSuccess?.();
        return response.data;
      } else {
        showToast.error(response.error || 'Failed to create customer');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create customer';
      showToast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers, onSuccess]);

  const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer>): Promise<Customer | null> => {
    setIsSubmitting(true);
    try {
      const updateData: Partial<UpdateCustomerDTO> = {
        name: customerData.name,
        nameAr: customerData.nameAr,
        email: customerData.email,
        phone: customerData.phone,
        customerType: customerData.customerType,
        status: customerData.status,
        billingAddress: customerData.billingAddress,
        shippingAddress: customerData.shippingAddress,
        taxId: customerData.taxId,
        notes: customerData.notes,
        tags: customerData.tags
      };

      const response = await customerGateway.update(id, updateData);
      
      if (response.success && response.data) {
        setCustomers(prev => prev.map(c => 
          c.id === id ? response.data! : c
        ));
        showToast.success('Customer updated successfully');
        onSuccess?.();
        return response.data;
      } else {
        showToast.error(response.error || 'Failed to update customer');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update customer';
      showToast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers, onSuccess]);

  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await customerGateway.delete(id);
      
      if (response.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        showToast.success('Customer deleted successfully');
        onSuccess?.();
        return true;
      } else {
        showToast.error(response.error || 'Failed to delete customer');
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete customer';
      showToast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers, onSuccess]);

  const updateCredit = useCallback(async (
    id: string, 
    amount: number, 
    type: 'add' | 'subtract',
    reason?: string
  ): Promise<Customer | null> => {
    setIsSubmitting(true);
    try {
      const response = await customerGateway.updateCredit(id, amount, type, reason);
      
      if (response.success && response.data) {
        setCustomers(prev => prev.map(c => 
          c.id === id ? response.data! : c
        ));
        showToast.success('Credit updated successfully');
        return response.data;
      } else {
        showToast.error(response.error || 'Failed to update credit');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update credit';
      showToast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers]);

  const blockCustomer = useCallback(async (id: string, reason?: string): Promise<Customer | null> => {
    setIsSubmitting(true);
    try {
      const response = await customerGateway.block(id, reason);
      
      if (response.success && response.data) {
        setCustomers(prev => prev.map(c => 
          c.id === id ? response.data! : c
        ));
        showToast.success('Customer blocked successfully');
        return response.data;
      } else {
        showToast.error(response.error || 'Failed to block customer');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to block customer';
      showToast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers]);

  const unblockCustomer = useCallback(async (id: string, reason?: string): Promise<Customer | null> => {
    setIsSubmitting(true);
    try {
      const response = await customerGateway.unblock(id, reason);
      
      if (response.success && response.data) {
        setCustomers(prev => prev.map(c => 
          c.id === id ? response.data! : c
        ));
        showToast.success('Customer unblocked successfully');
        return response.data;
      } else {
        showToast.error(response.error || 'Failed to unblock customer');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unblock customer';
      showToast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCustomers]);

  return { 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    updateCredit,
    blockCustomer,
    unblockCustomer,
    isSubmitting 
  };
};
