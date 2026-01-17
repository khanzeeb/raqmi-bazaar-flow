// Quotations Feature Module - Barrel Export
// Provides a single entry point for all quotation-related functionality

// Components
export { QuotationCard } from './components/QuotationCard';
export { QuotationDialog } from './components/QuotationDialog';
export { QuotationFilters as QuotationFiltersComponent } from './components/QuotationFilters';
export { QuotationHistory } from './components/QuotationHistory';
export { QuotationViewDialog } from './components/QuotationViewDialog';
export { QuotationPDFDialog } from './components/QuotationPDFDialog';

// Hooks
export { useQuotationsData } from './hooks/useQuotationsData';
export { useQuotationsActions } from './hooks/useQuotationsActions';
export { useQuotationsFiltering } from './hooks/useQuotationsFiltering';
export { useQuotationsStats } from './hooks/useQuotationsStats';
export { useQuotationExport } from './hooks/useQuotationExport';

// Services
export { quotationGateway } from './services/quotation.gateway';
export { QuotationPDFService, exportQuotationToPDF } from './services/quotation-pdf.service';

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

export type {
  PDFTemplateId,
  PDFTemplateColors,
  PDFTemplateConfig,
  PDFExportOptions
} from './types/pdf-templates';

export { PDF_TEMPLATES, DEFAULT_EXPORT_OPTIONS } from './types/pdf-templates';
