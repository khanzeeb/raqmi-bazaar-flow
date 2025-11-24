import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';
import { Invoice, InvoiceFilters, CreateInvoiceDTO } from '../models/Invoice';
import { IInvoiceRepository } from '../interfaces/IRepository';

export class InvoiceRepository extends BaseRepository<Invoice, InvoiceFilters> implements IInvoiceRepository {
  constructor() {
    super('invoices');
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: any): Knex.QueryBuilder {
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    if (filters.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }
    if (filters.from_date) {
      query = query.where('issue_date', '>=', filters.from_date);
    }
    if (filters.to_date) {
      query = query.where('issue_date', '<=', filters.to_date);
    }
    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where('invoice_number', 'ilike', `%${filters.search}%`)
          .orWhere('customer_name', 'ilike', `%${filters.search}%`)
          .orWhere('customer_email', 'ilike', `%${filters.search}%`);
      });
    }
    return query;
  }

  async createWithItems(invoiceData: any, items: any[]): Promise<Invoice> {
    return this.transaction(async (trx) => {
      const invoiceNumber = await this.generateInvoiceNumber();
      const [invoice] = await trx('invoices')
        .insert({ ...invoiceData, invoice_number: invoiceNumber })
        .returning('*');

      if (items.length > 0) {
        await trx('invoice_items').insert(
          items.map(item => ({ ...item, invoice_id: invoice.id }))
        );
      }

      return invoice;
    });
  }

  async updateWithItems(id: string, invoiceData: any, items?: any[]): Promise<Invoice | null> {
    return this.transaction(async (trx) => {
      const [invoice] = await trx('invoices')
        .where({ id })
        .update({ ...invoiceData, updated_at: trx.fn.now() })
        .returning('*');

      if (items && items.length > 0) {
        await trx('invoice_items').where({ invoice_id: id }).delete();
        await trx('invoice_items').insert(
          items.map(item => ({ ...item, invoice_id: id }))
        );
      }

      return invoice || null;
    });
  }

  async updateStatus(id: string, status: string): Promise<Invoice | null> {
    const updateData: any = { status, updated_at: this.db.fn.now() };
    
    if (status === 'overdue') {
      const invoice = await this.findById(id);
      if (invoice && invoice.balance > 0) {
        updateData.status = 'overdue';
      }
    }

    const [result] = await this.db('invoices')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    return result || null;
  }

  async recordPayment(id: string, amount: number, paymentData: any): Promise<Invoice | null> {
    return this.transaction(async (trx) => {
      const invoice = await trx('invoices').where({ id }).first();
      if (!invoice) return null;

      const newPaidAmount = parseFloat(invoice.paid_amount) + amount;
      const newBalance = parseFloat(invoice.total_amount) - newPaidAmount;
      const newStatus = newBalance <= 0 ? 'paid' : invoice.status;

      const [updatedInvoice] = await trx('invoices')
        .where({ id })
        .update({
          paid_amount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
          updated_at: trx.fn.now(),
        })
        .returning('*');

      return updatedInvoice;
    });
  }

  async markAsSent(id: string): Promise<Invoice | null> {
    return this.updateStatus(id, 'sent');
  }

  async markAsPaid(id: string): Promise<Invoice | null> {
    return this.transaction(async (trx) => {
      const invoice = await trx('invoices').where({ id }).first();
      if (!invoice) return null;

      const [updatedInvoice] = await trx('invoices')
        .where({ id })
        .update({
          paid_amount: invoice.total_amount,
          balance: 0,
          status: 'paid',
          updated_at: trx.fn.now(),
        })
        .returning('*');

      return updatedInvoice;
    });
  }

  async getStats(filters: InvoiceFilters = {}): Promise<any> {
    let query = this.db('invoices');
    query = this.applyFilters(query, filters);

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_invoices'),
        this.db.raw('SUM(total_amount) as total_amount'),
        this.db.raw('SUM(paid_amount) as total_paid'),
        this.db.raw('SUM(balance) as total_outstanding'),
        this.db.raw("COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count"),
        this.db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count"),
        this.db.raw("COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count"),
        this.db.raw("COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count"),
        this.db.raw("COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count")
      )
      .first();

    return {
      total_invoices: parseInt(stats.total_invoices) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      total_paid: parseFloat(stats.total_paid) || 0,
      total_outstanding: parseFloat(stats.total_outstanding) || 0,
      by_status: {
        draft: parseInt(stats.draft_count) || 0,
        sent: parseInt(stats.sent_count) || 0,
        paid: parseInt(stats.paid_count) || 0,
        overdue: parseInt(stats.overdue_count) || 0,
        cancelled: parseInt(stats.cancelled_count) || 0,
      },
    };
  }

  async getByStatus(filters: InvoiceFilters = {}): Promise<any[]> {
    let query = this.db('invoices');
    query = this.applyFilters(query, filters);

    return query
      .select('status')
      .count('* as count')
      .sum('total_amount as total_amount')
      .sum('paid_amount as paid_amount')
      .sum('balance as balance')
      .groupBy('status')
      .orderBy('status');
  }

  async generateInvoiceNumber(): Promise<string> {
    const result = await this.db('invoices')
      .max('invoice_number as max_number')
      .first();

    if (!result?.max_number) {
      return 'INV-0001';
    }

    const lastNumber = parseInt(result.max_number.split('-')[1]);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `INV-${newNumber}`;
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.db('invoices')
      .where('due_date', '<', this.db.fn.now())
      .where('balance', '>', 0)
      .whereIn('status', ['sent', 'overdue']);
  }
}
