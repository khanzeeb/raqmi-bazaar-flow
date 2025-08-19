import { BaseService } from '../common/BaseService';
import { ISupplierService } from '../interfaces/IService';
import SupplierRepository from '../models/Supplier';
import { SupplierData, SupplierFilters } from '../models/Supplier';

export interface CreateSupplierDTO {
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  country?: string;
  tax_number?: string;
  status?: 'active' | 'inactive';
  credit_limit?: number;
  payment_terms?: string;
  notes?: string;
}

export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {}

class SupplierService extends BaseService<SupplierData, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters> implements ISupplierService {
  constructor() {
    super(SupplierRepository);
  }

  protected async validateCreateData(data: CreateSupplierDTO): Promise<any> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Supplier name is required');
    }
    
    if (data.email) {
      const existingSupplier = await SupplierRepository.findByEmail(data.email);
      if (existingSupplier) {
        throw new Error('Supplier with this email already exists');
      }
    }
    
    // Set default values
    const defaults = {
      status: 'active',
      credit_limit: 0
    };
    
    return { ...defaults, ...data };
  }

  protected async validateUpdateData(data: UpdateSupplierDTO): Promise<any> {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Supplier name cannot be empty');
    }
    
    if (data.email) {
      const existingSupplier = await SupplierRepository.findByEmail(data.email);
      if (existingSupplier) {
        throw new Error('Supplier with this email already exists');
      }
    }
    
    return data;
  }

  async getSupplierStats(): Promise<any> {
    return await SupplierRepository.getSupplierStats();
  }

  async getSupplierPurchases(supplierId: string, filters: any = {}): Promise<any[]> {
    const supplier = await SupplierRepository.findById(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return await SupplierRepository.getSupplierPurchases(supplierId, filters);
  }
}

export default new SupplierService();