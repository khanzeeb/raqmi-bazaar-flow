// PDF Template Types for Quotation Export

export type PDFTemplateId = 'modern' | 'classic' | 'minimal' | 'corporate';

export interface PDFTemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  border: string;
  background: string;
}

export interface PDFTemplateConfig {
  id: PDFTemplateId;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  colors: PDFTemplateColors;
  showLogo: boolean;
  showQRCode: boolean;
  headerStyle: 'full-width' | 'centered' | 'left-aligned';
  tableStyle: 'striped' | 'bordered' | 'minimal';
}

export interface PDFExportOptions {
  template: PDFTemplateId;
  language: 'en' | 'ar';
  includeNotes: boolean;
  includeTerms: boolean;
  showValidityDate: boolean;
  companyInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    taxNumber?: string;
  };
}

export const PDF_TEMPLATES: Record<PDFTemplateId, PDFTemplateConfig> = {
  modern: {
    id: 'modern',
    name: { en: 'Modern', ar: 'عصري' },
    description: { en: 'Clean and contemporary design', ar: 'تصميم نظيف ومعاصر' },
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      text: '#1F2937',
      textLight: '#6B7280',
      border: '#E5E7EB',
      background: '#F9FAFB'
    },
    showLogo: true,
    showQRCode: true,
    headerStyle: 'full-width',
    tableStyle: 'striped'
  },
  classic: {
    id: 'classic',
    name: { en: 'Classic', ar: 'كلاسيكي' },
    description: { en: 'Traditional professional look', ar: 'مظهر احترافي تقليدي' },
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#059669',
      text: '#111827',
      textLight: '#4B5563',
      border: '#D1D5DB',
      background: '#FFFFFF'
    },
    showLogo: true,
    showQRCode: false,
    headerStyle: 'left-aligned',
    tableStyle: 'bordered'
  },
  minimal: {
    id: 'minimal',
    name: { en: 'Minimal', ar: 'بسيط' },
    description: { en: 'Simple and elegant', ar: 'بسيط وأنيق' },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      text: '#000000',
      textLight: '#666666',
      border: '#CCCCCC',
      background: '#FFFFFF'
    },
    showLogo: false,
    showQRCode: false,
    headerStyle: 'centered',
    tableStyle: 'minimal'
  },
  corporate: {
    id: 'corporate',
    name: { en: 'Corporate', ar: 'مؤسسي' },
    description: { en: 'Professional business style', ar: 'نمط أعمال احترافي' },
    colors: {
      primary: '#0F172A',
      secondary: '#334155',
      accent: '#0EA5E9',
      text: '#0F172A',
      textLight: '#64748B',
      border: '#CBD5E1',
      background: '#F8FAFC'
    },
    showLogo: true,
    showQRCode: true,
    headerStyle: 'full-width',
    tableStyle: 'bordered'
  }
};

export const DEFAULT_EXPORT_OPTIONS: PDFExportOptions = {
  template: 'modern',
  language: 'en',
  includeNotes: true,
  includeTerms: true,
  showValidityDate: true,
  companyInfo: {
    name: 'Your Company Name',
    address: '123 Business Street, City, Country',
    phone: '+1 234 567 890',
    email: 'info@company.com'
  }
};
