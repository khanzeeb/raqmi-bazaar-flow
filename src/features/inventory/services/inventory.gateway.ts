// Inventory Gateway - API integration for inventory operations
import { ApiResponse } from '@/types/api';
import { InventoryItem } from '@/types/inventory.types';

const API_BASE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:3011';

interface InventoryResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockItems: number;
}

interface BackendInventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  unit_price: number;
  location: string;
  supplier: string;
  supplier_id?: string;
  last_stock_update: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const transformBackendItem = (item: BackendInventoryItem): InventoryItem => ({
  id: item.id,
  productId: item.product_id,
  productName: item.product_name,
  sku: item.sku,
  category: item.category,
  currentStock: item.current_stock,
  minimumStock: item.minimum_stock,
  maximumStock: item.maximum_stock,
  unitCost: item.unit_cost,
  unitPrice: item.unit_price,
  location: item.location,
  supplier: item.supplier,
  lastStockUpdate: item.last_stock_update?.split('T')[0] || '',
  status: mapStatus(item.status),
  notes: item.notes
});

const mapStatus = (status: string): InventoryItem['status'] => {
  const statusMap: Record<string, InventoryItem['status']> = {
    'in_stock': 'in_stock',
    'low_stock': 'low_stock',
    'out_of_stock': 'out_of_stock',
    'discontinued': 'discontinued'
  };
  return statusMap[status] || 'in_stock';
};

const transformToBackend = (data: Partial<InventoryItem>) => ({
  product_id: data.productId,
  product_name: data.productName,
  sku: data.sku,
  category: data.category,
  current_stock: data.currentStock,
  minimum_stock: data.minimumStock,
  maximum_stock: data.maximumStock,
  unit_cost: data.unitCost,
  unit_price: data.unitPrice,
  location: data.location,
  supplier: data.supplier,
  notes: data.notes,
  status: data.status
});

export interface IInventoryGateway {
  getAll(filters?: { search?: string; category?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<InventoryResponse>>;
  getById(id: string): Promise<ApiResponse<InventoryItem>>;
  update(id: string, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>>;
  getStats(): Promise<ApiResponse<InventoryStats>>;
  getLowStockItems(): Promise<ApiResponse<InventoryItem[]>>;
  updateStock(id: string, quantity: number, type: 'add' | 'remove' | 'set'): Promise<ApiResponse<InventoryItem>>;
  getCategories(): Promise<ApiResponse<string[]>>;
}

export const inventoryGateway: IInventoryGateway = {
  async getAll(filters?): Promise<ApiResponse<InventoryResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/inventory?${params.toString()}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { success: true, data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 } };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success !== false) {
        const rawData = result.data?.data || result.data || [];
        const items = Array.isArray(rawData) ? rawData.map(transformBackendItem) : [];
        return { 
          success: true, 
          data: {
            data: items,
            total: result.data?.total || items.length,
            page: result.data?.page || 1,
            limit: result.data?.limit || 50,
            totalPages: result.data?.totalPages || 1
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch inventory' };
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch inventory' };
    }
  },

  async getById(id: string): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendItem(result.data) };
      }
      return { success: false, error: result.error || 'Inventory item not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch inventory item' };
    }
  },

  async update(id: string, data): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendItem(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update inventory item' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update inventory item' };
    }
  },

  async getStats(): Promise<ApiResponse<InventoryStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/stats`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const items = listResponse.data.data;
          return {
            success: true,
            data: {
              totalItems: items.length,
              totalValue: items.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0),
              lowStockItems: items.filter(i => i.status === 'low_stock').length,
              outOfStockItems: items.filter(i => i.status === 'out_of_stock').length,
              inStockItems: items.filter(i => i.status === 'in_stock').length
            }
          };
        }
        return { success: true, data: { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0, inStockItems: 0 } };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            totalItems: result.data.total_items || result.data.totalItems || 0,
            totalValue: result.data.total_value || result.data.totalValue || 0,
            lowStockItems: result.data.low_stock_items || result.data.lowStockItems || 0,
            outOfStockItems: result.data.out_of_stock_items || result.data.outOfStockItems || 0,
            inStockItems: result.data.in_stock_items || result.data.inStockItems || 0
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch stats' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },

  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ status: 'low_stock', limit: 1000 });
        if (listResponse.success && listResponse.data) {
          return { success: true, data: listResponse.data.data };
        }
        return { success: true, data: [] };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        const items = Array.isArray(result.data) ? result.data.map(transformBackendItem) : [];
        return { success: true, data: items };
      }
      return { success: false, error: result.error || 'Failed to fetch low stock items' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch low stock items' };
    }
  },

  async updateStock(id: string, quantity: number, type): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, type })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformBackendItem(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update stock' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update stock' };
    }
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/categories`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const listResponse = await this.getAll({ limit: 1000 });
        if (listResponse.success && listResponse.data) {
          const categories: string[] = [...new Set(listResponse.data.data.map(i => i.category))].filter((c): c is string => typeof c === 'string');
          return { success: true, data: categories };
        }
        return { success: true, data: [] };
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: result.data as string[] };
      }
      return { success: false, error: result.error || 'Failed to fetch categories' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' };
    }
  }
};
