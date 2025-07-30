const Payment = require('../models/Payment');
const PaymentAllocation = require('../models/PaymentAllocation');
const PaymentMethod = require('../models/PaymentMethod');
const Customer = require('../models/Customer');
const db = require('../config/database');

class PaymentService {
  
  static async createPayment(paymentData, allocations = []) {
    const trx = await db.transaction();
    
    try {
      // Validate customer exists and is not blocked
      const customer = await Customer.findById(paymentData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      if (customer.status === 'blocked') {
        throw new Error('Cannot process payment for blocked customer');
      }
      
      // Validate payment method
      const paymentMethod = await PaymentMethod.findByCode(paymentData.payment_method_code);
      if (!paymentMethod || !paymentMethod.is_active) {
        throw new Error('Invalid or inactive payment method');
      }
      
      // Calculate allocated amount
      const totalAllocated = allocations.reduce((sum, allocation) => {
        return sum + parseFloat(allocation.allocated_amount || 0);
      }, 0);
      
      if (totalAllocated > paymentData.amount) {
        throw new Error('Total allocation exceeds payment amount');
      }
      
      // Create payment
      const payment = await Payment.create({
        ...paymentData,
        allocated_amount: totalAllocated,
        unallocated_amount: paymentData.amount - totalAllocated
      });
      
      // Create allocations if provided
      if (allocations.length > 0) {
        await PaymentAllocation.createBulkAllocations(payment.id, allocations);
      }
      
      // Update customer credit if payment method is credit
      if (paymentData.payment_method_code === 'credit') {
        await this.updateCustomerCreditOnPayment(customer.id, paymentData.amount, 'add');
      }
      
      // If payment is completed and has allocations, update order payment status
      if (paymentData.status === 'completed' && allocations.length > 0) {
        await this.updateOrderPaymentStatus(allocations);
      }
      
      await trx.commit();
      
      // Return payment with allocations
      const fullPayment = await this.getPaymentById(payment.id);
      return fullPayment;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async updatePayment(paymentId, paymentData, allocations = null) {
    const trx = await db.transaction();
    
    try {
      const existingPayment = await Payment.findById(paymentId);
      if (!existingPayment) {
        throw new Error('Payment not found');
      }
      
      // Validate customer if being changed
      if (paymentData.customer_id && paymentData.customer_id !== existingPayment.customer_id) {
        const customer = await Customer.findById(paymentData.customer_id);
        if (!customer || customer.status === 'blocked') {
          throw new Error('Invalid or blocked customer');
        }
      }
      
      // Validate payment method if being changed
      if (paymentData.payment_method_code) {
        const paymentMethod = await PaymentMethod.findByCode(paymentData.payment_method_code);
        if (!paymentMethod || !paymentMethod.is_active) {
          throw new Error('Invalid or inactive payment method');
        }
      }
      
      // Handle allocation updates
      if (allocations !== null) {
        const totalAllocated = allocations.reduce((sum, allocation) => {
          return sum + parseFloat(allocation.allocated_amount || 0);
        }, 0);
        
        const amount = paymentData.amount || existingPayment.amount;
        if (totalAllocated > amount) {
          throw new Error('Total allocation exceeds payment amount');
        }
        
        // Update allocations
        await PaymentAllocation.createBulkAllocations(paymentId, allocations);
        
        // Update payment allocation amounts
        paymentData.allocated_amount = totalAllocated;
        paymentData.unallocated_amount = amount - totalAllocated;
      }
      
      // Update payment
      const payment = await Payment.update(paymentId, paymentData);
      
      await trx.commit();
      
      // Return updated payment with allocations
      const fullPayment = await this.getPaymentById(paymentId);
      return fullPayment;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Get allocations
    const allocations = await PaymentAllocation.findByPaymentId(paymentId);
    
    return {
      ...payment,
      allocations
    };
  }
  
  static async getPayments(filters = {}) {
    return await Payment.findAll(filters);
  }
  
  static async deletePayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Check if payment can be deleted (no dependent records)
    const allocations = await PaymentAllocation.findByPaymentId(paymentId);
    if (allocations.length > 0 && payment.status === 'completed') {
      throw new Error('Cannot delete payment with completed allocations');
    }
    
    return await Payment.delete(paymentId);
  }
  
  static async approvePayment(paymentId, approvedBy) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'pending') {
      throw new Error('Only pending payments can be approved');
    }
    
    // Check if payment method requires approval
    const paymentMethod = await PaymentMethod.findByCode(payment.payment_method_code);
    if (!paymentMethod.requires_approval) {
      throw new Error('This payment method does not require approval');
    }
    
    return await Payment.update(paymentId, {
      status: 'completed',
      approved_at: new Date(),
      approved_by: approvedBy
    });
  }
  
  static async getPaymentStats(filters = {}) {
    return await Payment.getPaymentStats(filters);
  }
  
  static async updateCustomerCreditOnPayment(customerId, amount, type) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return await Customer.updateCredit(customerId, amount, type);
  }
  
  static async updateOrderPaymentStatus(allocations) {
    // This would update the payment status in the respective order tables
    // Implementation depends on the order management system structure
    for (const allocation of allocations) {
      // Update order payment status based on allocation
      // This is a placeholder - actual implementation would depend on order tables
      console.log(`Updating payment status for order ${allocation.order_number}`);
    }
  }
  
  static async getCustomerPaymentHistory(customerId, filters = {}) {
    const paymentFilters = { ...filters, customer_id: customerId };
    return await Payment.findAll(paymentFilters);
  }
  
  static async generatePaymentReport(filters = {}) {
    const payments = await Payment.findAll({ ...filters, limit: 1000 });
    const stats = await Payment.getPaymentStats(filters);
    
    return {
      payments: payments.data,
      statistics: stats,
      summary: {
        total_payments: payments.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
  
  static async processRecurringPayments() {
    // Implementation for processing recurring payments
    // This would be called by a scheduled job
    console.log('Processing recurring payments...');
    // Implementation depends on business requirements
  }
  
  static async refundPayment(paymentId, refundData) {
    const trx = await db.transaction();
    
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }
      
      // Create refund payment (negative amount)
      const refundPayment = await Payment.create({
        customer_id: payment.customer_id,
        amount: -Math.abs(refundData.amount),
        payment_method_code: payment.payment_method_code,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        reference: `REFUND-${payment.payment_number}`,
        notes: refundData.reason || 'Payment refund',
        metadata: {
          original_payment_id: paymentId,
          refund_type: 'full_refund'
        }
      });
      
      // Update customer credit if applicable
      if (payment.payment_method_code === 'credit') {
        await this.updateCustomerCreditOnPayment(payment.customer_id, refundData.amount, 'subtract');
      }
      
      await trx.commit();
      return refundPayment;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = PaymentService;