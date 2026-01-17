// Quotation hooks - centralized exports from feature structure
export { useQuotationsData } from '@/features/quotations/hooks/useQuotationsData';
export { useQuotationsActions } from '@/features/quotations/hooks/useQuotationsActions';
export { useQuotationsStats } from '@/features/quotations/hooks/useQuotationsStats';

// Re-export additional hooks if they exist in the feature folder
export { useQuotationsFiltering } from './useQuotationsFiltering';
export { useQuotationExport } from './useQuotationExport';

// Legacy hooks for backward compatibility
export { useQuotations, useQuotationStats } from '@/hooks/useQuotations';
