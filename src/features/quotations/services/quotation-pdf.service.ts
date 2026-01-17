// Quotation PDF Generation Service
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '@/types/quotation.types';
import { PDFExportOptions, PDF_TEMPLATES, PDFTemplateConfig } from '../types/pdf-templates';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

const formatCurrency = (amount: number, language: 'en' | 'ar'): string => {
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return language === 'ar' ? `${formatted} ر.س` : `SAR ${formatted}`;
};

const formatDate = (dateStr: string, language: 'en' | 'ar'): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export class QuotationPDFService {
  private doc: jsPDF;
  private options: PDFExportOptions;
  private template: PDFTemplateConfig;
  private quotation: Quotation;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor(quotation: Quotation, options: PDFExportOptions) {
    this.quotation = quotation;
    this.options = options;
    this.template = PDF_TEMPLATES[options.template];
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private get isArabic(): boolean {
    return this.options.language === 'ar';
  }

  private t(en: string, ar: string): string {
    return this.isArabic ? ar : en;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  private addHeader(): void {
    const { colors, headerStyle } = this.template;
    const { companyInfo } = this.options;

    // Header background for full-width style
    if (headerStyle === 'full-width') {
      this.doc.setFillColor(...this.hexToRgb(colors.primary));
      this.doc.rect(0, 0, this.pageWidth, 45, 'F');
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(...this.hexToRgb(colors.primary));
    }

    // Company name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    
    if (headerStyle === 'centered') {
      this.doc.text(companyInfo.name, this.pageWidth / 2, 25, { align: 'center' });
    } else {
      this.doc.text(companyInfo.name, this.margin, 25);
    }

    // Company details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (headerStyle === 'full-width') {
      this.doc.setTextColor(220, 220, 220);
    } else {
      this.doc.setTextColor(...this.hexToRgb(colors.textLight));
    }

    let detailY = 32;
    if (companyInfo.address) {
      if (headerStyle === 'centered') {
        this.doc.text(companyInfo.address, this.pageWidth / 2, detailY, { align: 'center' });
      } else {
        this.doc.text(companyInfo.address, this.margin, detailY);
      }
      detailY += 5;
    }
    
    const contactInfo = [companyInfo.phone, companyInfo.email].filter(Boolean).join(' | ');
    if (contactInfo) {
      if (headerStyle === 'centered') {
        this.doc.text(contactInfo, this.pageWidth / 2, detailY, { align: 'center' });
      } else {
        this.doc.text(contactInfo, this.margin, detailY);
      }
    }

    // Quotation title on right side (for full-width)
    if (headerStyle === 'full-width') {
      this.doc.setFontSize(16);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(this.t('QUOTATION', 'عرض سعر'), this.pageWidth - this.margin, 25, { align: 'right' });
      this.doc.setFontSize(10);
      this.doc.text(`#${this.quotation.quotationNumber}`, this.pageWidth - this.margin, 32, { align: 'right' });
    }

    this.currentY = headerStyle === 'full-width' ? 55 : 50;
  }

  private addQuotationInfo(): void {
    const { colors } = this.template;
    
    this.doc.setTextColor(...this.hexToRgb(colors.text));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Left column - Quotation details
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 10;

    // Section title
    this.doc.text(this.t('Quotation Details', 'تفاصيل عرض السعر'), leftX, this.currentY);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.hexToRgb(colors.textLight));

    const details = [
      { label: this.t('Quotation #:', 'رقم العرض:'), value: this.quotation.quotationNumber },
      { label: this.t('Date:', 'التاريخ:'), value: formatDate(this.quotation.createdAt, this.options.language) },
    ];

    if (this.options.showValidityDate) {
      details.push({ label: this.t('Valid Until:', 'صالح حتى:'), value: formatDate(this.quotation.expiryDate, this.options.language) });
    }

    details.push({ label: this.t('Status:', 'الحالة:'), value: this.getStatusText() });

    let detailY = this.currentY + 8;
    details.forEach(detail => {
      this.doc.setTextColor(...this.hexToRgb(colors.textLight));
      this.doc.text(detail.label, leftX, detailY);
      this.doc.setTextColor(...this.hexToRgb(colors.text));
      this.doc.text(detail.value, leftX + 35, detailY);
      detailY += 6;
    });

    // Right column - Customer info
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.hexToRgb(colors.text));
    this.doc.text(this.t('Bill To', 'فاتورة إلى'), rightX, this.currentY);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    let customerY = this.currentY + 8;
    this.doc.setTextColor(...this.hexToRgb(colors.text));
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.quotation.customer.name, rightX, customerY);
    customerY += 6;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.hexToRgb(colors.textLight));
    
    const customerType = this.quotation.customer.type === 'business' 
      ? this.t('Business', 'شركة') 
      : this.t('Individual', 'فردي');
    this.doc.text(customerType, rightX, customerY);
    customerY += 6;

    this.doc.text(this.quotation.customer.phone, rightX, customerY);
    customerY += 6;

    if (this.quotation.customer.email) {
      this.doc.text(this.quotation.customer.email, rightX, customerY);
    }

    this.currentY = detailY + 10;
  }

  private getStatusText(): string {
    const statusMap: Record<string, { en: string; ar: string }> = {
      draft: { en: 'Draft', ar: 'مسودة' },
      sent: { en: 'Sent', ar: 'مرسل' },
      accepted: { en: 'Accepted', ar: 'مقبول' },
      expired: { en: 'Expired', ar: 'منتهي' },
      declined: { en: 'Declined', ar: 'مرفوض' },
      converted: { en: 'Converted', ar: 'محول' }
    };
    const status = statusMap[this.quotation.status] || { en: this.quotation.status, ar: this.quotation.status };
    return this.isArabic ? status.ar : status.en;
  }

  private addItemsTable(): void {
    const { colors, tableStyle } = this.template;

    const headers = [
      this.t('Product', 'المنتج'),
      this.t('Qty', 'الكمية'),
      this.t('Unit Price', 'سعر الوحدة'),
      this.t('Total', 'المجموع')
    ];

    const rows = this.quotation.items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price, this.options.language),
      formatCurrency(item.total, this.options.language)
    ]);

    const tableConfig: any = {
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: this.hexToRgb(colors.primary),
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: this.hexToRgb(colors.text),
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      },
      theme: tableStyle === 'striped' ? 'striped' : tableStyle === 'bordered' ? 'grid' : 'plain',
      alternateRowStyles: tableStyle === 'striped' ? {
        fillColor: this.hexToRgb(colors.background)
      } : undefined
    };

    autoTable(this.doc, tableConfig);
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addTotals(): void {
    const { colors } = this.template;
    const totalsX = this.pageWidth - this.margin - 70;
    const valueX = this.pageWidth - this.margin;

    const totals = [
      { label: this.t('Subtotal:', 'المجموع الفرعي:'), value: formatCurrency(this.quotation.subtotal, this.options.language) },
      { label: this.t('Discount:', 'الخصم:'), value: `-${formatCurrency(this.quotation.discount, this.options.language)}` },
      { label: `${this.t('Tax', 'الضريبة')} (${this.quotation.taxRate}%):`, value: formatCurrency(this.quotation.taxAmount, this.options.language) },
    ];

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    totals.forEach(total => {
      this.doc.setTextColor(...this.hexToRgb(colors.textLight));
      this.doc.text(total.label, totalsX, this.currentY, { align: 'left' });
      this.doc.setTextColor(...this.hexToRgb(colors.text));
      this.doc.text(total.value, valueX, this.currentY, { align: 'right' });
      this.currentY += 7;
    });

    // Total line
    this.doc.setDrawColor(...this.hexToRgb(colors.border));
    this.doc.line(totalsX, this.currentY - 2, valueX, this.currentY - 2);
    this.currentY += 5;

    // Grand total
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.hexToRgb(colors.primary));
    this.doc.text(this.t('Total:', 'المجموع الكلي:'), totalsX, this.currentY, { align: 'left' });
    this.doc.text(formatCurrency(this.quotation.total, this.options.language), valueX, this.currentY, { align: 'right' });

    this.currentY += 15;
  }

  private addNotes(): void {
    if (!this.options.includeNotes || !this.quotation.notes) return;

    const { colors } = this.template;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.hexToRgb(colors.text));
    this.doc.text(this.t('Notes', 'ملاحظات'), this.margin, this.currentY);

    this.currentY += 6;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.hexToRgb(colors.textLight));
    
    const splitNotes = this.doc.splitTextToSize(this.quotation.notes, this.pageWidth - 2 * this.margin);
    this.doc.text(splitNotes, this.margin, this.currentY);
    this.currentY += splitNotes.length * 5 + 10;
  }

  private addTerms(): void {
    if (!this.options.includeTerms) return;

    const { colors } = this.template;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.hexToRgb(colors.text));
    this.doc.text(this.t('Terms & Conditions', 'الشروط والأحكام'), this.margin, this.currentY);

    this.currentY += 6;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.hexToRgb(colors.textLight));
    
    const terms = [
      this.t('1. This quotation is valid for the specified period.', '1. هذا العرض صالح للفترة المحددة.'),
      this.t('2. Prices are subject to change without prior notice.', '2. الأسعار قابلة للتغيير دون إشعار مسبق.'),
      this.t('3. Payment terms are 50% advance, 50% on delivery.', '3. شروط الدفع: 50% مقدم، 50% عند التسليم.')
    ];

    terms.forEach(term => {
      this.doc.text(term, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addFooter(): void {
    const { colors } = this.template;
    const footerY = this.pageHeight - 15;

    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.hexToRgb(colors.textLight));
    this.doc.text(
      this.t('Thank you for your business!', 'شكراً لتعاملكم معنا!'),
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    // Tax number if available
    if (this.options.companyInfo.taxNumber) {
      this.doc.text(
        `${this.t('Tax Registration:', 'الرقم الضريبي:')} ${this.options.companyInfo.taxNumber}`,
        this.pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
    }
  }

  public generate(): jsPDF {
    this.addHeader();
    this.addQuotationInfo();
    this.addItemsTable();
    this.addTotals();
    this.addNotes();
    this.addTerms();
    this.addFooter();
    return this.doc;
  }

  public download(filename?: string): void {
    const doc = this.generate();
    const name = filename || `quotation-${this.quotation.quotationNumber}.pdf`;
    doc.save(name);
  }

  public getBlob(): Blob {
    const doc = this.generate();
    return doc.output('blob');
  }

  public getDataUri(): string {
    const doc = this.generate();
    return doc.output('datauristring');
  }
}

// Convenience function for quick export
export const exportQuotationToPDF = (quotation: Quotation, options: PDFExportOptions): void => {
  const service = new QuotationPDFService(quotation, options);
  service.download();
};
