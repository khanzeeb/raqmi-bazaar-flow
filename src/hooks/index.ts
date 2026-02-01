// Hooks - Centralized hook exports
// Import hooks from their feature modules or use shared utilities

// Shared hook utilities
export * from '@/lib/hooks';

// Common hooks
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
export { useRTL } from './useRTL';
export { useSecureForm } from './useSecureForm';

// Feature-specific hooks - re-exported for convenience
// Products
export { useProducts } from './useProducts';
export { useProductsData, useProductsActions, useProductsStats, useProductsState } from './products';

// Customers
export { useCustomersData, useCustomersActions, useCustomersFiltering, useCustomersStats } from './customers';

// Quotations
export { useQuotations, useQuotationStats } from './useQuotations';
export { useQuotationsData, useQuotationsActions, useQuotationsStats, useQuotationsFiltering, useQuotationExport } from './quotations';

// Sales Orders
export { useSalesOrdersData, useSalesOrdersFiltering, useSalesOrdersActions, useSalesOrdersStats } from './salesOrders';

// Purchases
export { usePurchasesData, usePurchasesFiltering, usePurchasesActions, usePurchasesStats } from './purchases';

// Invoices
export { useInvoicesData, useInvoicesFiltering, useInvoicesActions, useInvoicesStats } from './invoices';

// Payments
export { usePaymentsData, usePaymentsFiltering, usePaymentsActions, usePaymentsStats } from './payments';

// Expenses
export { useExpensesData, useExpensesFiltering, useExpensesActions, useExpensesStats } from './expenses';

// Returns
export { useReturnsData, useReturnsFiltering, useReturnsStats, useReturnsActions } from './returns';
export { useReturns } from './useReturns';

// Inventory
export { useInventoryData, useInventoryFiltering, useInventoryStats } from './inventory';

// Pricing
export { usePricingData, usePricingFiltering, usePricingActions, usePricingStats } from './pricing';

// Reports
export { useReportsData } from './reports';

// Settings
export { useSettingsData } from './settings';

// Sales
export { useSales } from './useSales';
