import { BaseService } from '../common/BaseService';
import { Invoice, CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceFilters } from '../models/Invoice';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { InvoiceItemRepository } from '../repositories/InvoiceItemRepository';
import { IInvoiceService } from '../interfaces/IService';

export class InvoiceService extends BaseService<Invoice, CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceFilters> implements IInvoiceService {
  private invoiceItemRepository: InvoiceItemRepository;

  constructor() {
    const repository = new InvoiceRepository();
    super(repository);
    this.invoiceItemRepository = new InvoiceItemRepository();
  }

  private get invoiceRepository(): InvoiceRepository {
    return this.repository as InvoiceRepository;
  }

  async create(data: CreateInvoiceDTO): Promise<Invoice> {
    const { items, ...invoiceData } = data;
    const { subtotal, taxAmount, totalAmount } = this.calculateInvoiceTotals(data);

    const preparedInvoiceData = {
      ...invoiceData,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      balance: totalAmount,
      status: invoiceData.status || 'draft',
    };

    const preparedItems = this.prepareInvoiceItems(items, data.tax_rate);
    return this.invoiceRepository.createWithItems(preparedInvoiceData, preparedItems);
  }

  async update(id: string, data: UpdateInvoiceDTO): Promise<Invoice | null> {
    const { items, ...invoiceData } = data;

    if (items) {
      const { subtotal, taxAmount, totalAmount } = this.calculateInvoiceTotals(data as CreateInvoiceDTO);
      const invoice = await this.invoiceRepository.findById(id);
      
      if (!invoice) return null;

      const paidAmount = parseFloat(invoice.paid_amount.toString());
      const preparedInvoiceData = {
        ...invoiceData,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance: totalAmount - paidAmount,
      };

      const preparedItems = this.prepareInvoiceItems(items, data.tax_rate || 0);
      return this.invoiceRepository.updateWithItems(id, preparedInvoiceData, preparedItems);
    }

    return this.invoiceRepository.update(id, invoiceData);
  }

  async updateStatus(id: string, status: string): Promise<Invoice | null> {
    return this.invoiceRepository.updateStatus(id, status);
  }

  async recordPayment(id: string, paymentData: any): Promise<Invoice | null> {
    const { amount, ...otherData } = paymentData;
    return this.invoiceRepository.recordPayment(id, amount, otherData);
  }

  async markAsSent(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.markAsSent(id);
  }

  async markAsPaid(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.markAsPaid(id);
  }

  async generatePDF(id: string): Promise<Buffer> {
    // PDF generation implementation would go here
    // This is a placeholder that returns an empty buffer
    return Buffer.from('PDF generation not implemented');
  }

  async sendEmail(id: string, emailData: any): Promise<boolean> {
    // Email sending implementation would go here
    // This is a placeholder
    return true;
  }

  async getStats(filters?: InvoiceFilters): Promise<any> {
    return this.invoiceRepository.getStats(filters);
  }

  async getByStatus(filters?: InvoiceFilters): Promise<any[]> {
    return this.invoiceRepository.getByStatus(filters);
  }

  async checkOverdue(): Promise<void> {
    const overdueInvoices = await this.invoiceRepository.getOverdueInvoices();
    
    for (const invoice of overdueInvoices) {
      await this.invoiceRepository.updateStatus(invoice.id, 'overdue');
    }
  }

  private calculateInvoiceTotals(data: CreateInvoiceDTO | UpdateInvoiceDTO): {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  } {
    if (!('items' in data) || !data.items) {
      return { subtotal: 0, taxAmount: 0, totalAmount: 0 };
    }

    const subtotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price - (item.discount || 0);
      return sum + itemTotal;
    }, 0);

    let discountAmount = data.discount_amount || 0;
    if (data.discount_type === 'percentage') {
      discountAmount = (subtotal * discountAmount) / 100;
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * (data.tax_rate || 0)) / 100;
    const totalAmount = subtotalAfterDiscount + taxAmount;

    return { subtotal, taxAmount, totalAmount };
  }

  private prepareInvoiceItems(items: any[], taxRate: number): any[] {
    return items.map(item => {
      const itemSubtotal = item.quantity * item.unit_price - (item.discount || 0);
      const itemTaxRate = item.tax_rate !== undefined ? item.tax_rate : taxRate;
      const itemTotal = itemSubtotal + (itemSubtotal * itemTaxRate) / 100;

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax_rate: itemTaxRate,
        total: itemTotal,
      };
    });
  }
}
