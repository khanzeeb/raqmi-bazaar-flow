import { Supplier } from '../models/Supplier';
import { PurchaseService } from './purchaseService';

interface SupplierData {
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  status?: 'active' | 'inactive';
  credit_limit?: number;
  notes?: string;
}

interface SupplierFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  country?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SupplierService {
  
  static async createSupplier(supplierData: SupplierData) {
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
  
  static async updateSupplier(supplierId: string, supplierData: Partial<SupplierData>) {
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
  
  static async getSupplierById(supplierId: string) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return supplier;
  }
  
  static async getSuppliers(filters: SupplierFilters = {}) {
    return await Supplier.findAll(filters);
  }
  
  static async deleteSupplier(supplierId: string) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return await Supplier.delete(supplierId);
  }
  
  static async getSupplierStats() {
    return await Supplier.getSupplierStats();
  }
  
  static async getSupplierPurchases(supplierId: string, filters: any = {}) {
    // Verify supplier exists
    const supplier = await this.getSupplierById(supplierId);
    
    return await PurchaseService.getSupplierPurchases(supplierId, filters);
  }
}