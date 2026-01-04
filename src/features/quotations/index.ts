// Quotations Feature Module - Barrel Export
// Provides a single entry point for all quotation-related functionality

// Components
export { QuotationCard } from './components/QuotationCard';
export { QuotationDialog } from './components/QuotationDialog';
export { QuotationFilters as QuotationFiltersComponent } from './components/QuotationFilters';
export { QuotationHistory } from './components/QuotationHistory';
export { QuotationViewDialog } from './components/QuotationViewDialog';

// Hooks
export { useQuotationsData } from './hooks/useQuotationsData';
export { useQuotationsActions } from './hooks/useQuotationsActions';
export { useQuotationsFiltering } from './hooks/useQuotationsFiltering';
export { useQuotationsStats } from './hooks/useQuotationsStats';
export { useQuotationExport } from './hooks/useQuotationExport';

// Services
export { quotationGateway } from './services/quotation.gateway';

// Types
export type {
  Quotation,
  QuotationStatus,
  QuotationCustomer,
  QuotationItem,
  QuotationHistoryEntry,
  CreateQuotationDTO,
  UpdateQuotationDTO,
  QuotationFilters,
  QuotationStats
} from './types';
