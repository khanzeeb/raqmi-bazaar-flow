import { BaseService } from '../common/BaseService';
import { ISaleService } from '../interfaces/IService';
import { SaleRepository, Sale, SaleFilters } from '../models/Sale';
import { SaleItemRepository } from '../models/SaleItem';
import { PaymentAllocationRepository } from '../models/PaymentAllocation';
import { createInventorySaga, InventorySaga, SaleItemInput, InventoryValidationResult } from '../events/InventorySaga';
import { serviceEventEmitter } from '../events/EventEmitter';

export interface CreateSaleDTO {
  customer_id: string;
  sale_date: string;
  due_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateSaleDTO extends Partial<CreateSaleDTO> {
  status?: string;
}

export interface InventoryValidationError extends Error {
  unavailable_items?: Array<{
    product_id: string;
    product_name?: string;
    requested_quantity: number;
    available_quantity: number;
  }>;
}

export class SaleService extends BaseService<Sale, CreateSaleDTO, UpdateSaleDTO, SaleFilters> implements ISaleService {
  private saleItemRepository: SaleItemRepository;
  private paymentAllocationRepository: PaymentAllocationRepository;
  private inventorySaga: InventorySaga;

  constructor() {
    super(new SaleRepository());
    this.saleItemRepository = new SaleItemRepository();
    this.paymentAllocationRepository = new PaymentAllocationRepository();
    this.inventorySaga = createInventorySaga();
  }

  protected async validateCreateData(data: CreateSaleDTO, items?: SaleItemInput[]): Promise<any> {
    // Validate inventory if items are provided
    if (items && items.length > 0) {
      const validationResult = await this.validateInventory(items);
      
      if (!validationResult.success) {
        const error = new Error('Insufficient inventory for one or more items') as InventoryValidationError;
        error.unavailable_items = validationResult.unavailable_items;
        throw error;
      }

      // Store reservation ID for potential rollback
      if (validationResult.reservation_id) {
        (data as any)._reservation_id = validationResult.reservation_id;
      }
    }

    return data;
  }

  protected async validateUpdateData(data: UpdateSaleDTO): Promise<any> {
    // Add business validation logic
    return data;
  }

  /**
   * Validates inventory availability using the saga pattern.
   * This method checks if all items are in stock before allowing sale creation.
   */
  async validateInventory(items: SaleItemInput[]): Promise<InventoryValidationResult> {
    const saga = createInventorySaga();
    
    serviceEventEmitter.emitEvent('sale.saga.started', {
      action: 'validate_inventory',
      items_count: items.length,
    });

    const result = await saga.validateAndReserve(items);

    if (result.success) {
      serviceEventEmitter.emitEvent('sale.saga.completed', {
        action: 'validate_inventory',
        reservation_id: result.data?.reservation_id,
      });
    } else {
      serviceEventEmitter.emitEvent('sale.saga.failed', {
        action: 'validate_inventory',
        errors: result.errors,
        compensated: result.compensated,
      });
    }

    return result.data || {
      success: false,
      items,
      unavailable_items: [],
    };
  }

  /**
   * Check inventory without reserving (read-only check)
   */
  async checkInventoryOnly(items: SaleItemInput[]): Promise<{
    available: boolean;
    items: Array<{
      product_id: string;
      requested_quantity: number;
      available_quantity: number;
      is_available: boolean;
    }>;
  }> {
    const saga = createInventorySaga();
    const result = await saga.checkOnly(items);
    
    return {
      available: result.available,
      items: result.items,
    };
  }

  async createSale(saleData: CreateSaleDTO, items: SaleItemInput[]): Promise<Sale> {
    // Validate data including inventory check via saga
    const validatedData = await this.validateCreateData(saleData, items);
    const saleNumber = await (this.repository as SaleRepository).generateSaleNumber();
    
    try {
      const sale = await this.repository.create({
        ...validatedData,
        sale_number: saleNumber,
        status: 'draft',
        payment_status: 'unpaid',
        paid_amount: 0,
        balance_amount: validatedData.total_amount
      } as any);

      if (items.length > 0) {
        await this.saleItemRepository.createBulk(sale.id, items);
      }

      // Emit sale created event
      serviceEventEmitter.emitEvent('sale.created', {
        sale_id: sale.id,
        sale_number: saleNumber,
        customer_id: saleData.customer_id,
        total_amount: saleData.total_amount,
        items_count: items.length,
        reservation_id: validatedData._reservation_id,
      });

      return sale;
    } catch (error) {
      // If sale creation fails and we have a reservation, the saga's compensation
      // should have already released it. Log for tracking.
      console.error('Sale creation failed after inventory validation:', error);
      throw error;
    }
  }

  async updateSale(id: string, saleData: UpdateSaleDTO, items?: SaleItemInput[]): Promise<Sale | null> {
    // If items are being updated, validate inventory for new quantities
    if (items && items.length > 0) {
      const validationResult = await this.validateInventory(items);
      
      if (!validationResult.success) {
        const error = new Error('Insufficient inventory for one or more items') as InventoryValidationError;
        error.unavailable_items = validationResult.unavailable_items;
        throw error;
      }
    }

    const sale = await this.update(id, saleData);
    
    if (items && sale) {
      await this.saleItemRepository.createBulk(id, items);
    }

    return sale;
  }

  async createSalePayment(saleId: string, paymentData: any): Promise<any> {
    // Implementation for creating sale payment
    return { message: 'Payment created' };
  }

  async createPartialPayment(saleId: string, paymentData: any): Promise<any> {
    return this.createSalePayment(saleId, paymentData);
  }

  async createFullPayment(saleId: string, paymentData: any): Promise<any> {
    return this.createSalePayment(saleId, paymentData);
  }

  async allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any> {
    // Implementation for allocating existing payment
    return { message: 'Payment allocated' };
  }

  async getOverdueSales(): Promise<Sale[]> {
    return await (this.repository as SaleRepository).getOverdueSales();
  }

  async cancelSale(id: string, reason: string): Promise<Sale | null> {
    const sale = await this.update(id, { status: 'cancelled', notes: reason } as any);
    
    if (sale) {
      // Emit cancellation event for inventory release
      serviceEventEmitter.emitEvent('sale.cancelled', {
        sale_id: id,
        reason,
      });
    }

    return sale;
  }

  async getSaleStats(filters?: SaleFilters): Promise<any> {
    return await (this.repository as SaleRepository).getSaleStats(filters);
  }

  async generateSaleReport(filters?: SaleFilters): Promise<any> {
    const sales = await this.getAll(filters);
    const stats = await this.getSaleStats(filters);
    return { sales, stats };
  }

  async processOverdueReminders(): Promise<number> {
    const overdueSales = await this.getOverdueSales();
    // Process reminders logic
    return overdueSales.length;
  }
}