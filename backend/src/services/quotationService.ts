import { Quotation } from '../models/Quotation';
import { QuotationItem } from '../models/QuotationItem';
import { Customer } from '../models/Customer';
import { Product } from '../models/Product';
import { SaleService } from './saleService';
import { db } from '../config/database';

interface QuotationData {
  customer_id: number;
  quotation_date: string;
  validity_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  terms_conditions?: string;
  status?: string;
}

interface QuotationItemData {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  description?: string;
}

interface QuotationFilters {
  customer_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class QuotationService {
  
  static async createQuotation(quotationData: QuotationData, items: QuotationItemData[] = []) {
    const trx = await db.transaction();
    
    try {
      // Validate customer exists and is not blocked
      const customer = await Customer.findById(quotationData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      if (customer.status === 'blocked') {
        throw new Error('Cannot create quotation for blocked customer');
      }
      
      // Validate products and get product data
      const productIds = items.map(item => item.product_id);
      const products = await Product.findByIds(productIds);
      
      if (products.length !== productIds.length) {
        throw new Error('Some products not found');
      }
      
      // Create quotation
      const quotation = await Quotation.create({
        ...quotationData,
        status: 'draft'
      });
      
      // Create quotation items with product data
      const quotationItems = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          quotation_id: quotation.id,
          product_name: product!.name,
          product_sku: product!.sku,
          description: item.description || product!.description,
          line_total: QuotationItem.calculateLineTotal(
            item.quantity,
            item.unit_price,
            item.discount_amount || 0,
            item.tax_amount || 0
          )
        };
      });
      
      await QuotationItem.createBulk(quotation.id, quotationItems);
      
      await trx.commit();
      
      // Return quotation with items
      return await this.getQuotationById(quotation.id);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async updateQuotation(quotationId: number, quotationData: Partial<QuotationData>, items: QuotationItemData[] | null = null) {
    const trx = await db.transaction();
    
    try {
      const existingQuotation = await Quotation.findById(quotationId);
      if (!existingQuotation) {
        throw new Error('Quotation not found');
      }
      
      // Check if quotation can be modified
      if (existingQuotation.status === 'converted' || existingQuotation.status === 'accepted') {
        throw new Error('Cannot modify converted or accepted quotation');
      }
      
      // Validate customer if being changed
      if (quotationData.customer_id && quotationData.customer_id !== existingQuotation.customer_id) {
        const customer = await Customer.findById(quotationData.customer_id);
        if (!customer || customer.status === 'blocked') {
          throw new Error('Invalid or blocked customer');
        }
      }
      
      // Update quotation items if provided
      if (items !== null) {
        // Validate products
        const productIds = items.map(item => item.product_id);
        const products = await Product.findByIds(productIds);
        
        if (products.length !== productIds.length) {
          throw new Error('Some products not found');
        }
        
        // Create updated items with product data
        const updatedItems = items.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: product!.name,
            product_sku: product!.sku,
            description: item.description || product!.description,
            line_total: QuotationItem.calculateLineTotal(
              item.quantity,
              item.unit_price,
              item.discount_amount || 0,
              item.tax_amount || 0
            )
          };
        });
        
        await QuotationItem.createBulk(quotationId, updatedItems);
      }
      
      // Update quotation
      const quotation = await Quotation.update(quotationId, quotationData);
      
      await trx.commit();
      
      // Return updated quotation with items
      return await this.getQuotationById(quotationId);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getQuotationById(quotationId: number) {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    // Get quotation items
    const items = await QuotationItem.findByQuotationId(quotationId);
    
    return {
      ...quotation,
      items
    };
  }
  
  static async getQuotations(filters: QuotationFilters = {}) {
    return await Quotation.findAll(filters);
  }
  
  static async deleteQuotation(quotationId: number) {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    // Check if quotation can be deleted
    if (quotation.status === 'converted') {
      throw new Error('Cannot delete converted quotation');
    }
    
    return await Quotation.delete(quotationId);
  }
  
  static async updateQuotationStatus(quotationId: number, status: string) {
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'draft': ['sent', 'declined'],
      'sent': ['accepted', 'declined', 'expired'],
      'accepted': ['converted'],
      'declined': [],
      'expired': [],
      'converted': []
    };
    
    if (!validTransitions[quotation.status].includes(status)) {
      throw new Error(`Cannot change status from ${quotation.status} to ${status}`);
    }
    
    return await Quotation.update(quotationId, { status });
  }
  
  static async sendQuotation(quotationId: number) {
    const quotation = await this.getQuotationById(quotationId);
    
    if (quotation.status !== 'draft') {
      throw new Error('Only draft quotations can be sent');
    }
    
    // Update status to sent
    await this.updateQuotationStatus(quotationId, 'sent');
    
    // Here you would implement email sending logic
    console.log(`Sending quotation ${quotation.quotation_number} to ${quotation.customer_email}`);
    
    return await this.getQuotationById(quotationId);
  }
  
  static async acceptQuotation(quotationId: number) {
    const quotation = await this.getQuotationById(quotationId);
    
    if (quotation.status !== 'sent') {
      throw new Error('Only sent quotations can be accepted');
    }
    
    return await this.updateQuotationStatus(quotationId, 'accepted');
  }
  
  static async declineQuotation(quotationId: number, reason: string | null = null) {
    const quotation = await this.getQuotationById(quotationId);
    
    if (!['draft', 'sent'].includes(quotation.status)) {
      throw new Error('Only draft or sent quotations can be declined');
    }
    
    const updateData: any = { status: 'declined' };
    if (reason) {
      updateData.notes = quotation.notes ? 
        `${quotation.notes}\n\nDeclined: ${reason}` : 
        `Declined: ${reason}`;
    }
    
    return await Quotation.update(quotationId, updateData);
  }
  
  static async convertToSale(quotationId: number) {
    const quotation = await this.getQuotationById(quotationId);
    
    if (quotation.status !== 'accepted') {
      throw new Error('Only accepted quotations can be converted to sales');
    }
    
    const trx = await db.transaction();
    
    try {
      // Prepare sale data from quotation
      const saleData = {
        customer_id: quotation.customer_id,
        sale_date: new Date().toISOString().split('T')[0],
        due_date: quotation.validity_date, // Use validity date as due date
        subtotal: quotation.subtotal,
        tax_amount: quotation.tax_amount,
        discount_amount: quotation.discount_amount,
        total_amount: quotation.total_amount,
        currency: quotation.currency,
        notes: `Converted from quotation ${quotation.quotation_number}`,
        terms_conditions: quotation.terms_conditions
      };
      
      // Prepare sale items from quotation items
      const saleItems = quotation.items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        tax_amount: item.tax_amount
      }));
      
      // Create sale
      const sale = await SaleService.createSale(saleData, saleItems);
      
      // Update quotation status to converted
      await Quotation.update(quotationId, { status: 'converted' });
      
      await trx.commit();
      
      return sale;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getQuotationStats(filters: QuotationFilters = {}) {
    return await Quotation.getQuotationStats(filters);
  }
  
  static async getExpiredQuotations() {
    return await Quotation.getExpiredQuotations();
  }
  
  static async getCustomerQuotations(customerId: number, filters: QuotationFilters = {}) {
    const quotationFilters = { ...filters, customer_id: customerId };
    return await Quotation.findAll(quotationFilters);
  }
  
  static async processExpiredQuotations() {
    const expiredQuotations = await this.getExpiredQuotations();
    
    for (const quotation of expiredQuotations) {
      await Quotation.update(quotation.id, { status: 'expired' });
      console.log(`Marked quotation ${quotation.quotation_number} as expired`);
    }
    
    return expiredQuotations.length;
  }
  
  static async generateQuotationReport(filters: QuotationFilters = {}) {
    const quotations = await Quotation.findAll({ ...filters, limit: 1000 });
    const stats = await Quotation.getQuotationStats(filters);
    
    return {
      quotations: quotations.data,
      statistics: stats,
      summary: {
        total_quotations: quotations.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
}