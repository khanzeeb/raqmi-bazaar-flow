import { SagaManager, SagaStep, SagaResult } from './SagaManager';
import { 
  serviceEventEmitter, 
  InventoryCheckRequest, 
  InventoryCheckResponse,
  InventoryReserveRequest,
  InventoryReserveResponse,
  InventoryReleaseRequest 
} from './EventEmitter';

export interface SaleItemInput {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface InventoryValidationResult {
  success: boolean;
  reservation_id?: string;
  items: SaleItemInput[];
  unavailable_items?: Array<{
    product_id: string;
    product_name?: string;
    requested_quantity: number;
    available_quantity: number;
  }>;
}

export class InventorySaga {
  private sagaManager: SagaManager;
  private inventoryServiceUrl: string;

  constructor() {
    this.sagaManager = new SagaManager();
    this.inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3011';
    this.setupSteps();
  }

  private setupSteps(): void {
    // Step 1: Check inventory availability
    const checkInventoryStep: SagaStep<SaleItemInput[], InventoryCheckResponse> = {
      name: 'check_inventory',
      execute: async (items: SaleItemInput[]) => {
        return await this.checkInventoryAvailability(items);
      },
      // No compensation needed for check - it's a read operation
    };

    // Step 2: Reserve inventory
    const reserveInventoryStep: SagaStep<InventoryCheckResponse, InventoryReserveResponse> = {
      name: 'reserve_inventory',
      execute: async (checkResult: InventoryCheckResponse) => {
        if (!checkResult.available) {
          throw new Error('Inventory not available for all items');
        }
        
        const items = checkResult.items.map(item => ({
          product_id: item.product_id,
          quantity: item.requested_quantity,
        }));
        
        return await this.reserveInventory({ items });
      },
      compensate: async (input: InventoryCheckResponse, output: InventoryReserveResponse) => {
        if (output.reservation_id) {
          await this.releaseInventory({ reservation_id: output.reservation_id });
        }
      },
    };

    this.sagaManager
      .addStep(checkInventoryStep)
      .addStep(reserveInventoryStep);
  }

  async validateAndReserve(items: SaleItemInput[]): Promise<SagaResult<InventoryValidationResult>> {
    const result = await this.sagaManager.execute<InventoryReserveResponse>(items);

    if (!result.success) {
      // Get unavailable items from the check step
      const context = this.sagaManager.getContext();
      const checkResult = context.results.get('check_inventory');
      
      let unavailableItems: InventoryValidationResult['unavailable_items'] = [];
      
      if (checkResult?.output) {
        const checkOutput = checkResult.output as InventoryCheckResponse;
        unavailableItems = checkOutput.items
          .filter(item => !item.is_available)
          .map(item => ({
            product_id: item.product_id,
            requested_quantity: item.requested_quantity,
            available_quantity: item.available_quantity,
          }));
      }

      return {
        success: false,
        errors: result.errors,
        data: {
          success: false,
          items,
          unavailable_items: unavailableItems,
        },
        compensated: result.compensated,
      };
    }

    return {
      success: true,
      data: {
        success: true,
        reservation_id: result.data?.reservation_id,
        items,
      },
    };
  }

  async checkOnly(items: SaleItemInput[]): Promise<InventoryCheckResponse> {
    return await this.checkInventoryAvailability(items);
  }

  private async checkInventoryAvailability(items: SaleItemInput[]): Promise<InventoryCheckResponse> {
    try {
      const checkRequest: InventoryCheckRequest = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: item.product_name,
        })),
      };

      // Emit event for tracking
      serviceEventEmitter.emitEvent('inventory.check.request', checkRequest);

      // Call inventory service
      const response = await this.callInventoryService('/api/inventory/check-stock', checkRequest);

      const checkResponse: InventoryCheckResponse = {
        success: response.success !== false,
        available: response.available !== false,
        items: response.items || items.map(item => ({
          product_id: item.product_id,
          requested_quantity: item.quantity,
          available_quantity: response.available ? item.quantity : 0,
          is_available: response.available !== false,
        })),
        errors: response.errors,
      };

      serviceEventEmitter.emitEvent('inventory.check.response', checkResponse);

      return checkResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check inventory';
      
      // If inventory service is unavailable, allow sale to proceed with warning
      // This is a business decision - can be changed to fail strict
      console.warn(`Inventory check failed: ${errorMessage}. Proceeding with sale.`);
      
      return {
        success: true,
        available: true,
        items: items.map(item => ({
          product_id: item.product_id,
          requested_quantity: item.quantity,
          available_quantity: item.quantity,
          is_available: true,
        })),
      };
    }
  }

  private async reserveInventory(request: InventoryReserveRequest): Promise<InventoryReserveResponse> {
    try {
      serviceEventEmitter.emitEvent('inventory.reserve.request', request);

      const response = await this.callInventoryService('/api/inventory/reserve', request);

      const reserveResponse: InventoryReserveResponse = {
        success: response.success !== false,
        reservation_id: response.reservation_id || `res-${Date.now()}`,
        items: response.items || request.items.map(item => ({
          product_id: item.product_id,
          reserved_quantity: item.quantity,
        })),
        errors: response.errors,
      };

      serviceEventEmitter.emitEvent('inventory.reserve.response', reserveResponse);

      return reserveResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reserve inventory';
      
      // If reservation fails, allow sale to proceed (soft reservation mode)
      console.warn(`Inventory reservation failed: ${errorMessage}. Proceeding without reservation.`);
      
      return {
        success: true,
        reservation_id: `soft-res-${Date.now()}`,
        items: request.items.map(item => ({
          product_id: item.product_id,
          reserved_quantity: item.quantity,
        })),
      };
    }
  }

  private async releaseInventory(request: InventoryReleaseRequest): Promise<void> {
    try {
      serviceEventEmitter.emitEvent('inventory.release.request', request);

      await this.callInventoryService('/api/inventory/release', request);

      serviceEventEmitter.emitEvent('inventory.release.response', { success: true });
    } catch (error) {
      console.error('Failed to release inventory reservation:', error);
      // Log for manual intervention but don't throw
    }
  }

  private async callInventoryService(endpoint: string, data: any): Promise<any> {
    const url = `${this.inventoryServiceUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Inventory service responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Re-throw for caller to handle
      throw error;
    }
  }
}

// Factory function for creating new saga instances
export function createInventorySaga(): InventorySaga {
  return new InventorySaga();
}
