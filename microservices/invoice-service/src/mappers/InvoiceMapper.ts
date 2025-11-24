import { Invoice } from '../models/Invoice';

export class InvoiceMapper {
  static toDTO(invoice: Invoice): any {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      customerPhone: invoice.customer_phone,
      customerAddress: invoice.customer_address,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      status: invoice.status,
      subtotal: parseFloat(invoice.subtotal.toString()),
      taxAmount: parseFloat(invoice.tax_amount.toString()),
      taxRate: parseFloat(invoice.tax_rate.toString()),
      discountAmount: parseFloat(invoice.discount_amount.toString()),
      discountType: invoice.discount_type,
      totalAmount: parseFloat(invoice.total_amount.toString()),
      paidAmount: parseFloat(invoice.paid_amount.toString()),
      balance: parseFloat(invoice.balance.toString()),
      notes: invoice.notes,
      terms: invoice.terms,
      paymentTerms: invoice.payment_terms,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    };
  }

  static toDTOList(invoices: Invoice[]): any[] {
    return invoices.map(invoice => this.toDTO(invoice));
  }
}
