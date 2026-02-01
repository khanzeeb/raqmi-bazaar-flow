// Legacy hook - re-exports from modular feature structure for backward compatibility
import { useState, useEffect, useCallback } from 'react';
import { quotationGateway } from '@/features/quotations/services/quotation.gateway';
import { Quotation, QuotationFilters, QuotationStats, CreateQuotationDTO } from '@/types/quotation.types';
import { showToast } from '@/lib/toast';

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

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quotationGateway.getAll(filters);
      
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
      showToast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const createQuotation = async (data: CreateQuotationDTO): Promise<Quotation | null> => {
    try {
      const response = await quotationGateway.create(data);
      
      if (response.success && response.data) {
        await fetchQuotations();
        showToast.success('Quotation created successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return null;
    }
  };

  const updateQuotation = async (id: string, data: Partial<CreateQuotationDTO>): Promise<Quotation | null> => {
    try {
      const response = await quotationGateway.update(id, data);
      
      if (response.success && response.data) {
        await fetchQuotations();
        showToast.success('Quotation updated successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return null;
    }
  };

  const deleteQuotation = async (id: string): Promise<boolean> => {
    try {
      const response = await quotationGateway.delete(id);
      
      if (response.success) {
        await fetchQuotations();
        showToast.success('Quotation deleted successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return false;
    }
  };

  const sendQuotation = async (id: string): Promise<boolean> => {
    try {
      const response = await quotationGateway.send(id);
      
      if (response.success) {
        await fetchQuotations();
        showToast.success('Quotation sent successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to send quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return false;
    }
  };

  const acceptQuotation = async (id: string): Promise<boolean> => {
    try {
      const response = await quotationGateway.accept(id);
      
      if (response.success) {
        await fetchQuotations();
        showToast.success('Quotation accepted successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to accept quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return false;
    }
  };

  const declineQuotation = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const response = await quotationGateway.decline(id, reason);
      
      if (response.success) {
        await fetchQuotations();
        showToast.success('Quotation declined successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to decline quotation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
      return false;
    }
  };

  const convertToSale = async (id: string): Promise<boolean> => {
    try {
      const response = await quotationGateway.convertToSale(id);
      
      if (response.success) {
        await fetchQuotations();
        showToast.success('Quotation converted to sale successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to convert quotation to sale');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(message);
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

export function useQuotationStats(filters?: { dateFrom?: string; dateTo?: string }) {
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quotationGateway.getStats(filters);
      
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
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
}

// Re-export types for backward compatibility
export type { Quotation, QuotationFilters, QuotationStats, CreateQuotationDTO } from '@/types/quotation.types';
