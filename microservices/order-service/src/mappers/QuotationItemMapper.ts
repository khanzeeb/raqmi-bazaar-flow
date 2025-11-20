import { QuotationItemData, CreateQuotationItemDTO, UpdateQuotationItemDTO } from '../models/QuotationItem';

export class QuotationItemMapper {
  static toQuotationItemData(dbData: any): QuotationItemData {
    return {
      id: dbData.id?.toString(),
      quotation_id: dbData.quotation_id?.toString(),
      product_id: dbData.product_id?.toString(),
      product_name: dbData.product_name,
      product_sku: dbData.product_sku,
      current_product_name: dbData.current_product_name,
      current_product_sku: dbData.current_product_sku,
      quantity: parseFloat(dbData.quantity) || 0,
      unit_price: parseFloat(dbData.unit_price) || 0,
      discount_amount: parseFloat(dbData.discount_amount) || 0,
      tax_amount: parseFloat(dbData.tax_amount) || 0,
      line_total: parseFloat(dbData.line_total) || 0,
      description: dbData.description,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    };
  }

  static toDatabase(data: CreateQuotationItemDTO | UpdateQuotationItemDTO, quotationId?: string): any {
    const dbData: any = {};

    if (quotationId) {
      dbData.quotation_id = parseInt(quotationId);
    }
    if ('product_id' in data && data.product_id !== undefined) {
      dbData.product_id = parseInt(data.product_id);
    }
    if ('product_name' in data && data.product_name !== undefined) {
      dbData.product_name = data.product_name;
    }
    if ('product_sku' in data && data.product_sku !== undefined) {
      dbData.product_sku = data.product_sku;
    }
    if ('quantity' in data && data.quantity !== undefined) {
      dbData.quantity = data.quantity;
    }
    if ('unit_price' in data && data.unit_price !== undefined) {
      dbData.unit_price = data.unit_price;
    }
    if ('discount_amount' in data && data.discount_amount !== undefined) {
      dbData.discount_amount = data.discount_amount;
    }
    if ('tax_amount' in data && data.tax_amount !== undefined) {
      dbData.tax_amount = data.tax_amount;
    }
    if ('description' in data && data.description !== undefined) {
      dbData.description = data.description;
    }

    // Calculate line total if we have the necessary fields
    if (dbData.quantity !== undefined && dbData.unit_price !== undefined) {
      const subtotal = dbData.quantity * dbData.unit_price;
      const discount = dbData.discount_amount || 0;
      const tax = dbData.tax_amount || 0;
      dbData.line_total = subtotal - discount + tax;
    }

    return dbData;
  }

  static toQuotationItemDataArray(dbDataArray: any[]): QuotationItemData[] {
    return dbDataArray.map(dbData => this.toQuotationItemData(dbData));
  }

  static calculateLineTotal(quantity: number, unitPrice: number, discountAmount = 0, taxAmount = 0): number {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }
}
