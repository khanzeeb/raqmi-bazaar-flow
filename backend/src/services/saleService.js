const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const PaymentService = require('./paymentService');
const PaymentAllocation = require('../models/PaymentAllocation');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const db = require('../config/database');

class SaleService {
  
  static async createSale(saleData, items = []) {
    const trx = await db.transaction();
    
    try {
      // Validate customer exists and is not blocked
      const customer = await Customer.findById(saleData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      if (customer.status === 'blocked') {
        throw new Error('Cannot create sale for blocked customer');
      }
      
      // Validate products and get product data
      const productIds = items.map(item => item.product_id);
      const products = await Product.findByIds(productIds);
      
      if (products.length !== productIds.length) {
        throw new Error('Some products not found');
      }
      
      // Create sale
      const sale = await Sale.create({
        ...saleData,
        status: 'pending',
        payment_status: 'unpaid'
      });
      
      // Create sale items with product data
      const saleItems = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          sale_id: sale.id,
          product_name: product.name,
          product_sku: product.sku,
          line_total: SaleItem.calculateLineTotal(
            item.quantity,
            item.unit_price,
            item.discount_amount || 0,
            item.tax_amount || 0
          )
        };
      });
      
      await SaleItem.createBulk(sale.id, saleItems);
      
      await trx.commit();
      
      // Return sale with items
      return await this.getSaleById(sale.id);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async updateSale(saleId, saleData, items = null) {
    const trx = await db.transaction();
    
    try {
      const existingSale = await Sale.findById(saleId);
      if (!existingSale) {
        throw new Error('Sale not found');
      }
      
      // Check if sale can be modified
      if (existingSale.status === 'paid' || existingSale.status === 'cancelled') {
        throw new Error('Cannot modify completed or cancelled sale');
      }
      
      // Validate customer if being changed
      if (saleData.customer_id && saleData.customer_id !== existingSale.customer_id) {
        const customer = await Customer.findById(saleData.customer_id);
        if (!customer || customer.status === 'blocked') {
          throw new Error('Invalid or blocked customer');
        }
      }
      
      // Update sale items if provided
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
            product_name: product.name,
            product_sku: product.sku,
            line_total: SaleItem.calculateLineTotal(
              item.quantity,
              item.unit_price,
              item.discount_amount || 0,
              item.tax_amount || 0
            )
          };
        });
        
        await SaleItem.createBulk(saleId, updatedItems);
      }
      
      // Update sale
      const sale = await Sale.update(saleId, saleData);
      
      await trx.commit();
      
      // Return updated sale with items
      return await this.getSaleById(saleId);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getSaleById(saleId) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    // Get sale items
    const items = await SaleItem.findBySaleId(saleId);
    
    // Get payment allocations
    const allocations = await PaymentAllocation.findByOrderId(saleId, 'sale');
    
    return {
      ...sale,
      items,
      allocations
    };
  }
  
  static async getSales(filters = {}) {
    return await Sale.findAll(filters);
  }
  
  static async deleteSale(saleId) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    // Check if sale can be deleted
    if (sale.paid_amount > 0) {
      throw new Error('Cannot delete sale with payments');
    }
    
    return await Sale.delete(saleId);
  }
  
  static async createSalePayment(saleId, paymentData) {
    const trx = await db.transaction();
    
    try {
      const sale = await Sale.findById(saleId);
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      if (sale.status === 'cancelled') {
        throw new Error('Cannot add payment to cancelled sale');
      }
      
      // Calculate how much can be paid
      const maxPayableAmount = sale.balance_amount;
      if (paymentData.amount > maxPayableAmount) {
        // Allow overpayment but warn
        console.log(`Payment amount ${paymentData.amount} exceeds balance ${maxPayableAmount}`);
      }
      
      // Create payment allocation
      const allocation = {
        order_id: saleId,
        order_type: 'sale',
        order_number: sale.sale_number,
        allocated_amount: paymentData.amount
      };
      
      // Create payment with allocation
      const payment = await PaymentService.createPayment({
        customer_id: sale.customer_id,
        amount: paymentData.amount,
        payment_method_code: paymentData.payment_method_code,
        payment_date: paymentData.payment_date,
        reference: paymentData.reference,
        notes: paymentData.notes,
        status: 'completed'
      }, [allocation]);
      
      // Update sale payment amounts
      await Sale.updatePaymentAmounts(saleId);
      
      await trx.commit();
      
      return payment;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async createPartialPayment(saleId, paymentData) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    if (paymentData.amount > sale.balance_amount) {
      throw new Error('Partial payment amount cannot exceed balance amount');
    }
    
    return await this.createSalePayment(saleId, paymentData);
  }
  
  static async createFullPayment(saleId, paymentData) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    // Set payment amount to remaining balance
    paymentData.amount = sale.balance_amount;
    
    return await this.createSalePayment(saleId, paymentData);
  }
  
  static async allocateExistingPayment(saleId, paymentId, allocationAmount) {
    const trx = await db.transaction();
    
    try {
      const sale = await Sale.findById(saleId);
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      const Payment = require('../models/Payment');
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.customer_id !== sale.customer_id) {
        throw new Error('Payment customer does not match sale customer');
      }
      
      if (allocationAmount > payment.unallocated_amount) {
        throw new Error('Allocation amount exceeds unallocated payment amount');
      }
      
      if (allocationAmount > sale.balance_amount) {
        throw new Error('Allocation amount exceeds sale balance');
      }
      
      // Create allocation
      const allocation = await PaymentAllocation.create({
        payment_id: paymentId,
        order_id: saleId,
        order_type: 'sale',
        order_number: sale.sale_number,
        allocated_amount: allocationAmount
      });
      
      // Update sale payment amounts
      await Sale.updatePaymentAmounts(saleId);
      
      await trx.commit();
      
      return allocation;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getSaleStats(filters = {}) {
    return await Sale.getSaleStats(filters);
  }
  
  static async getOverdueSales() {
    return await Sale.getOverdueSales();
  }
  
  static async getCustomerSales(customerId, filters = {}) {
    const saleFilters = { ...filters, customer_id: customerId };
    return await Sale.findAll(saleFilters);
  }
  
  static async markSaleAsOverdue(saleId) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    if (sale.payment_status === 'paid') {
      throw new Error('Cannot mark paid sale as overdue');
    }
    
    return await Sale.update(saleId, { status: 'overdue' });
  }
  
  static async cancelSale(saleId, reason) {
    const trx = await db.transaction();
    
    try {
      const sale = await Sale.findById(saleId);
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      if (sale.paid_amount > 0) {
        throw new Error('Cannot cancel sale with payments. Please process refunds first.');
      }
      
      // Cancel the sale
      const cancelledSale = await Sale.update(saleId, {
        status: 'cancelled',
        notes: sale.notes ? `${sale.notes}\n\nCancelled: ${reason}` : `Cancelled: ${reason}`
      });
      
      await trx.commit();
      
      return cancelledSale;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async generateSaleReport(filters = {}) {
    const sales = await Sale.findAll({ ...filters, limit: 1000 });
    const stats = await Sale.getSaleStats(filters);
    
    return {
      sales: sales.data,
      statistics: stats,
      summary: {
        total_sales: sales.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
  
  static async processOverdueReminders() {
    // Implementation for sending overdue reminders
    const overdueSales = await this.getOverdueSales();
    
    for (const sale of overdueSales) {
      // Mark as overdue if not already
      if (sale.status !== 'overdue') {
        await this.markSaleAsOverdue(sale.id);
      }
      
      // Send reminder logic here (email, SMS, etc.)
      console.log(`Sending overdue reminder for sale ${sale.sale_number} to customer ${sale.customer_name}`);
    }
    
    return overdueSales.length;
  }
}

module.exports = SaleService;