const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const db = require('../config/database');

class PurchaseService {
  
  static async createPurchase(purchaseData, items = []) {
    const trx = await db.transaction();
    
    try {
      // Validate supplier exists and is active
      const supplier = await Supplier.findById(purchaseData.supplier_id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      
      if (supplier.status !== 'active') {
        throw new Error('Cannot create purchase for inactive supplier');
      }
      
      // Validate products and get product data
      const productIds = items.map(item => item.product_id);
      const products = await Product.findByIds(productIds);
      
      if (products.length !== productIds.length) {
        throw new Error('Some products not found');
      }
      
      // Create purchase
      const purchase = await Purchase.create({
        ...purchaseData,
        status: 'pending'
      });
      
      // Create purchase items with product data
      const purchaseItems = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          purchase_id: purchase.id,
          product_name: product.name,
          product_sku: product.sku,
          description: item.description || product.description,
          line_total: PurchaseItem.calculateLineTotal(
            item.quantity,
            item.unit_price,
            item.discount_amount || 0,
            item.tax_amount || 0
          )
        };
      });
      
      await PurchaseItem.createBulk(purchase.id, purchaseItems);
      
      await trx.commit();
      
      // Return purchase with items
      return await this.getPurchaseById(purchase.id);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async updatePurchase(purchaseId, purchaseData, items = null) {
    const trx = await db.transaction();
    
    try {
      const existingPurchase = await Purchase.findById(purchaseId);
      if (!existingPurchase) {
        throw new Error('Purchase not found');
      }
      
      // Check if purchase can be modified
      if (existingPurchase.status === 'received' || existingPurchase.status === 'cancelled') {
        throw new Error('Cannot modify received or cancelled purchase');
      }
      
      // Validate supplier if being changed
      if (purchaseData.supplier_id && purchaseData.supplier_id !== existingPurchase.supplier_id) {
        const supplier = await Supplier.findById(purchaseData.supplier_id);
        if (!supplier || supplier.status !== 'active') {
          throw new Error('Invalid or inactive supplier');
        }
      }
      
      // Update purchase items if provided
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
            description: item.description || product.description,
            line_total: PurchaseItem.calculateLineTotal(
              item.quantity,
              item.unit_price,
              item.discount_amount || 0,
              item.tax_amount || 0
            )
          };
        });
        
        await PurchaseItem.createBulk(purchaseId, updatedItems);
      }
      
      // Update purchase
      const purchase = await Purchase.update(purchaseId, purchaseData);
      
      await trx.commit();
      
      // Return updated purchase with items
      return await this.getPurchaseById(purchaseId);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async getPurchaseById(purchaseId) {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Get purchase items
    const items = await PurchaseItem.findByPurchaseId(purchaseId);
    
    return {
      ...purchase,
      items
    };
  }
  
  static async getPurchases(filters = {}) {
    return await Purchase.findAll(filters);
  }
  
  static async deletePurchase(purchaseId) {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Check if purchase can be deleted
    if (purchase.status === 'received') {
      throw new Error('Cannot delete received purchase');
    }
    
    return await Purchase.delete(purchaseId);
  }
  
  static async updatePurchaseStatus(purchaseId, status) {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Validate status transitions
    const validTransitions = {
      'pending': ['ordered', 'cancelled'],
      'ordered': ['received', 'cancelled'],
      'received': [],
      'cancelled': []
    };
    
    if (!validTransitions[purchase.status].includes(status)) {
      throw new Error(`Cannot change status from ${purchase.status} to ${status}`);
    }
    
    return await Purchase.update(purchaseId, { status });
  }
  
  static async markAsReceived(purchaseId, receivedData = {}) {
    const purchase = await this.getPurchaseById(purchaseId);
    
    if (purchase.status !== 'ordered') {
      throw new Error('Only ordered purchases can be marked as received');
    }
    
    const trx = await db.transaction();
    
    try {
      const updateData = {
        status: 'received',
        received_date: new Date().toISOString().split('T')[0]
      };
      
      // Update received quantities for items if provided
      if (receivedData.items) {
        for (const itemUpdate of receivedData.items) {
          await PurchaseItem.updateReceivedQuantity(
            itemUpdate.id, 
            itemUpdate.received_quantity
          );
        }
      }
      
      await Purchase.update(purchaseId, updateData);
      
      await trx.commit();
      
      return await this.getPurchaseById(purchaseId);
      
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  
  static async addPayment(purchaseId, paymentData) {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    const newPaidAmount = parseFloat(purchase.paid_amount) + parseFloat(paymentData.amount);
    const totalAmount = parseFloat(purchase.total_amount);
    
    if (newPaidAmount > totalAmount) {
      throw new Error('Payment amount exceeds total purchase amount');
    }
    
    // Determine payment status
    let paymentStatus = 'pending';
    if (newPaidAmount === totalAmount) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    }
    
    return await Purchase.update(purchaseId, {
      paid_amount: newPaidAmount,
      payment_status: paymentStatus
    });
  }
  
  static async getPurchaseStats(filters = {}) {
    return await Purchase.getPurchaseStats(filters);
  }
  
  static async getSupplierPurchases(supplierId, filters = {}) {
    const purchaseFilters = { ...filters, supplier_id: supplierId };
    return await Purchase.findAll(purchaseFilters);
  }
  
  static async generatePurchaseReport(filters = {}) {
    const purchases = await Purchase.findAll({ ...filters, limit: 1000 });
    const stats = await Purchase.getPurchaseStats(filters);
    
    return {
      purchases: purchases.data,
      statistics: stats,
      summary: {
        total_purchases: purchases.total,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        }
      }
    };
  }
}

module.exports = PurchaseService;