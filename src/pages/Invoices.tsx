import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Plus, Search, Filter, Download, Send, Printer, Eye } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Invoice['status']>('all');
  const [invoices] = useState<Invoice[]>([
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
    switch (status) {
      case 'draft': return 'مسودة';
      case 'sent': return 'مرسلة';
      case 'paid': return 'مدفوعة';
      case 'overdue': return 'متأخرة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  const getLanguageText = (language: Invoice['language']) => {
    switch (language) {
      case 'ar': return 'عربي';
      case 'en': return 'English';
      case 'both': return 'ثنائي اللغة';
      default: return language;
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
        <h1 className="text-3xl font-bold text-foreground mb-2">الفواتير</h1>
        <p className="text-muted-foreground">إدارة الفواتير والمستندات المالية</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString()} ر.س
            </div>
            <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString()} ر.س
            </div>
            <p className="text-sm text-muted-foreground">المدفوع</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {overdueAmount.toLocaleString()} ر.س
            </div>
            <p className="text-sm text-muted-foreground">متأخر</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {filteredInvoices.length}
            </div>
            <p className="text-sm text-muted-foreground">عدد الفواتير</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث برقم الفاتورة أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسلة</option>
            <option value="paid">مدفوعة</option>
            <option value="overdue">متأخرة</option>
            <option value="cancelled">ملغاة</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
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
                      الرقم الضريبي: {invoice.customer.taxId}
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
                  <p className="text-sm text-muted-foreground">المجموع</p>
                  <p className="font-semibold text-lg">{invoice.total.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                  <p className="font-medium">{invoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الاستحقاق</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">شروط الدفع</p>
                  <p className="font-medium">{invoice.paymentTerms}</p>
                </div>
              </div>
              
              {/* Tax Details */}
              <div className="border-t pt-3 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">المجموع الفرعي: </span>
                    <span className="font-medium">{invoice.subtotal.toLocaleString()} ر.س</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الضريبة ({invoice.taxRate}%): </span>
                    <span className="font-medium">{invoice.taxAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الخصم: </span>
                    <span className="font-medium">{invoice.discount.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="border-t pt-3 mb-4">
                <p className="text-sm text-muted-foreground mb-2">العناصر ({invoice.items.length})</p>
                <div className="space-y-1">
                  {invoice.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  {invoice.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      و {invoice.items.length - 2} عنصر آخر...
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
                        <span className="text-muted-foreground">رقم أمر الشراء: </span>
                        <span className="font-medium">{invoice.customFields.poNumber}</span>
                      </div>
                    )}
                    {invoice.customFields.deliveryTerms && (
                      <div>
                        <span className="text-muted-foreground">شروط التسليم: </span>
                        <span className="font-medium">{invoice.customFields.deliveryTerms}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  عرض
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1" />
                  طباعة
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  تحميل PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="w-4 h-4 mr-1" />
                  إرسال
                </Button>
                {invoice.status === 'sent' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    تسجيل دفعة
                  </Button>
                )}
                {invoice.qrCode && (
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-1" />
                    رمز الاستجابة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد فواتير مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Invoices;