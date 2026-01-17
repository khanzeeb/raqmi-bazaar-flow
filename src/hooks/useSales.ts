// Legacy useSales hook - Updated to use salesOrderGateway
import { useState, useCallback } from 'react';
import { salesOrderGateway } from '@/features/sales/services/salesOrder.gateway';
import { SalesOrder } from '@/types/salesOrder.types';
import { useToast } from '@/hooks/use-toast';

export type Sale = SalesOrder;

export function useSales() {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const fetchSales = useCallback(async (params: { page?: number; limit?: number } = {}) => {
    try {
      setLoading(true);
      const response = await salesOrderGateway.getAll(params);
      
      if (response.success && response.data) {
        setSales(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        toast({ title: "Error", description: response.error || "Failed to fetch sales", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch sales", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getSaleById = useCallback(async (id: string) => {
    const response = await salesOrderGateway.getById(id);
    if (response.success && response.data) return response.data;
    toast({ title: "Error", description: response.error || "Failed to fetch sale", variant: "destructive" });
    return null;
  }, [toast]);

  const deleteSale = useCallback(async (id: string) => {
    const response = await salesOrderGateway.delete(id);
    if (response.success) {
      setSales(prev => prev.filter(s => s.id !== id));
      toast({ title: "Success", description: "Sale deleted" });
      return true;
    }
    toast({ title: "Error", description: response.error || "Failed to delete sale", variant: "destructive" });
    return false;
  }, [toast]);

  return {
    sales,
    loading,
    totalPages,
    totalItems,
    fetchSales,
    getSaleById,
    deleteSale,
  };
}
