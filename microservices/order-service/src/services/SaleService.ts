/**
 * Sale Service (Refactored)
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Core sale CRUD operations only
 * - Open/Closed: Extends BaseService, delegates to specialized services
 * - Liskov Substitution: All dependencies implement interfaces
 * - Interface Segregation: Uses focused service interfaces
 * - Dependency Inversion: Depends on abstractions, not implementations
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
import { SalePaymentService, ISalePaymentService } from './sale-payment.service';
import { SaleStatsService, ISaleStatsService } from './sale-stats.service';
import { SaleLifecycleService, ISaleLifecycleService } from './sale-lifecycle.service';
import { InventoryValidationError, SaleNotFoundError } from '../errors/sale.errors';

/**
 * Configuration for SaleService dependencies
 * Allows full customization through dependency injection
 */
export interface SaleServiceDependencies {
  inventoryValidator?: IInventoryValidator;
  paymentService?: ISalePaymentService;
  statsService?: ISaleStatsService;
  lifecycleService?: ISaleLifecycleService;
}

export class SaleService extends BaseService<Sale, CreateSaleDTO, UpdateSaleDTO, SaleFilters> implements ISaleService {
  private readonly saleItemRepository: SaleItemRepository;
  private readonly inventoryValidator: IInventoryValidator;
  private readonly paymentService: ISalePaymentService;
  private readonly statsService: ISaleStatsService;
  private readonly lifecycleService: ISaleLifecycleService;

  constructor(dependencies: SaleServiceDependencies = {}) {
    const saleRepository = new SaleRepository();
    super(saleRepository);
    
    this.saleItemRepository = new SaleItemRepository();
    const paymentAllocationRepository = new PaymentAllocationRepository();

    // Dependency Injection with sensible defaults
    this.inventoryValidator = dependencies.inventoryValidator || new InventoryValidatorService();
    this.paymentService = dependencies.paymentService || new SalePaymentService(saleRepository, paymentAllocationRepository);
    this.statsService = dependencies.statsService || new SaleStatsService(saleRepository);
    this.lifecycleService = dependencies.lifecycleService || new SaleLifecycleService(saleRepository);
  }

  // ==================== Validation Methods ====================

  protected async validateCreateData(data: CreateSaleDTO, items?: SaleItemDTO[]): Promise<CreateSaleDTO & { _reservation_id?: string }> {
    if (items && items.length > 0) {
      const validationResult = await this.inventoryValidator.validateInventory(items);
      
      if (!validationResult.success) {
        throw new InventoryValidationError(
          'Insufficient inventory for one or more items',
          validationResult.unavailable_items
        );
      }

      return {
        ...data,
        _reservation_id: validationResult.reservation_id,
      } as any;
    }

    return data;
  }

  protected async validateUpdateData(data: UpdateSaleDTO): Promise<UpdateSaleDTO> {
    return data;
  }

  // ==================== Core CRUD Operations ====================

  async createSale(saleData: CreateSaleDTO, items: SaleItemDTO[]): Promise<Sale> {
    const validatedData = await this.validateCreateData(saleData, items);
    const saleNumber = await (this.repository as SaleRepository).generateSaleNumber();
    
    const sale = await this.repository.create({
      ...validatedData,
      sale_number: saleNumber,
      status: 'draft',
      payment_status: 'unpaid',
      paid_amount: 0,
      balance_amount: validatedData.total_amount,
    } as any);

    if (items.length > 0) {
      await this.saleItemRepository.createBulk(sale.id, items);
    }

    SaleEventEmitter.emitSaleCreated({
      sale_id: sale.id,
      sale_number: saleNumber,
      customer_id: saleData.customer_id,
      total_amount: saleData.total_amount,
      items_count: items.length,
      reservation_id: (validatedData as any)._reservation_id,
    });

    return sale;
  }

  async updateSale(id: string, saleData: UpdateSaleDTO, items?: SaleItemDTO[]): Promise<Sale | null> {
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

  // ==================== Payment Operations (Delegated) ====================

  async createSalePayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    return this.paymentService.createPayment(saleId, paymentData);
  }

  async createPartialPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    return this.paymentService.createPartialPayment(saleId, paymentData);
  }

  async createFullPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    return this.paymentService.createFullPayment(saleId, paymentData);
  }

  async allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any> {
    return this.paymentService.allocateExistingPayment(saleId, paymentId, amount);
  }

  // ==================== Statistics Operations (Delegated) ====================

  async getSaleStats(filters?: SaleFiltersDTO): Promise<any> {
    return this.statsService.getSaleStats(filters);
  }

  async getOverdueSales(): Promise<Sale[]> {
    return this.statsService.getOverdueSales();
  }

  async generateSaleReport(filters?: SaleFiltersDTO): Promise<any> {
    return this.statsService.generateReport(filters);
  }

  async processOverdueReminders(): Promise<number> {
    const result = await this.statsService.processOverdueReminders();
    return result.processed_count;
  }

  // ==================== Lifecycle Operations (Delegated) ====================

  async cancelSale(id: string, reason: string): Promise<Sale | null> {
    try {
      return await this.lifecycleService.cancelSale(id, reason);
    } catch (error) {
      if (error instanceof SaleNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async confirmSale(id: string): Promise<Sale | null> {
    try {
      return await this.lifecycleService.confirmSale(id);
    } catch (error) {
      if (error instanceof SaleNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async completeSale(id: string): Promise<Sale | null> {
    try {
      return await this.lifecycleService.completeSale(id);
    } catch (error) {
      if (error instanceof SaleNotFoundError) {
        return null;
      }
      throw error;
    }
  }
}

// Re-export errors for convenience
export { InventoryValidationError, SaleNotFoundError } from '../errors/sale.errors';
