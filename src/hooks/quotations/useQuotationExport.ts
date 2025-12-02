// useQuotationExport - Print and download functionality
import { useCallback } from 'react';
import { Quotation } from '@/types/quotation.types';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/contexts/UserSettingsContext';

interface UseQuotationExportOptions {
  isArabic?: boolean;
}

export const useQuotationExport = (options: UseQuotationExportOptions = {}) => {
  const { toast } = useToast();
  const { getCurrencySymbol } = useUserSettings();
  const { isArabic = false } = options;

  const print = useCallback((quotation: Quotation) => {
    const currencySymbol = getCurrencySymbol();
    const printContent = `
      <html>
        <head>
          <title>${isArabic ? 'عرض سعر' : 'Quotation'} - ${quotation.quotationNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: ${isArabic ? 'right' : 'left'}; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isArabic ? 'عرض سعر' : 'Quotation'}</h1>
            <p><strong>${isArabic ? 'رقم العرض:' : 'Quotation Number:'}</strong> ${quotation.quotationNumber}</p>
            <p><strong>${isArabic ? 'التاريخ:' : 'Date:'}</strong> ${quotation.createdAt}</p>
            <p><strong>${isArabic ? 'صالح حتى:' : 'Valid until:'}</strong> ${quotation.expiryDate}</p>
          </div>
          
          <div class="section">
            <h3>${isArabic ? 'معلومات العميل' : 'Customer Information'}</h3>
            <p><strong>${isArabic ? 'الاسم:' : 'Name:'}</strong> ${quotation.customer.name}</p>
            <p><strong>${isArabic ? 'الهاتف:' : 'Phone:'}</strong> ${quotation.customer.phone}</p>
            ${quotation.customer.email ? `<p><strong>${isArabic ? 'البريد الإلكتروني:' : 'Email:'}</strong> ${quotation.customer.email}</p>` : ''}
          </div>

          <div class="section">
            <h3>${isArabic ? 'العناصر' : 'Items'}</h3>
            <table>
              <thead>
                <tr>
                  <th>${isArabic ? 'المنتج' : 'Product'}</th>
                  <th>${isArabic ? 'الكمية' : 'Quantity'}</th>
                  <th>${isArabic ? 'السعر' : 'Price'}</th>
                  <th>${isArabic ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString()} ${currencySymbol}</td>
                    <td>${item.total.toLocaleString()} ${currencySymbol}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <table>
              <tr><td><strong>${isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</strong></td><td>${quotation.subtotal.toLocaleString()} ${currencySymbol}</td></tr>
              <tr><td><strong>${isArabic ? 'الخصم:' : 'Discount:'}</strong></td><td>-${quotation.discount.toLocaleString()} ${currencySymbol}</td></tr>
              <tr><td><strong>${isArabic ? 'الضريبة' : 'Tax'} (${quotation.taxRate}%):</strong></td><td>${quotation.taxAmount.toLocaleString()} ${currencySymbol}</td></tr>
              <tr class="total"><td><strong>${isArabic ? 'المجموع الكلي:' : 'Total:'}</strong></td><td>${quotation.total.toLocaleString()} ${currencySymbol}</td></tr>
            </table>
          </div>

          ${quotation.notes ? `
          <div class="section">
            <h3>${isArabic ? 'ملاحظات' : 'Notes'}</h3>
            <p>${quotation.notes}</p>
          </div>
          ` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }, [isArabic, getCurrencySymbol]);

  const download = useCallback((quotation: Quotation) => {
    const csvContent = [
      [isArabic ? 'عرض سعر' : 'Quotation', quotation.quotationNumber].join(','),
      [isArabic ? 'العميل' : 'Customer', quotation.customer.name].join(','),
      [isArabic ? 'التاريخ' : 'Date', quotation.createdAt].join(','),
      [isArabic ? 'صالح حتى' : 'Valid until', quotation.expiryDate].join(','),
      '',
      [isArabic ? 'المنتج' : 'Product', isArabic ? 'الكمية' : 'Quantity', isArabic ? 'السعر' : 'Price', isArabic ? 'المجموع' : 'Total'].join(','),
      ...quotation.items.map(item => [item.name, item.quantity, item.price, item.total].join(',')),
      '',
      [isArabic ? 'المجموع الفرعي' : 'Subtotal', quotation.subtotal].join(','),
      [isArabic ? 'الخصم' : 'Discount', -quotation.discount].join(','),
      [isArabic ? 'الضريبة' : 'Tax', quotation.taxAmount].join(','),
      [isArabic ? 'المجموع الكلي' : 'Total', quotation.total].join(','),
      quotation.notes ? [isArabic ? 'ملاحظات' : 'Notes', quotation.notes].join(',') : ''
    ].filter(Boolean).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `quotation-${quotation.quotationNumber}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({
      title: isArabic ? "تم تحميل العرض" : "Quotation downloaded",
      description: isArabic ? "تم تحميل عرض السعر كملف CSV" : "Quotation has been downloaded as CSV file",
    });
  }, [isArabic, toast]);

  return { print, download };
};
