import { useState, useEffect } from 'react';
import { quotationService, Quotation, QuotationFilters, QuotationStats, CreateQuotationData, UpdateQuotationData } from '@/services/api/quotation.service';
import { toast } from 'sonner';

export function useQuotations(filters?: QuotationFilters) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quotationService.getQuotations(filters);
      
      if (response.success && response.data) {
        setQuotations(response.data.data);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages
        });
      } else {
        throw new Error(response.error || 'Failed to fetch quotations');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [JSON.stringify(filters)]);

  const createQuotation = async (data: CreateQuotationData): Promise<Quotation | null> => {
    try {
      const response = await quotationService.createQuotation(data);
      
      if (response.success && response.data) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation created successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return null;
    }
  };

  const updateQuotation = async (id: number, data: UpdateQuotationData): Promise<Quotation | null> => {
    try {
      const response = await quotationService.updateQuotation(id, data);
      
      if (response.success && response.data) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation updated successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return null;
    }
  };

  const deleteQuotation = async (id: number): Promise<boolean> => {
    try {
      const response = await quotationService.deleteQuotation(id);
      
      if (response.success) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation deleted successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const sendQuotation = async (id: number): Promise<boolean> => {
    try {
      const response = await quotationService.sendQuotation(id);
      
      if (response.success) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation sent successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to send quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const acceptQuotation = async (id: number): Promise<boolean> => {
    try {
      const response = await quotationService.acceptQuotation(id);
      
      if (response.success) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation accepted successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to accept quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const declineQuotation = async (id: number, reason?: string): Promise<boolean> => {
    try {
      const response = await quotationService.declineQuotation(id, reason);
      
      if (response.success) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation declined successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to decline quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  const convertToSale = async (id: number): Promise<boolean> => {
    try {
      const response = await quotationService.convertToSale(id);
      
      if (response.success) {
        await fetchQuotations(); // Refresh the list
        toast.success('Quotation converted to sale successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to convert quotation to sale');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
      return false;
    }
  };

  return {
    quotations,
    loading,
    error,
    pagination,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    sendQuotation,
    acceptQuotation,
    declineQuotation,
    convertToSale
  };
}

export function useQuotationStats(filters?: { date_from?: string; date_to?: string }) {
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quotationService.getStats(filters);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch quotation stats');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [JSON.stringify(filters)]);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
}