// Services - Centralized service exports
// Services are organized by feature module

// Re-export from features for convenience
export { productGateway } from '@/features/products';
export { customerGateway } from '@/features/customers';
export { quotationGateway } from '@/features/quotations';
export { purchaseGateway } from '@/features/purchases';
export { expenseGateway } from '@/features/expenses';
export { invoiceGateway } from '@/features/invoices';
export { inventoryGateway } from '@/features/inventory';
export { settingsGateway } from '@/features/settings';

// Legacy exports for backward compatibility
export { productGateway as legacyProductGateway } from './product.gateway';
export type { IProductGateway, Category, UpdateStockRequest } from './product.gateway';
export { quotationGateway as legacyQuotationGateway, type IQuotationGateway } from './quotation.gateway';
export { categoryGateway } from './category.gateway';
