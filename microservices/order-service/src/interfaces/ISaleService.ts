/**
 * Sale Service Interface
 * Interface Segregation: Specific contract for sale operations
 */

import { 
  CreateSaleDTO, 
  UpdateSaleDTO, 
  SaleFiltersDTO, 
  SaleItemDTO,
  SalePaymentDTO 
} from '../dto';
import { InventoryValidationResultDTO } from '../dto/inventory.dto';

export interface ISaleService {
  // Core CRUD operations
  getById(id: string): Promise<any | null>;
  getAll(filters?: SaleFiltersDTO): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  
  // Sale-specific operations
  createSale(saleData: CreateSaleDTO, items: SaleItemDTO[]): Promise<any>;
  updateSale(id: string, saleData: UpdateSaleDTO, items?: SaleItemDTO[]): Promise<any | null>;
  cancelSale(id: string, reason: string): Promise<any | null>;
  
  // Payment operations
  createSalePayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  createPartialPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  createFullPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any>;
  
  // Query operations
  getOverdueSales(): Promise<any[]>;
  getSaleStats(filters?: SaleFiltersDTO): Promise<any>;
  generateSaleReport(filters?: SaleFiltersDTO): Promise<any>;
  
  // Business operations
  processOverdueReminders(): Promise<number>;
}

export interface IInventoryValidator {
  validateInventory(items: SaleItemDTO[]): Promise<InventoryValidationResultDTO>;
  checkInventoryOnly(items: SaleItemDTO[]): Promise<{
    available: boolean;
    items: Array<{
      product_id: string;
      requested_quantity: number;
      available_quantity: number;
      is_available: boolean;
    }>;
  }>;
}
