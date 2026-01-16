/**
 * Sale Service
 * Single Responsibility: Orchestrate sale business operations
 * Open/Closed: Extends BaseService, open for extension
 * Dependency Inversion: Depends on interfaces, not implementations
 */

import { BaseService } from '../common/BaseService';
import { ISaleService, IInventoryValidator } from '../interfaces/ISaleService';
import { SaleRepository, Sale, SaleFilters } from '../models/Sale';
import { SaleItemRepository } from '../models/SaleItem';
import { PaymentAllocationRepository } from '../models/PaymentAllocation';
import { 
  CreateSaleDTO, 
  UpdateSaleDTO, 
  SaleItemDTO,
  SalePaymentDTO,
  SaleFiltersDTO 
} from '../dto';
import { SaleEventEmitter } from '../events/sale.events';
import { InventoryValidatorService } from './inventory-validator.service';

/**
 * Custom error for inventory validation failures
 */
export class InventoryValidationError extends Error {
  public unavailable_items?: Array<{
    product_id: string;
    product_name?: string;
    requested_quantity: number;
    available_quantity: number;
  }>;

  constructor(message: string, unavailableItems?: InventoryValidationError['unavailable_items']) {
    super(message);
    this.name = 'InventoryValidationError';
    this.unavailable_items = unavailableItems;
  }
}

export class SaleService extends BaseService<Sale, CreateSaleDTO, UpdateSaleDTO, SaleFilters> implements ISaleService {
  private saleItemRepository: SaleItemRepository;
  private paymentAllocationRepository: PaymentAllocationRepository;
  private inventoryValidator: IInventoryValidator;

  constructor(inventoryValidator?: IInventoryValidator) {
    super(new SaleRepository());
    this.saleItemRepository = new SaleItemRepository();
    this.paymentAllocationRepository = new PaymentAllocationRepository();
    // Dependency Injection: Allow custom validator or use default
    this.inventoryValidator = inventoryValidator || new InventoryValidatorService();
  }

  protected async validateCreateData(data: CreateSaleDTO, items?: SaleItemDTO[]): Promise<any> {
    // Validate inventory if items are provided
    if (items && items.length > 0) {
      const validationResult = await this.inventoryValidator.validateInventory(items);
      
      if (!validationResult.success) {
        throw new InventoryValidationError(
          'Insufficient inventory for one or more items',
          validationResult.unavailable_items
        );
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

  async createSale(saleData: CreateSaleDTO, items: SaleItemDTO[]): Promise<Sale> {
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
      SaleEventEmitter.emitSaleCreated({
        sale_id: sale.id,
        sale_number: saleNumber,
        customer_id: saleData.customer_id,
        total_amount: saleData.total_amount,
        items_count: items.length,
        reservation_id: validatedData._reservation_id,
      });

      return sale;
    } catch (error) {
      console.error('Sale creation failed after inventory validation:', error);
      throw error;
    }
  }

  async updateSale(id: string, saleData: UpdateSaleDTO, items?: SaleItemDTO[]): Promise<Sale | null> {
    // If items are being updated, validate inventory for new quantities
    if (items && items.length > 0) {
      const validationResult = await this.inventoryValidator.validateInventory(items);
      
      if (!validationResult.success) {
        throw new InventoryValidationError(
          'Insufficient inventory for one or more items',
          validationResult.unavailable_items
        );
      }
    }

    const sale = await this.update(id, saleData);
    
    if (items && sale) {
      await this.saleItemRepository.createBulk(id, items);
    }

    return sale;
  }

  async createSalePayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    // Implementation for creating sale payment
    return { message: 'Payment created', saleId, ...paymentData };
  }

  async createPartialPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    return this.createSalePayment(saleId, paymentData);
  }

  async createFullPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    return this.createSalePayment(saleId, paymentData);
  }

  async allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any> {
    // Implementation for allocating existing payment
    return { message: 'Payment allocated', saleId, paymentId, amount };
  }

  async getOverdueSales(): Promise<Sale[]> {
    return await (this.repository as SaleRepository).getOverdueSales();
  }

  async cancelSale(id: string, reason: string): Promise<Sale | null> {
    const sale = await this.update(id, { status: 'cancelled', notes: reason } as any);
    
    if (sale) {
      // Emit cancellation event for inventory release
      SaleEventEmitter.emitSaleCancelled({
        sale_id: id,
        reason,
      });
    }

    return sale;
  }

  async getSaleStats(filters?: SaleFiltersDTO): Promise<any> {
    return await (this.repository as SaleRepository).getSaleStats(filters as SaleFilters);
  }

  async generateSaleReport(filters?: SaleFiltersDTO): Promise<any> {
    const sales = await this.getAll(filters as SaleFilters);
    const stats = await this.getSaleStats(filters);
    return { sales, stats };
  }

  async processOverdueReminders(): Promise<number> {
    const overdueSales = await this.getOverdueSales();
    // Process reminders logic
    return overdueSales.length;
  }
}
