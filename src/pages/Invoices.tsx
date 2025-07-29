import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Plus, Search, Filter, Download, Send, Printer, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InvoiceDialog } from "@/components/Invoices/InvoiceDialog";
import { useToast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
    type: 'individual' | 'business';
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  language: 'ar' | 'en' | 'both';
  qrCode?: string;
  notes?: string;
  customFields?: {
    poNumber?: string;
    deliveryTerms?: string;
  };
}

const Invoices = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Invoice['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customer: {
        name: 'شركة التقنية المتقدمة',
        phone: '+966112345678',
        email: 'info@techadvanced.com',
        address: 'الرياض، المملكة العربية السعودية',
        taxId: '123456789',
        type: 'business'
      },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 5, unitPrice: 2500, total: 12500 },
        { id: '2', name: 'طابعة ليزر', quantity: 2, unitPrice: 800, total: 1600 }
      ],
      subtotal: 14100,
      taxRate: 15,
      taxAmount: 2115,
      discount: 500,
      total: 15715,
      status: 'sent',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      paymentTerms: '30 يوم',
      currency: 'SAR',
      language: 'both',
      qrCode: 'QR123456789',
      notes: 'شكراً لثقتكم بنا',
      customFields: {
        poNumber: 'PO-2024-001',
        deliveryTerms: 'تسليم فوري'
      }
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      customer: {
        name: 'أحمد محمد العلي',
        phone: '+966501234567',
        email: 'ahmed@example.com',
        type: 'individual'
      },
      items: [
        { id: '3', name: 'ماوس لاسلكي', quantity: 1, unitPrice: 50, total: 50 },
        { id: '4', name: 'لوحة مفاتيح', quantity: 1, unitPrice: 120, total: 120 }
      ],
      subtotal: 170,
      taxRate: 15,
      taxAmount: 25.5,
      discount: 0,
      total: 195.5,
      status: 'paid',
      issueDate: '2024-01-16',
      dueDate: '2024-01-31',
      paymentTerms: '15 يوم',
      currency: 'SAR',
      language: 'ar'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      customer: {
        name: 'مؤسسة الخدمات التجارية',
        phone: '+966509876543',
        type: 'business'
      },
      items: [
        { id: '5', name: 'شاشة 24 بوصة', quantity: 10, unitPrice: 600, total: 6000 }
      ],
      subtotal: 6000,
      taxRate: 15,
      taxAmount: 900,
      discount: 200,
      total: 6700,
      status: 'overdue',
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      paymentTerms: '15 يوم',
      currency: 'SAR',
      language: 'ar'
    }
  ]);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'cancelled': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    if (isArabic) {
      switch (status) {
        case 'draft': return 'مسودة';
        case 'sent': return 'مرسلة';
        case 'paid': return 'مدفوعة';
        case 'overdue': return 'متأخرة';
        case 'cancelled': return 'ملغاة';
        default: return status;
      }
    } else {
      switch (status) {
        case 'draft': return 'Draft';
        case 'sent': return 'Sent';
        case 'paid': return 'Paid';
        case 'overdue': return 'Overdue';
        case 'cancelled': return 'Cancelled';
        default: return status;
      }
    }
  };

  const getLanguageText = (language: Invoice['language']) => {
    if (isArabic) {
      switch (language) {
        case 'ar': return 'عربي';
        case 'en': return 'إنجليزي';
        case 'both': return 'ثنائي اللغة';
        default: return language;
      }
    } else {
      switch (language) {
        case 'ar': return 'Arabic';
        case 'en': return 'English';
        case 'both': return 'Bilingual';
        default: return language;
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const overdueAmount = filteredInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'الفواتير' : 'Invoices'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'إدارة الفواتير والمستندات المالية' : 'Manage invoices and financial documents'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
            </div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
            </div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المدفوع' : 'Paid'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {overdueAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
            </div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'متأخر' : 'Overdue'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {filteredInvoices.length}
            </div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'عدد الفواتير' : 'Invoice Count'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
          <Input
            placeholder={isArabic ? "البحث برقم الفاتورة أو اسم العميل..." : "Search by invoice number or customer name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isArabic ? "pr-10" : "pl-10"}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
            <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
            <option value="sent">{isArabic ? 'مرسلة' : 'Sent'}</option>
            <option value="paid">{isArabic ? 'مدفوعة' : 'Paid'}</option>
            <option value="overdue">{isArabic ? 'متأخرة' : 'Overdue'}</option>
            <option value="cancelled">{isArabic ? 'ملغاة' : 'Cancelled'}</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
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
                    {invoice.customer.name}
                    {invoice.customer.phone && ` - ${invoice.customer.phone}`}
                  </p>
                  {invoice.customer.taxId && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'الرقم الضريبي:' : 'Tax ID:'} {invoice.customer.taxId}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <Badge className={getStatusColor(invoice.status)}>
                    {getStatusText(invoice.status)}
                  </Badge>
                  <Badge variant="outline">
                    {getLanguageText(invoice.language)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
                  <p className="font-semibold text-lg">{invoice.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
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
                    <span className="font-medium">{invoice.subtotal.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? 'الضريبة' : 'Tax'} ({invoice.taxRate}%): </span>
                    <span className="font-medium">{invoice.taxAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isArabic ? 'الخصم:' : 'Discount:'} </span>
                    <span className="font-medium">{invoice.discount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
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
                      <span>{item.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                    </div>
                  ))}
                  {invoice.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? `و ${invoice.items.length - 2} عنصر آخر...` : `and ${invoice.items.length - 2} more items...`}
                    </p>
                  )}
                </div>
              </div>

              {/* Custom Fields */}
              {invoice.customFields && (
                <div className="border-t pt-3 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {invoice.customFields.poNumber && (
                      <div>
                        <span className="text-muted-foreground">{isArabic ? 'رقم أمر الشراء:' : 'PO Number:'} </span>
                        <span className="font-medium">{invoice.customFields.poNumber}</span>
                      </div>
                    )}
                    {invoice.customFields.deliveryTerms && (
                      <div>
                        <span className="text-muted-foreground">{isArabic ? 'شروط التسليم:' : 'Delivery Terms:'} </span>
                        <span className="font-medium">{invoice.customFields.deliveryTerms}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: isArabic ? "عرض الفاتورة" : "View Invoice",
                      description: isArabic ? `عرض تفاصيل الفاتورة ${invoice.invoiceNumber}` : `Viewing invoice details for ${invoice.invoiceNumber}`,
                    });
                  }}
                >
                  <Eye className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'عرض' : 'View'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.print();
                    toast({
                      title: isArabic ? "طباعة الفاتورة" : "Print Invoice",
                      description: isArabic ? "تم إرسال الفاتورة للطباعة" : "Invoice sent to printer",
                    });
                  }}
                >
                  <Printer className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'طباعة' : 'Print'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: isArabic ? "تحميل PDF" : "Download PDF",
                      description: isArabic ? `تم تحميل الفاتورة ${invoice.invoiceNumber} بصيغة PDF` : `Downloading ${invoice.invoiceNumber} as PDF`,
                    });
                  }}
                >
                  <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'تحميل PDF' : 'Download PDF'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: isArabic ? "إرسال الفاتورة" : "Send Invoice",
                      description: isArabic ? `تم إرسال الفاتورة ${invoice.invoiceNumber} بالبريد الإلكتروني` : `Invoice ${invoice.invoiceNumber} sent via email`,
                    });
                  }}
                >
                  <Send className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'إرسال' : 'Send'}
                </Button>
                {invoice.status === 'sent' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: isArabic ? "تسجيل دفعة" : "Record Payment",
                        description: isArabic ? `تم تسجيل دفعة للفاتورة ${invoice.invoiceNumber}` : `Payment recorded for invoice ${invoice.invoiceNumber}`,
                      });
                    }}
                  >
                    {isArabic ? 'تسجيل دفعة' : 'Record Payment'}
                  </Button>
                )}
                {invoice.qrCode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: isArabic ? "رمز الاستجابة السريعة" : "QR Code",
                        description: isArabic ? `عرض رمز الاستجابة للفاتورة ${invoice.invoiceNumber}` : `Displaying QR code for invoice ${invoice.invoiceNumber}`,
                      });
                    }}
                  >
                    <QrCode className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                    {isArabic ? 'رمز الاستجابة' : 'QR Code'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isArabic ? "لا توجد فواتير مطابقة للبحث" : "No invoices found matching your search"}
          </p>
        </div>
      )}

      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoice={selectedInvoice}
        onSave={(invoiceData) => {
          // Dialog functionality removed - only keeping for potential future use
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Invoices;