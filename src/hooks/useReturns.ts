import { useState, useCallback } from 'react';
import { returnApiService, Return, CreateReturnRequest, ProcessReturnRequest } from '@/services/api/return.service';
import { useToast } from '@/hooks/use-toast';

export function useReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const fetchReturns = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await returnApiService.getReturns(params);
      
      if (response.success && response.data) {
        setReturns(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch returns",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch returns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getReturnById = useCallback(async (id: number) => {
    try {
      const response = await returnApiService.getReturnById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch return details",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch return details",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const createReturn = useCallback(async (data: CreateReturnRequest) => {
    try {
      const response = await returnApiService.createReturn(data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Return created successfully",
        });
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create return",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create return",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const processReturn = useCallback(async (id: number, data: ProcessReturnRequest) => {
    try {
      const response = await returnApiService.processReturn(id, data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Return processed successfully",
        });
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to process return",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process return",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const getSaleReturns = useCallback(async (saleId: number) => {
    try {
      const response = await returnApiService.getSaleReturns(saleId);
      
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
    returns,
    loading,
    totalPages,
    totalItems,
    fetchReturns,
    getReturnById,
    createReturn,
    processReturn,
    getSaleReturns,
  };
}