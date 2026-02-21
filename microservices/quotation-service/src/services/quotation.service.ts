import db from '../config/database';
import {
  Quotation,
  QuotationItem,
  QuotationHistory,
  QuotationStatus,
  QuotationAction,
  CreateQuotationInput,
  UpdateQuotationInput,
  QuotationFilters,
} from '../types';

export class QuotationService {

  // ─── Create ────────────────────────────────────────────────────────
  static async create(input: CreateQuotationInput) {
    const trx = await db.transaction();

    try {
      const quotationNumber = await this.generateQuotationNumber(trx);
      const quotationDate = input.quotation_date ? new Date(input.quotation_date) : new Date();
      const validityDays = input.validity_days || 30;
      const validityDate = new Date(quotationDate);
      validityDate.setDate(validityDate.getDate() + validityDays);

      const { subtotal, taxAmount, totalAmount } = this.calculateTotals(
        input.items,
        input.tax_rate || 0,
        input.discount || 0,
      );

      const [quotation] = await trx('quotations').insert({
        quotation_number: quotationNumber,
        customer_id: input.customer_id || `CUST-${Date.now()}`,
        customer_name: input.customer.name,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
        customer_type: input.customer.type || 'individual',
        quotation_date: quotationDate,
        validity_date: validityDate,
        validity_days: validityDays,
        subtotal,
        tax_rate: input.tax_rate || 0,
        tax_amount: taxAmount,
        discount_amount: input.discount || 0,
        total_amount: totalAmount,
        currency: input.currency || 'SAR',
        notes: input.notes,
        terms_conditions: input.terms_conditions,
        status: QuotationStatus.DRAFT,
      }).returning('*');

      // Insert items
      const itemRows = input.items.map(item => ({
        quotation_id: quotation.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        tax_amount: item.tax_amount || 0,
        line_total: this.calculateLineTotal(item),
      }));

      if (itemRows.length > 0) {
        await trx('quotation_items').insert(itemRows);
      }

      // History
      await trx('quotation_history').insert({
        quotation_id: quotation.id,
        action: QuotationAction.CREATED,
        notes: 'Quotation created',
      });

      await trx.commit();
      return this.findOne(quotation.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // ─── Find All ──────────────────────────────────────────────────────
  static async findAll(filters: QuotationFilters = {}) {
    const { page = 1, limit = 10, search, status, customer_id, date_from, date_to, sort_by = 'created_at', sort_order = 'desc' } = filters;
    const offset = (page - 1) * limit;

    let query = db('quotations');

    if (search) {
      query = query.where(function () {
        this.where('quotation_number', 'ilike', `%${search}%`)
          .orWhere('customer_name', 'ilike', `%${search}%`);
      });
    }
    if (status) query = query.where('status', status);
    if (customer_id) query = query.where('customer_id', customer_id);
    if (date_from) query = query.where('quotation_date', '>=', date_from);
    if (date_to) query = query.where('quotation_date', '<=', date_to);

    const countResult = await query.clone().count('id as total').first();
    const total = Number(countResult?.total || 0);

    const data = await query
      .orderBy(sort_by, sort_order)
      .offset(offset)
      .limit(limit);

    // Attach items to each quotation
    const ids = data.map((q: Quotation) => q.id);
    const items = ids.length > 0
      ? await db('quotation_items').whereIn('quotation_id', ids)
      : [];

    const dataWithItems = data.map((q: Quotation) => ({
      ...q,
      items: items.filter((i: QuotationItem) => i.quotation_id === q.id),
    }));

    return {
      data: dataWithItems.map((q: any) => this.mapToResponse(q)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Find One ──────────────────────────────────────────────────────
  static async findOne(id: string) {
    const quotation = await db('quotations').where('id', id).first();
    if (!quotation) throw new Error(`Quotation with ID ${id} not found`);

    const items = await db('quotation_items').where('quotation_id', id);
    const history = await db('quotation_history').where('quotation_id', id).orderBy('timestamp', 'asc');

    return { ...quotation, items, history };
  }

  // ─── Update ────────────────────────────────────────────────────────
  static async update(id: string, input: UpdateQuotationInput) {
    const trx = await db.transaction();

    try {
      const quotation = await trx('quotations').where('id', id).first();
      if (!quotation) throw new Error('Quotation not found');

      if (quotation.status === QuotationStatus.CONVERTED || quotation.status === QuotationStatus.ACCEPTED) {
        throw new Error('Cannot modify converted or accepted quotation');
      }

      const updateData: Record<string, any> = { updated_at: new Date() };

      if (input.customer) {
        updateData.customer_name = input.customer.name;
        updateData.customer_email = input.customer.email;
        updateData.customer_phone = input.customer.phone;
        if (input.customer.type) updateData.customer_type = input.customer.type;
      }

      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.terms_conditions !== undefined) updateData.terms_conditions = input.terms_conditions;
      if (input.validity_days !== undefined) {
        updateData.validity_days = input.validity_days;
        const validityDate = new Date(quotation.quotation_date);
        validityDate.setDate(validityDate.getDate() + input.validity_days);
        updateData.validity_date = validityDate;
      }

      if (input.items) {
        await trx('quotation_items').where('quotation_id', id).del();

        const { subtotal, taxAmount, totalAmount } = this.calculateTotals(
          input.items,
          input.tax_rate ?? quotation.tax_rate,
          input.discount ?? quotation.discount_amount,
        );

        updateData.subtotal = subtotal;
        updateData.tax_amount = taxAmount;
        updateData.total_amount = totalAmount;

        const itemRows = input.items.map(item => ({
          quotation_id: id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          line_total: this.calculateLineTotal(item),
        }));

        if (itemRows.length > 0) {
          await trx('quotation_items').insert(itemRows);
        }
      }

      await trx('quotations').where('id', id).update(updateData);

      await trx('quotation_history').insert({
        quotation_id: id,
        action: QuotationAction.UPDATED,
        notes: 'Quotation updated',
      });

      await trx.commit();
      return this.findOne(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────
  static async remove(id: string) {
    const quotation = await db('quotations').where('id', id).first();
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new Error('Cannot delete converted quotation');
    }
    await db('quotations').where('id', id).del();
  }

  // ─── Status transitions ───────────────────────────────────────────
  static async send(id: string) {
    const quotation = await this.findOne(id);
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new Error('Can only send draft quotations');
    }
    await db('quotations').where('id', id).update({ status: QuotationStatus.SENT, updated_at: new Date() });
    await this.addHistory(id, QuotationAction.SENT, 'Quotation sent to customer');
    return this.findOne(id);
  }

  static async accept(id: string) {
    const quotation = await this.findOne(id);
    if (quotation.status !== QuotationStatus.SENT) {
      throw new Error('Can only accept sent quotations');
    }
    await db('quotations').where('id', id).update({ status: QuotationStatus.ACCEPTED, updated_at: new Date() });
    await this.addHistory(id, QuotationAction.ACCEPTED, 'Quotation accepted by customer');
    return this.findOne(id);
  }

  static async decline(id: string, reason?: string) {
    const quotation = await this.findOne(id);
    if (quotation.status !== QuotationStatus.SENT) {
      throw new Error('Can only decline sent quotations');
    }
    await db('quotations').where('id', id).update({
      status: QuotationStatus.DECLINED,
      decline_reason: reason,
      updated_at: new Date(),
    });
    await this.addHistory(id, QuotationAction.DECLINED, reason || 'Quotation declined by customer');
    return this.findOne(id);
  }

  static async convertToSale(id: string) {
    const quotation = await this.findOne(id);
    if (quotation.status !== QuotationStatus.ACCEPTED) {
      throw new Error('Can only convert accepted quotations to sales');
    }

    const saleOrderNumber = `SO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;

    await db('quotations').where('id', id).update({
      status: QuotationStatus.CONVERTED,
      converted_to_sale_id: saleOrderNumber,
      updated_at: new Date(),
    });
    await this.addHistory(id, QuotationAction.CONVERTED_TO_SALE, `Converted to sales order: ${saleOrderNumber}`);

    return {
      quotation: await this.findOne(id),
      saleOrderId: saleOrderNumber,
    };
  }

  static async updateStatus(id: string, status: QuotationStatus) {
    await db('quotations').where('id', id).update({ status, updated_at: new Date() });
    return this.findOne(id);
  }

  // ─── Stats ─────────────────────────────────────────────────────────
  static async getStats(filters: { dateFrom?: string; dateTo?: string } = {}) {
    let query = db('quotations');
    if (filters.dateFrom) query = query.where('quotation_date', '>=', filters.dateFrom);
    if (filters.dateTo) query = query.where('quotation_date', '<=', filters.dateTo);

    const [total, draft, sent, accepted, declined, expired, converted, totalValue, avgAmount] = await Promise.all([
      query.clone().count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'draft').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'sent').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'accepted').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'declined').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'expired').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().where('status', 'converted').count('id as c').first().then(r => Number(r?.c || 0)),
      query.clone().sum('total_amount as v').first().then(r => parseFloat(String(r?.v || 0))),
      query.clone().avg('total_amount as v').first().then(r => parseFloat(String(r?.v || 0))),
    ]);

    return {
      total_quotations: total,
      draft_count: draft,
      sent_count: sent,
      accepted_count: accepted,
      declined_count: declined,
      expired_count: expired,
      converted_count: converted,
      total_value: totalValue,
      average_quotation_amount: avgAmount,
    };
  }

  // ─── Expired ───────────────────────────────────────────────────────
  static async getExpired() {
    return db('quotations')
      .whereIn('status', [QuotationStatus.DRAFT, QuotationStatus.SENT])
      .where('validity_date', '<', new Date());
  }

  static async processExpired() {
    const expired = await this.getExpired();
    let count = 0;
    for (const q of expired) {
      await db('quotations').where('id', q.id).update({ status: QuotationStatus.EXPIRED, updated_at: new Date() });
      await this.addHistory(q.id, QuotationAction.EXPIRED, 'Quotation expired due to validity date passed');
      count++;
    }
    return count;
  }

  // ─── Report ────────────────────────────────────────────────────────
  static async getReport(filters: QuotationFilters = {}) {
    const quotations = await this.findAll(filters);
    const stats = await this.getStats({ dateFrom: filters.date_from, dateTo: filters.date_to });

    return {
      quotations: quotations.data,
      statistics: stats,
      summary: {
        total_quotations: quotations.total,
        date_range: { from: filters.date_from, to: filters.date_to },
      },
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────
  private static async generateQuotationNumber(trxOrDb: any = db) {
    const date = new Date();
    const prefix = `QT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

    const last = await trxOrDb('quotations')
      .where('quotation_number', 'like', `${prefix}%`)
      .orderBy('quotation_number', 'desc')
      .first();

    const sequence = last
      ? parseInt(last.quotation_number.split('-').pop() || '0') + 1
      : 1;

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  private static calculateLineTotal(item: { quantity: number; unit_price: number; discount_amount?: number; tax_amount?: number }): number {
    return (item.quantity * item.unit_price) - (item.discount_amount || 0) + (item.tax_amount || 0);
  }

  private static calculateTotals(items: any[], taxRate: number, discount: number) {
    const subtotal = items.reduce((sum, item) => sum + this.calculateLineTotal(item), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, totalAmount };
  }

  private static async addHistory(quotationId: string, action: QuotationAction, notes?: string) {
    await db('quotation_history').insert({ quotation_id: quotationId, action, notes });
  }

  static mapToResponse(quotation: any) {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotation_number,
      customer: {
        name: quotation.customer_name,
        email: quotation.customer_email,
        phone: quotation.customer_phone,
        type: quotation.customer_type,
      },
      customerId: quotation.customer_id,
      quotationDate: quotation.quotation_date,
      validityDate: quotation.validity_date,
      validityDays: quotation.validity_days,
      expiryDate: quotation.validity_date,
      subtotal: Number(quotation.subtotal),
      taxRate: Number(quotation.tax_rate),
      taxAmount: Number(quotation.tax_amount),
      discount: Number(quotation.discount_amount),
      total: Number(quotation.total_amount),
      currency: quotation.currency,
      status: quotation.status,
      notes: quotation.notes,
      termsConditions: quotation.terms_conditions,
      convertedToSaleId: quotation.converted_to_sale_id,
      items: (quotation.items || []).map((item: any) => ({
        id: item.id,
        name: item.product_name,
        productId: item.product_id,
        productSku: item.product_sku,
        quantity: Number(item.quantity),
        price: Number(item.unit_price),
        total: Number(item.line_total),
      })),
      history: (quotation.history || []).map((h: any) => ({
        id: h.id,
        action: h.action,
        timestamp: h.timestamp,
        notes: h.notes,
      })),
      createdAt: quotation.created_at,
      updatedAt: quotation.updated_at,
    };
  }
}
