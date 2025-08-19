import { BaseService } from '../common/BaseService';
import { ISaleService } from '../interfaces/IService';
import { SaleRepository, Sale, SaleFilters } from '../models/Sale';
import { SaleItemRepository } from '../models/SaleItem';
import { PaymentAllocationRepository } from '../models/PaymentAllocation';

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

export class SaleService extends BaseService<Sale, CreateSaleDTO, UpdateSaleDTO, SaleFilters> implements ISaleService {
  private saleItemRepository: SaleItemRepository;
  private paymentAllocationRepository: PaymentAllocationRepository;

  constructor() {
    super(new SaleRepository());
    this.saleItemRepository = new SaleItemRepository();
    this.paymentAllocationRepository = new PaymentAllocationRepository();
  }

  protected async validateCreateData(data: CreateSaleDTO): Promise<any> {
    // Add business validation logic
    return data;
  }

  protected async validateUpdateData(data: UpdateSaleDTO): Promise<any> {
    // Add business validation logic
    return data;
  }

  async createSale(saleData: CreateSaleDTO, items: any[]): Promise<Sale> {
    const validatedData = await this.validateCreateData(saleData);
    const saleNumber = await (this.repository as SaleRepository).generateSaleNumber();
    
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

    return sale;
  }

  async updateSale(id: string, saleData: UpdateSaleDTO, items?: any[]): Promise<Sale | null> {
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
    return await this.update(id, { status: 'cancelled', notes: reason } as any);
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