const db = require('../config/database');

class Invoice {
  static get tableName() {
    return 'invoices';
  }

  static async findById(id) {
    const invoice = await db(this.tableName)
      .leftJoin('customers', 'invoices.customer_id', 'customers.id')
      .select('invoices.*', 'customers.name as customer_name', 'customers.email as customer_email')
      .where('invoices.id', id)
      .first();
    
    if (invoice) {
      invoice.items = await db('invoice_items')
        .leftJoin('products', 'invoice_items.product_id', 'products.id')
        .select('invoice_items.*', 'products.name as product_name', 'products.sku')
        .where('invoice_items.invoice_id', id);
      
      invoice.payments = await db('payments')
        .where('invoice_id', id)
        .orderBy('created_at', 'desc');
    }
    
    return invoice;
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName)
      .leftJoin('customers', 'invoices.customer_id', 'customers.id')
      .select('invoices.*', 'customers.name as customer_name');
    
    if (filters.status) {
      query = query.where('invoices.status', filters.status);
    }
    
    if (filters.customer_id) {
      query = query.where('invoices.customer_id', filters.customer_id);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('invoices.invoice_number', 'ilike', `%${filters.search}%`)
            .orWhere('customers.name', 'ilike', `%${filters.search}%`);
      });
    }
    
    if (filters.date_from) {
      query = query.where('invoices.created_at', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('invoices.created_at', '<=', filters.date_to);
    }
    
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const invoices = await query
      .orderBy(filters.sortBy || 'invoices.created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: invoices,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName).count('* as count');
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(invoiceData) {
    const trx = await db.transaction();
    
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      const [invoice] = await trx(this.tableName)
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      // Insert invoice items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map(item => ({
          ...item,
          invoice_id: invoice.id,
          line_total: item.quantity * item.price
        }));
        
        await trx('invoice_items').insert(items);
        
        // Update product stock
        for (const item of invoiceData.items) {
          await trx('products')
            .where({ id: item.product_id })
            .decrement('stock', item.quantity);
          
          // Log stock movement
          await trx('stock_movements').insert({
            product_id: item.product_id,
            type: 'sale',
            quantity: -item.quantity,
            reference_id: invoice.id,
            reference_type: 'invoice',
            created_at: new Date()
          });
        }
      }
      
      await trx.commit();
      return await this.findById(invoice.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id, invoiceData) {
    const [invoice] = await db(this.tableName)
      .where({ id })
      .update({
        ...invoiceData,
        updated_at: new Date()
      })
      .returning('*');
    
    return invoice;
  }

  static async delete(id) {
    const trx = await db.transaction();
    
    try {
      // Get invoice items to restore stock
      const items = await trx('invoice_items').where({ invoice_id: id });
      
      // Restore product stock
      for (const item of items) {
        await trx('products')
          .where({ id: item.product_id })
          .increment('stock', item.quantity);
      }
      
      // Delete related records
      await trx('invoice_items').where({ invoice_id: id }).del();
      await trx('payments').where({ invoice_id: id }).del();
      await trx('stock_movements').where({ reference_id: id, reference_type: 'invoice' }).del();
      await trx(this.tableName).where({ id }).del();
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}-`;
    
    const lastInvoice = await db(this.tableName)
      .where('invoice_number', 'like', `${prefix}%`)
      .orderBy('invoice_number', 'desc')
      .first();
    
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  static async updateStatus(id, status) {
    const [invoice] = await db(this.tableName)
      .where({ id })
      .update({
        status,
        updated_at: new Date()
      })
      .returning('*');
    
    return invoice;
  }

  static async getInvoiceStats(filters = {}) {
    let query = db(this.tableName);
    
    if (filters.date_from) {
      query = query.where('created_at', '>=', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.where('created_at', '<=', filters.date_to);
    }
    
    const stats = await query
      .select(
        db.raw('COUNT(*) as total_invoices'),
        db.raw('SUM(total) as total_revenue'),
        db.raw('SUM(CASE WHEN status = ? THEN total ELSE 0 END) as paid_amount', ['paid']),
        db.raw('SUM(CASE WHEN status = ? THEN total ELSE 0 END) as pending_amount', ['pending']),
        db.raw('AVG(total) as average_invoice')
      )
      .first();
    
    return stats;
  }
}

module.exports = Invoice;