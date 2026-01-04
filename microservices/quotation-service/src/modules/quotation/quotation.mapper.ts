import { QuotationData, CreateQuotationDTO, UpdateQuotationDTO } from './quotation.types';

export class QuotationMapper {
  static toQuotationData(dbData: any): QuotationData {
    return {
      id: dbData.id?.toString(),
      quotation_number: dbData.quotation_number,
      customer_id: dbData.customer_id?.toString(),
      customer_name: dbData.customer_name,
      customer_email: dbData.customer_email,
      customer_phone: dbData.customer_phone,
      quotation_date: dbData.quotation_date,
      validity_date: dbData.validity_date,
      subtotal: parseFloat(dbData.subtotal) || 0,
      tax_amount: parseFloat(dbData.tax_amount) || 0,
      discount_amount: parseFloat(dbData.discount_amount) || 0,
      total_amount: parseFloat(dbData.total_amount) || 0,
      currency: dbData.currency || 'SAR',
      status: dbData.status,
      notes: dbData.notes,
      terms_conditions: dbData.terms_conditions,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    };
  }

  static toDatabase(data: CreateQuotationDTO | UpdateQuotationDTO): any {
    const dbData: any = {};

    if ('customer_id' in data && data.customer_id !== undefined) {
      dbData.customer_id = parseInt(data.customer_id);
    }
    if ('quotation_date' in data && data.quotation_date !== undefined) {
      dbData.quotation_date = data.quotation_date;
    }
    if ('validity_date' in data && data.validity_date !== undefined) {
      dbData.validity_date = data.validity_date;
    }
    if ('subtotal' in data && data.subtotal !== undefined) {
      dbData.subtotal = data.subtotal;
    }
    if ('tax_amount' in data && data.tax_amount !== undefined) {
      dbData.tax_amount = data.tax_amount;
    }
    if ('discount_amount' in data && data.discount_amount !== undefined) {
      dbData.discount_amount = data.discount_amount;
    }
    if ('total_amount' in data && data.total_amount !== undefined) {
      dbData.total_amount = data.total_amount;
    }
    if ('currency' in data && data.currency !== undefined) {
      dbData.currency = data.currency;
    }
    if ('status' in data && data.status !== undefined) {
      dbData.status = data.status;
    }
    if ('notes' in data && data.notes !== undefined) {
      dbData.notes = data.notes;
    }
    if ('terms_conditions' in data && data.terms_conditions !== undefined) {
      dbData.terms_conditions = data.terms_conditions;
    }

    return dbData;
  }

  static toQuotationDataArray(dbDataArray: any[]): QuotationData[] {
    return dbDataArray.map(dbData => this.toQuotationData(dbData));
  }
}
