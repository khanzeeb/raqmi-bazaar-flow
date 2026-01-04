// Quotation Gateway - API integration for quotation operations
import { apiGateway } from '@/lib/api/gateway';
import { Quotation, QuotationFilters, CreateQuotationDTO, QuotationStats, QuotationItem } from '@/types/quotation.types';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_QUOTATION_SERVICE_URL || 'http://localhost:3004';

// Static data for fallback when API is unavailable
const STATIC_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-001',
    customer: { name: 'أحمد محمد', phone: '+966501234567', email: 'ahmed@example.com', type: 'individual' },
    items: [
      { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
      { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
    ],
    subtotal: 2600,
    taxRate: 15,
    taxAmount: 390,
    discount: 100,
    total: 2890,
    validityDays: 30,
    expiryDate: '2024-02-15',
    status: 'sent',
    createdAt: '2024-01-15',
    notes: 'عرض خاص للعميل المميز',
    history: [
      { id: '1', action: 'created', timestamp: '2024-01-15T10:00:00Z' },
      { id: '2', action: 'sent', timestamp: '2024-01-15T14:30:00Z', notes: 'تم الإرسال عبر الواتساب' }
    ]
  },
  {
    id: '2',
    quotationNumber: 'QT-002',
    customer: { name: 'شركة التقنية المتقدمة', phone: '+966112345678', type: 'business' },
    items: [{ id: '3', name: 'طابعة ليزر', quantity: 5, price: 800, total: 4000 }],
    subtotal: 4000,
    taxRate: 15,
    taxAmount: 600,
    discount: 200,
    total: 4400,
    validityDays: 15,
    expiryDate: '2024-02-01',
    status: 'draft',
    createdAt: '2024-01-16',
    history: [{ id: '1', action: 'created', timestamp: '2024-01-16T09:00:00Z' }]
  }
];

// Local store for fallback
let localQuotations = [...STATIC_QUOTATIONS];

interface QuotationsResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ConvertToSaleResponse {
  quotation: Quotation;
  saleOrderId: string;
}

export interface IQuotationGateway {
  getAll(filters?: QuotationFilters): Promise<ApiResponse<QuotationsResponse>>;
  getById(id: string): Promise<ApiResponse<Quotation>>;
  create(data: CreateQuotationDTO): Promise<ApiResponse<Quotation>>;
  update(id: string, data: Partial<CreateQuotationDTO>): Promise<ApiResponse<Quotation>>;
  delete(id: string): Promise<ApiResponse<void>>;
  send(id: string): Promise<ApiResponse<Quotation>>;
  accept(id: string): Promise<ApiResponse<Quotation>>;
  decline(id: string, reason?: string): Promise<ApiResponse<Quotation>>;
  convertToSale(id: string): Promise<ApiResponse<ConvertToSaleResponse>>;
  updateStatus(id: string, status: Quotation['status']): Promise<ApiResponse<Quotation>>;
  getStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<ApiResponse<QuotationStats>>;
  getExpired(): Promise<ApiResponse<Quotation[]>>;
  processExpired(): Promise<ApiResponse<{ processed_count: number }>>;
}

// Helper functions for local operations
const generateId = (): string => Date.now().toString();
const generateQuotationNumber = (): string => {
  const date = new Date();
  const prefix = `QT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const sequence = String(localQuotations.length + 1).padStart(4, '0');
  return `${prefix}-${sequence}`;
};

export const quotationGateway: IQuotationGateway = {
  async getAll(filters?: QuotationFilters): Promise<ApiResponse<QuotationsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations?${new URLSearchParams(filters as any).toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      // Fallback to local data
      let filtered = [...localQuotations];
      
      if (filters?.status) {
        filtered = filtered.filter(q => q.status === filters.status);
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(q => 
          q.quotationNumber.toLowerCase().includes(search) ||
          q.customer.name.toLowerCase().includes(search)
        );
      }

      return {
        success: true,
        data: {
          data: filtered,
          total: filtered.length,
          page: filters?.page || 1,
          limit: filters?.limit || 50,
          totalPages: Math.ceil(filtered.length / (filters?.limit || 50))
        }
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const quotation = localQuotations.find(q => q.id === id);
      if (quotation) {
        return { success: true, data: quotation };
      }
      return { success: false, error: 'Quotation not found' };
    }
  },

  async create(data: CreateQuotationDTO): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      // Local fallback
      const items: QuotationItem[] = data.items.map((item, index) => ({
        id: generateId() + index,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (data.taxRate / 100);
      const total = subtotal + taxAmount - data.discount;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + data.validityDays);

      const newQuotation: Quotation = {
        id: generateId(),
        quotationNumber: data.quotationNumber || generateQuotationNumber(),
        customer: data.customer,
        items,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        discount: data.discount,
        total,
        validityDays: data.validityDays,
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        notes: data.notes,
        history: [{
          id: generateId(),
          action: 'created',
          timestamp: new Date().toISOString()
        }]
      };

      localQuotations = [newQuotation, ...localQuotations];
      return { success: true, data: newQuotation };
    }
  },

  async update(id: string, data: Partial<CreateQuotationDTO>): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      // Transform items if provided
      let updatedData: Partial<Quotation> = { ...data } as Partial<Quotation>;
      if (data.items) {
        updatedData.items = data.items.map((item, idx) => ({
          id: generateId() + idx,
          ...item
        }));
      }

      const updatedQuotation: Quotation = { ...localQuotations[index], ...updatedData };
      localQuotations[index] = updatedQuotation;
      return { success: true, data: updatedQuotation };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        return { success: true, data: undefined };
      }
      throw new Error('API unavailable');
    } catch (error) {
      localQuotations = localQuotations.filter(q => q.id !== id);
      return { success: true, data: undefined };
    }
  },

  async send(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/send`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      const quotation = localQuotations[index];
      if (quotation.status !== 'draft') {
        return { success: false, error: 'Can only send draft quotations' };
      }

      const updatedQuotation: Quotation = {
        ...quotation,
        status: 'sent',
        history: [...quotation.history, {
          id: generateId(),
          action: 'sent',
          timestamp: new Date().toISOString(),
          notes: 'Quotation sent to customer'
        }]
      };

      localQuotations[index] = updatedQuotation;
      return { success: true, data: updatedQuotation };
    }
  },

  async accept(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/accept`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      const quotation = localQuotations[index];
      if (quotation.status !== 'sent') {
        return { success: false, error: 'Can only accept sent quotations' };
      }

      const updatedQuotation: Quotation = {
        ...quotation,
        status: 'accepted',
        history: [...quotation.history, {
          id: generateId(),
          action: 'accepted',
          timestamp: new Date().toISOString(),
          notes: 'Quotation accepted by customer'
        }]
      };

      localQuotations[index] = updatedQuotation;
      return { success: true, data: updatedQuotation };
    }
  },

  async decline(id: string, reason?: string): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      const quotation = localQuotations[index];
      const updatedQuotation: Quotation = {
        ...quotation,
        status: 'expired', // Using 'expired' as declined equivalent in frontend types
        history: [...quotation.history, {
          id: generateId(),
          action: 'expired',
          timestamp: new Date().toISOString(),
          notes: reason || 'Quotation declined'
        }]
      };

      localQuotations[index] = updatedQuotation;
      return { success: true, data: updatedQuotation };
    }
  },

  async convertToSale(id: string): Promise<ApiResponse<ConvertToSaleResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/convert-to-sale`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      const quotation = localQuotations[index];
      if (quotation.status !== 'accepted') {
        return { success: false, error: 'Can only convert accepted quotations' };
      }

      const saleOrderId = `SO-${String(Date.now()).slice(-6)}`;
      
      const updatedQuotation: Quotation = {
        ...quotation,
        convertedToSaleId: saleOrderId,
        history: [...quotation.history, {
          id: generateId(),
          action: 'converted_to_sale',
          timestamp: new Date().toISOString(),
          notes: `Converted to sales order: ${saleOrderId}`
        }]
      };

      localQuotations[index] = updatedQuotation;
      return { 
        success: true, 
        data: { 
          quotation: updatedQuotation, 
          saleOrderId 
        } 
      };
    }
  },

  async updateStatus(id: string, status: Quotation['status']): Promise<ApiResponse<Quotation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const index = localQuotations.findIndex(q => q.id === id);
      if (index === -1) {
        return { success: false, error: 'Quotation not found' };
      }

      localQuotations[index] = { ...localQuotations[index], status };
      return { success: true, data: localQuotations[index] };
    }
  },

  async getStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<ApiResponse<QuotationStats>> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.set('date_from', filters.dateFrom);
      if (filters?.dateTo) params.set('date_to', filters.dateTo);

      const response = await fetch(`${API_BASE_URL}/api/quotations/stats?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      // Calculate local stats
      const stats: QuotationStats = {
        total: localQuotations.length,
        draft: localQuotations.filter(q => q.status === 'draft').length,
        sent: localQuotations.filter(q => q.status === 'sent').length,
        accepted: localQuotations.filter(q => q.status === 'accepted').length,
        expired: localQuotations.filter(q => q.status === 'expired').length,
        totalValue: localQuotations.reduce((sum, q) => sum + q.total, 0)
      };
      return { success: true, data: stats };
    }
  },

  async getExpired(): Promise<ApiResponse<Quotation[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/expired`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const today = new Date();
      const expired = localQuotations.filter(q => {
        if (q.status === 'draft' || q.status === 'sent') {
          const expiryDate = new Date(q.expiryDate);
          return expiryDate < today;
        }
        return false;
      });
      return { success: true, data: expired };
    }
  },

  async processExpired(): Promise<ApiResponse<{ processed_count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/process-expired`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return { success: true, data: result.data };
        }
      }
      throw new Error('API unavailable');
    } catch (error) {
      const today = new Date();
      let processedCount = 0;

      localQuotations = localQuotations.map(q => {
        if ((q.status === 'draft' || q.status === 'sent') && new Date(q.expiryDate) < today) {
          processedCount++;
          return {
            ...q,
            status: 'expired' as const,
            history: [...q.history, {
              id: generateId(),
              action: 'expired' as const,
              timestamp: new Date().toISOString(),
              notes: 'Quotation expired due to validity date passed'
            }]
          };
        }
        return q;
      });

      return { success: true, data: { processed_count: processedCount } };
    }
  }
};
