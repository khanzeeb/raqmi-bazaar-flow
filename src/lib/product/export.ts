// Product Export Utilities

import { ProductView } from '@/types/product.types';

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  isArabic?: boolean;
}

const DEFAULT_HEADERS = {
  en: ['Name', 'Name (Arabic)', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Barcode'],
  ar: ['الاسم', 'الاسم (إنجليزي)', 'رمز المنتج', 'الفئة', 'السعر', 'المخزون', 'الحالة', 'الباركود'],
};

export const exportToCSV = (products: ProductView[], options: ExportOptions = {}): void => {
  const { filename = 'products.csv', isArabic = false } = options;
  const headers = options.headers || (isArabic ? DEFAULT_HEADERS.ar : DEFAULT_HEADERS.en);

  const csvContent = [
    headers.join(','),
    ...products.map(product => [
      `"${product.name}"`,
      `"${product.nameAr}"`,
      product.sku,
      product.category,
      product.price,
      product.stock,
      product.status,
      product.barcode || ''
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
