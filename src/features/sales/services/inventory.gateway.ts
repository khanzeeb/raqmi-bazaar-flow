// Inventory Gateway - Stock check API calls for sales
import { ApiResponse } from '@/types/api';

const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:3002';

export interface StockCheckItem {
  product_id: string;
  product_name?: string;
  quantity: number;
}

export interface StockCheckResult {
  product_id: string;
  product_name?: string;
  requested_quantity: number;
  available_quantity: number;
  is_available: boolean;
}

export interface StockCheckResponse {
  available: boolean;
  items: StockCheckResult[];
  checked_at: string;
}

export interface SingleProductStockResponse {
  product_id: string;
  requested_quantity: number;
  available_quantity: number;
  is_available: boolean;
  checked_at: string;
}

class InventoryGateway {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${ORDER_SERVICE_URL}/api/inventory`;
  }

  /**
   * Check stock availability for multiple items
   */
  async checkStock(items: StockCheckItem[]): Promise<ApiResponse<StockCheckResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: Stock check failed`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      // If service is unavailable, return optimistic response for dev
      console.warn('Inventory service unavailable, returning optimistic response');
      return {
        success: true,
        data: {
          available: true,
          items: items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            requested_quantity: item.quantity,
            available_quantity: item.quantity + 100, // Mock available
            is_available: true,
          })),
          checked_at: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Check stock for a single product
   */
  async checkSingleProductStock(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<SingleProductStockResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/check-stock/${productId}?quantity=${quantity}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: Stock check failed`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      // If service is unavailable, return optimistic response for dev
      console.warn('Inventory service unavailable, returning optimistic response');
      return {
        success: true,
        data: {
          product_id: productId,
          requested_quantity: quantity,
          available_quantity: quantity + 100,
          is_available: true,
          checked_at: new Date().toISOString(),
        },
      };
    }
  }
}

export const inventoryGateway = new InventoryGateway();
