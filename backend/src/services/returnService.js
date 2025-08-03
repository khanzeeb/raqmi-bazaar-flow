const Return = require('../models/Return');
const ReturnItem = require('../models/ReturnItem');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Customer = require('../models/Customer');
const PaymentService = require('./paymentService');
const db = require('../config/database');

class ReturnService {
  
  static async createReturn(returnData, items = []) {
    const trx = await db.transaction();
    
    try {
      // Validate sale exists
      const sale = await Sale.findById(returnData.sale_id);
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      if (sale.status === 'cancelled') {
        throw new Error('Cannot create return for cancelled sale');
      }
      
      // Validate customer
      const customer = await Customer.findById(sale.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Get sale items for validation
      const saleItems = await SaleItem.findBySaleId(returnData.sale_id);
      
      // Validate return items
      let totalReturnAmount = 0;
      const returnItems = [];
      
      for (const item of items) {
        const saleItem = saleItems.find(si => si.id === item.sale_item_id);
        if (!saleItem) {
          throw new Error(`Sale item ${item.sale_item_id} not found`);
        }
        
        // Check available quantity for return
        const returnStats = await ReturnItem.getSaleItemReturnStats(item.sale_item_id);
        const alreadyReturned = returnStats?.total_quantity_returned || 0;
        const availableQuantity = saleItem.quantity - alreadyReturned;
        
        if (item.quantity_returned > availableQuantity) {
          throw new Error(`Cannot return ${item.quantity_returned} of item "${saleItem.product_name}". Only ${availableQuantity} available.`);
        }
        
        const lineTotal = ReturnItem.calculateLineTotal(item.quantity_returned, saleItem.unit_price);
        totalReturnAmount += lineTotal;
        
        returnItems.push({
          sale_item_id: item.sale_item_id,
          product_id: saleItem.product_id,
          product_name: saleItem.product_name,
          product_sku: saleItem.product_sku,
          quantity_returned: item.quantity_returned,
          original_quantity: saleItem.quantity,
          unit_price: saleItem.unit_price,
          line_total: lineTotal,
          condition: item.condition,
          notes: item.notes || null
        });
      }
      
      // Generate return number
      const returnNumber = await Return.generateReturnNumber();
      
      // Create return
      const returnRecord = await Return.create({
        return_number: returnNumber,
        sale_id: returnData.sale_id,
        customer_id: sale.customer_id,
        return_date: returnData.return_date,
        return_type: returnData.return_type,
        reason: returnData.reason,
        notes: returnData.notes,
        total_amount: totalReturnAmount,
        refund_amount: 0,
        status: 'pending',
        refund_status: 'pending'
      });
      
      // Create return items
      await ReturnItem.createBulk(returnRecord.id, returnItems);
      
      await trx.commit();
      
      // Return complete return with items
      return await this.getReturnById(returnRecord.id);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async updateReturn(returnId, returnData) {
    const existingReturn = await Return.findById(returnId);
    if (!existingReturn) {
      throw new Error('Return not found');
    }
    
    // Check if return can be modified
    if (existingReturn.status === 'completed') {
      throw new Error('Cannot modify completed return');
    }
    
    return await Return.update(returnId, returnData);
  }
  
  static async getReturnById(returnId) {
    const returnRecord = await Return.findById(returnId);
    if (!returnRecord) {
      throw new Error('Return not found');
    }
    
    // Get return items
    const items = await ReturnItem.findByReturnId(returnId);
    
    return {
      ...returnRecord,
      items
    };
  }
  
  static async getReturns(filters = {}) {
    return await Return.findAll(filters);
  }
  
  static async getSaleReturns(saleId) {
    return await Return.findBySaleId(saleId);
  }
  
  static async deleteReturn(returnId) {
    const returnRecord = await Return.findById(returnId);
    if (!returnRecord) {
      throw new Error('Return not found');
    }
    
    // Check if return can be deleted
    if (returnRecord.status === 'completed') {
      throw new Error('Cannot delete completed return');
    }
    
    if (returnRecord.refund_status === 'processed') {
      throw new Error('Cannot delete return with processed refund');
    }
    
    return await Return.delete(returnId);
  }
  
  static async processReturn(returnId, processData, processedBy) {
    const trx = await db.transaction();
    
    try {
      const returnRecord = await Return.findById(returnId);
      if (!returnRecord) {
        throw new Error('Return not found');
      }
      
      if (returnRecord.status !== 'pending') {
        throw new Error('Return is not in pending status');
      }
      
      const updateData = {
        status: processData.status,
        processed_by: processedBy,
        processed_at: new Date(),
        notes: processData.notes || returnRecord.notes
      };
      
      if (processData.status === 'approved') {
        updateData.refund_amount = processData.refund_amount || returnRecord.total_amount;
        
        // Create refund payment if refund amount > 0
        if (updateData.refund_amount > 0) {
          await this.createRefundPayment(returnRecord, updateData.refund_amount);
          updateData.refund_status = 'processed';
        }
        
        updateData.status = 'completed';
      } else if (processData.status === 'rejected') {
        updateData.refund_amount = 0;
        updateData.refund_status = 'cancelled';
      }
      
      const updatedReturn = await Return.update(returnId, updateData);
      
      await trx.commit();
      
      return updatedReturn;
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async createRefundPayment(returnRecord, refundAmount) {
    // Create a negative payment for refund
    const refundPayment = {
      customer_id: returnRecord.customer_id,
      amount: -Math.abs(refundAmount), // Negative amount for refund
      payment_method_code: 'REFUND',
      payment_date: new Date(),
      reference: `Refund for return ${returnRecord.return_number}`,
      notes: `Refund for return ${returnRecord.return_number}`,
      status: 'completed'
    };
    
    return await PaymentService.createPayment(refundPayment, []);
  }
  
  static async getSaleStateBeforeReturn(saleId, returnId = null) {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    const saleItems = await SaleItem.findBySaleId(saleId);
    
    // Get returns up to the specified return (or all if returnId is null)
    let returnsQuery = Return.findBySaleId(saleId);
    if (returnId) {
      const targetReturn = await Return.findById(returnId);
      if (targetReturn) {
        returnsQuery = await db('returns')
          .where('sale_id', saleId)
          .where('created_at', '<', targetReturn.created_at)
          .orderBy('created_at');
      }
    }
    
    const returns = Array.isArray(returnsQuery) ? returnsQuery : await returnsQuery;
    
    // Calculate state before this return
    const itemsState = saleItems.map(saleItem => {
      let totalReturned = 0;
      
      for (const ret of returns) {
        // This would need to get return items for each return
        // For simplicity, we'll calculate this in a separate query
      }
      
      return {
        ...saleItem,
        quantity_returned: totalReturned,
        quantity_remaining: saleItem.quantity - totalReturned
      };
    });
    
    return {
      ...sale,
      items: itemsState,
      returns: returns
    };
  }
  
  static async getSaleStateAfterReturn(saleId, returnId) {
    const saleStateBefore = await this.getSaleStateBeforeReturn(saleId, returnId);
    const targetReturn = await this.getReturnById(returnId);
    
    // Apply the target return to calculate state after
    const itemsStateAfter = saleStateBefore.items.map(saleItem => {
      const returnItem = targetReturn.items.find(ri => ri.sale_item_id === saleItem.id);
      const additionalReturned = returnItem ? returnItem.quantity_returned : 0;
      
      return {
        ...saleItem,
        quantity_returned: saleItem.quantity_returned + additionalReturned,
        quantity_remaining: saleItem.quantity_remaining - additionalReturned
      };
    });
    
    return {
      ...saleStateBefore,
      items: itemsStateAfter,
      returns: [...saleStateBefore.returns, targetReturn]
    };
  }
  
  static async getReturnStats(filters = {}) {
    return await Return.getReturnStats(filters);
  }
  
  static async generateReturnReport(filters = {}) {
    const returns = await Return.findAll({ ...filters, limit: 1000 });
    const stats = await Return.getReturnStats(filters);
    
    return {
      returns: returns.data,
      statistics: stats,
      summary: {
        total_returns: returns.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
}

module.exports = ReturnService;