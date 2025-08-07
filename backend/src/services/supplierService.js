const Supplier = require('../models/Supplier');
const PurchaseService = require('./purchaseService');

class SupplierService {
  
  static async createSupplier(supplierData) {
    try {
      // Check if email already exists
      if (supplierData.email) {
        const existingSupplier = await Supplier.findByEmail(supplierData.email);
        if (existingSupplier) {
          throw new Error('Supplier with this email already exists');
        }
      }
      
      const supplier = await Supplier.create(supplierData);
      return supplier;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async updateSupplier(supplierId, supplierData) {
    try {
      const existingSupplier = await Supplier.findById(supplierId);
      if (!existingSupplier) {
        throw new Error('Supplier not found');
      }
      
      // Check if email is being changed and if it already exists
      if (supplierData.email && supplierData.email !== existingSupplier.email) {
        const emailExists = await Supplier.findByEmail(supplierData.email);
        if (emailExists) {
          throw new Error('Supplier with this email already exists');
        }
      }
      
      const supplier = await Supplier.update(supplierId, supplierData);
      return supplier;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async getSupplierById(supplierId) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return supplier;
  }
  
  static async getSuppliers(filters = {}) {
    return await Supplier.findAll(filters);
  }
  
  static async deleteSupplier(supplierId) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return await Supplier.delete(supplierId);
  }
  
  static async getSupplierStats() {
    return await Supplier.getSupplierStats();
  }
  
  static async getSupplierPurchases(supplierId, filters = {}) {
    // Verify supplier exists
    const supplier = await this.getSupplierById(supplierId);
    
    return await PurchaseService.getSupplierPurchases(supplierId, filters);
  }
}

module.exports = SupplierService;