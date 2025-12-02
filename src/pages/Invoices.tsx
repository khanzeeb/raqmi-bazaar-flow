// Invoices Page - Refactored with separated hooks
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Plus, Search, Filter, Send, Printer, Eye, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InvoiceDialog } from "@/components/Invoices/InvoiceDialog";
import { InvoiceViewDialog } from "@/components/Invoices/InvoiceViewDialog";
import { InvoicePDFDialog } from "@/components/Invoices/InvoicePDFDialog";
import { InvoiceSendDialog } from "@/components/Invoices/InvoiceSendDialog";
import { InvoicePaymentDialog } from "@/components/Invoices/InvoicePaymentDialog";
import { InvoiceQRDialog } from "@/components/Invoices/InvoiceQRDialog";
import { useInvoicesData, useInvoicesFiltering, useInvoicesActions, useInvoicesStats } from '@/hooks/invoices';
import { Invoice, InvoiceStatus } from '@/types/invoice.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Invoices = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Data hook
  const { invoices, loading, updateStore, refresh } = useInvoicesData();

  // Filtering hook
  const { search, localFilters, filteredInvoices, updateSearch, updateLocalFilters } = useInvoicesFiltering(invoices);

  // Actions hook
  const { create, update, remove, markAsPaid } = useInvoicesActions({ updateStore, isArabic, onSuccess: refresh });

  // Stats hook
  const stats = useInvoicesStats(filteredInvoices);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [dialogInvoice, setDialogInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: InvoiceStatus) => {
    const colors: Record<InvoiceStatus, string> = {
      draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      paid: 'bg-green-500/10 text-green-700 border-green-500/20',
      overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
      cancelled: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status: InvoiceStatus) => {
    const texts: Record<InvoiceStatus, { ar: string; en: string }> = {
      draft: { ar: 'مسودة', en: 'Draft' },
      sent: { ar: 'مرسلة', en: 'Sent' },
      paid: { ar: 'مدفوعة', en: 'Paid' },
      overdue: { ar: 'متأخرة', en: 'Overdue' },
      cancelled: { ar: 'ملغاة', en: 'Cancelled' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getLanguageText = (lang: Invoice['language']) => {
    const texts = { ar: { ar: 'عربي', en: 'Arabic' }, en: { ar: 'إنجليزي', en: 'English' }, both: { ar: 'ثنائي اللغة', en: 'Bilingual' } };
    return texts[lang]?.[isArabic ? 'ar' : 'en'] || lang;
  };

  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Invoices" arLabel="الفواتير" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel enLabel="Manage invoices and financial documents" arLabel="إدارة الفواتير والمستندات المالية" showBoth={false} />
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAmount.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Invoices" arLabel="إجمالي الفواتير" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.paidAmount.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Paid" arLabel="المدفوع" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdueAmount.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Overdue" arLabel="متأخر" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.count}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Invoice Count" arLabel="عدد الفواتير" showBoth={false} /></p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
          <Input
            placeholder={isArabic ? "البحث برقم الفاتورة أو اسم العميل..." : "Search by invoice number or customer name..."}
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className={isArabic ? "pr-10" : "pl-10"}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={localFilters.status}
            onChange={(e) => updateLocalFilters('status', e.target.value as 'all' | InvoiceStatus)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
            <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
            <option value="sent">{isArabic ? 'مرسلة' : 'Sent'}</option>
            <option value="paid">{isArabic ? 'مدفوعة' : 'Paid'}</option>
            <option value="overdue">{isArabic ? 'متأخرة' : 'Overdue'}</option>
            <option value="cancelled">{isArabic ? 'ملغاة' : 'Cancelled'}</option>
          </select>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <Button onClick={() => { setSelectedInvoice(undefined); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            <BilingualLabel enLabel="New Invoice" arLabel="فاتورة جديدة" showBoth={false} />
          </Button>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {invoice.invoiceNumber}
                    {invoice.qrCode && <QrCode className="w-4 h-4" />}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invoice.customer.name}{invoice.customer.phone && ` - ${invoice.customer.phone}`}
                  </p>
                  {invoice.customer.taxId && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'الرقم الضريبي:' : 'Tax ID:'} {invoice.customer.taxId}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                  <Badge variant="outline">{getLanguageText(invoice.language)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
                  <p className="font-semibold text-lg">{invoice.total.toLocaleString()} {currencySymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</p>
                  <p className="font-medium">{invoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'شروط الدفع' : 'Payment Terms'}</p>
                  <p className="font-medium">{invoice.paymentTerms}</p>
                </div>
              </div>

              {/* Tax Details */}
              <div className="border-t pt-3 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'} </span>
                    <span className="font-medium">{invoice.subtotal.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? 'الضريبة' : 'Tax'} ({invoice.taxRate}%): </span>
                    <span className="font-medium">{invoice.taxAmount.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? 'الخصم:' : 'Discount:'} </span>
                    <span className="font-medium">{invoice.discount.toLocaleString()} {currencySymbol}</span>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="border-t pt-3 mb-4">
                <p className="text-sm text-muted-foreground mb-2">{isArabic ? 'العناصر' : 'Items'} ({invoice.items.length})</p>
                <div className="space-y-1">
                  {invoice.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} {currencySymbol}</span>
                    </div>
                  ))}
                  {invoice.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? `و ${invoice.items.length - 2} عنصر آخر...` : `and ${invoice.items.length - 2} more items...`}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t flex-wrap">
                <Button variant="outline" size="sm" onClick={() => { setDialogInvoice(invoice); setViewDialogOpen(true); }}>
                  <Eye className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'عرض' : 'View'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'طباعة' : 'Print'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDialogInvoice(invoice); setPdfDialogOpen(true); }}>
                  <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDialogInvoice(invoice); setSendDialogOpen(true); }}>
                  <Send className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'إرسال' : 'Send'}
                </Button>
                {invoice.status !== 'paid' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => markAsPaid(invoice.id)}>
                    {isArabic ? 'تسجيل دفعة' : 'Record Payment'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد فواتير مطابقة للبحث' : 'No invoices found matching your search'}</p>
        </div>
      )}

      {/* Dialogs */}
      <InvoiceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} invoice={selectedInvoice} onSave={(data) => { selectedInvoice ? update(selectedInvoice.id, data) : create(data as Invoice); setIsDialogOpen(false); }} />
      {dialogInvoice && <InvoiceViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoicePDFDialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoiceSendDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoicePaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoiceQRDialog open={qrDialogOpen} onOpenChange={setQrDialogOpen} invoice={dialogInvoice} />}
    </div>
  );
};

export default Invoices;
