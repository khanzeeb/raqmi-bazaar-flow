import { useState, useCallback } from 'react';
import { saleApiService, Sale, CreateSaleRequest, SalePaymentRequest } from '@/services/api/sale.service';
import { useToast } from '@/hooks/use-toast';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const fetchSales = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await saleApiService.getSales(params);
      
      if (response.success && response.data) {
        setSales(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch sales",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getSaleById = useCallback(async (id: number) => {
    try {
      const response = await saleApiService.getSaleById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch sale details",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sale details",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const createSale = useCallback(async (data: CreateSaleRequest) => {
    try {
      const response = await saleApiService.createSale(data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Sale created successfully",
        });
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create sale",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sale",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateSale = useCallback(async (id: number, data: Partial<CreateSaleRequest>) => {
    try {
      const response = await saleApiService.updateSale(id, data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Sale updated successfully",
        });
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update sale",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteSale = useCallback(async (id: number) => {
    try {
      const response = await saleApiService.deleteSale(id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Sale deleted successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete sale",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const createSalePayment = useCallback(async (saleId: number, data: SalePaymentRequest) => {
    try {
      const response = await saleApiService.createSalePayment(saleId, data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to add payment",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const getSaleReturns = useCallback(async (saleId: number) => {
    try {
      const response = await saleApiService.getSaleReturns(saleId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch sale returns",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sale returns",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    sales,
    loading,
    totalPages,
    totalItems,
    fetchSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    createSalePayment,
    getSaleReturns,
  };
}