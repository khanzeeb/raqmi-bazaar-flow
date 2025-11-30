import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Printer, Eye, Send, CheckCircle, Clock, XCircle, ShoppingCart, History } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { QuotationDialog } from "@/components/Quotations/QuotationDialog";
import { QuotationHistory } from "@/components/Quotations/QuotationHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SalesOrder } from "./SalesOrders";
import { BilingualLabel, BilingualInline } from "@/components/common/BilingualLabel";

export interface QuotationHistory {
  id: string;
  action: 'created' | 'sent' | 'accepted' | 'expired' | 'converted_to_sale';
  timestamp: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    type: 'individual' | 'business';
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  validityDays: number;
  expiryDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'expired';
  createdAt: string;
  notes?: string;
  history: QuotationHistory[];
  convertedToSaleId?: string;
}

const Quotations = () => {
  const { t, language, isRTL } = useLanguage();
  const { formatCurrency, getCurrencySymbol } = useUserSettings();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Quotation['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | undefined>(undefined);
  const [viewQuotationId, setViewQuotationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedQuotationForHistory, setSelectedQuotationForHistory] = useState<Quotation | null>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: '1',
      quotationNumber: 'QT-001',
      customer: { 
        name: 'أحمد محمد', 
        phone: '+966501234567', 
        email: 'ahmed@example.com',
        type: 'individual' 
      },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
        { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
      ],
      subtotal: 2600,
      taxRate: 15,
      taxAmount: 390,
      discount: 100,
      total: 2890,
      validityDays: 30,
      expiryDate: '2024-02-15',
      status: 'sent',
      createdAt: '2024-01-15',
      notes: 'عرض خاص للعميل المميز',
      history: [
        { id: '1', action: 'created', timestamp: '2024-01-15T10:00:00Z' },
        { id: '2', action: 'sent', timestamp: '2024-01-15T14:30:00Z', notes: 'تم الإرسال عبر الواتساب' }
      ]
    },
    {
      id: '2',
      quotationNumber: 'QT-002',
      customer: { 
        name: 'شركة التقنية المتقدمة', 
        phone: '+966112345678',
        type: 'business' 
      },
      items: [
        { id: '3', name: 'طابعة ليزر', quantity: 5, price: 800, total: 4000 }
      ],
      subtotal: 4000,
      taxRate: 15,
      taxAmount: 600,
      discount: 200,
      total: 4400,
      validityDays: 15,
      expiryDate: '2024-02-01',
      status: 'draft',
      createdAt: '2024-01-16',
      history: [
        { id: '1', action: 'created', timestamp: '2024-01-16T09:00:00Z' }
      ]
    }
  ]);

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'expired': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Quotation['status']) => {
    const statusMap = {
      draft: { ar: 'مسودة', en: 'Draft' },
      sent: { ar: 'مرسل', en: 'Sent' },
      accepted: { ar: 'مقبول', en: 'Accepted' },
      expired: { ar: 'منتهي الصلاحية', en: 'Expired' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getStatusIcon = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewQuotation = (quotationId: string) => {
    setViewQuotationId(quotationId);
  };

  const handleSendQuotation = (quotationId: string) => {
    const currentTime = new Date().toISOString();
    setQuotations(prev => prev.map(q => 
      q.id === quotationId ? { 
        ...q, 
        status: 'sent' as const,
        history: [...q.history, {
          id: Date.now().toString(),
          action: 'sent',
          timestamp: currentTime,
          notes: 'تم الإرسال للعميل'
        }]
      } : q
    ));
    toast({
      title: isArabic ? "تم إرسال العرض" : "Quotation sent",
      description: isArabic ? "تم إرسال عرض السعر بنجاح" : "Quotation has been sent successfully",
    });
  };

  const handleAcceptQuotation = (quotationId: string) => {
    const currentTime = new Date().toISOString();
    setQuotations(prev => prev.map(q => 
      q.id === quotationId ? { 
        ...q, 
        status: 'accepted' as const,
        history: [...q.history, {
          id: Date.now().toString(),
          action: 'accepted',
          timestamp: currentTime,
          notes: 'تم قبول العرض من قبل العميل'
        }]
      } : q
    ));
    toast({
      title: isArabic ? "تم قبول العرض" : "Quotation accepted",
      description: isArabic ? "تم قبول عرض السعر بنجاح" : "Quotation has been accepted successfully",
    });
  };

  const handleConvertToSale = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) return;

    const currentTime = new Date().toISOString();
    const saleOrderNumber = `SO-${String(salesOrders.length + 1).padStart(3, '0')}`;
    
    // Create new sales order from quotation
    const newSalesOrder: SalesOrder = {
      id: Date.now().toString(),
      orderNumber: saleOrderNumber,
      customer: quotation.customer,
      items: quotation.items,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      taxRate: quotation.taxRate,
      discount: quotation.discount,
      total: quotation.total,
      paymentMode: 'cash',
      paymentStatus: 'pending',
      paidAmount: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      notes: `تم تحويلها من عرض السعر رقم: ${quotation.quotationNumber}`
    };

    // Add to sales orders
    setSalesOrders(prev => [newSalesOrder, ...prev]);

    // Update quotation with conversion history
    setQuotations(prev => prev.map(q => 
      q.id === quotationId ? {
        ...q,
        convertedToSaleId: newSalesOrder.id,
        history: [...q.history, {
          id: Date.now().toString(),
          action: 'converted_to_sale',
          timestamp: currentTime,
          notes: `تم التحويل إلى طلب بيع رقم: ${saleOrderNumber}`
        }]
      } : q
    ));

    toast({
      title: isArabic ? "تم التحويل إلى طلب بيع" : "Converted to sales order",
      description: isArabic ? `تم إنشاء طلب بيع رقم: ${saleOrderNumber}` : `Sales order ${saleOrderNumber} has been created`,
    });
  };

  const handleViewHistory = (quotation: Quotation) => {
    setSelectedQuotationForHistory(quotation);
    setIsHistoryOpen(true);
  };

  const handlePrintQuotation = (quotation: Quotation) => {
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
  };

  const handleDownloadPDF = (quotation: Quotation) => {
    // Create a simple CSV export as a fallback since we don't have PDF library
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
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Quotations" arLabel="عروض الأسعار" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel 
            enLabel="Manage quotations and convert to sales" 
            arLabel="إدارة عروض الأسعار والتحويل إلى مبيعات" 
            showBoth={false} 
          />
        </p>
      </div>

      {/* Actions Bar */}
      <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex-1 relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
          <Input
            placeholder={isArabic ? "البحث برقم العرض أو اسم العميل..." : "Search by quotation number or customer name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">{isArabic ? "جميع الحالات" : "All Status"}</option>
            <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
            <option value="sent">{isArabic ? "مرسل" : "Sent"}</option>
            <option value="accepted">{isArabic ? "مقبول" : "Accepted"}</option>
            <option value="expired">{isArabic ? "منتهي الصلاحية" : "Expired"}</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            onClick={() => {
              setSelectedQuotation(undefined);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <BilingualLabel 
              enLabel="New Quotation" 
              arLabel="عرض سعر جديد"
              showBoth={true}
              primaryClassName="text-sm"
              secondaryClassName="text-[10px] opacity-80"
            />
          </Button>
        </div>
      </div>

      {/* Quotations Grid */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {quotation.quotationNumber}
                    {getStatusIcon(quotation.status)}
                  </CardTitle>
                   <p className="text-sm text-muted-foreground mt-1">
                     {quotation.customer.name} - {quotation.customer.phone}
                   </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(quotation.status)}>
                    {getStatusText(quotation.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "المجموع" : "Total"}
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(quotation.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "صالح حتى" : "Valid until"}
                  </p>
                  <p className="font-medium">{quotation.expiryDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "مدة الصلاحية" : "Validity"}
                  </p>
                  <p className="font-medium">
                    {quotation.validityDays} {isArabic ? "يوم" : "days"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "التاريخ" : "Date"}
                  </p>
                  <p className="font-medium">{quotation.createdAt}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {isArabic ? `العناصر (${quotation.items.length})` : `Items (${quotation.items.length})`}
                </p>
                <div className="space-y-1">
                  {quotation.items.slice(0, 2).map((item) => (
                    <div key={item.id} className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{item.name} × {item.quantity}</span>
                      <span>
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  {quotation.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic 
                        ? `و ${quotation.items.length - 2} عنصر آخر...`
                        : `and ${quotation.items.length - 2} more items...`
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewQuotation(quotation.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {isArabic ? "عرض" : "View"}
                </Button>
                {quotation.status === 'draft' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendQuotation(quotation.id)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {isArabic ? "إرسال" : "Send"}
                  </Button>
                )}
                {quotation.status === 'sent' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAcceptQuotation(quotation.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {isArabic ? "قبول" : "Accept"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewHistory(quotation)}
                >
                  <History className="w-4 h-4 mr-1" />
                  {isArabic ? "السجل" : "History"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintQuotation(quotation)}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  {isArabic ? "طباعة" : "Print"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadPDF(quotation)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {isArabic ? "تحميل PDF" : "Download PDF"}
                </Button>
                {quotation.status === 'accepted' && !quotation.convertedToSaleId && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleConvertToSale(quotation.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {isArabic ? "تحويل لطلب بيع" : "Convert to Sale"}
                  </Button>
                )}
                {quotation.convertedToSaleId && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {isArabic ? "تم التحويل" : "Converted"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isArabic ? "لا توجد عروض أسعار مطابقة للبحث" : "No quotations match your search"}
          </p>
        </div>
      )}

      <QuotationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        quotation={selectedQuotation}
        onSave={(quotationData) => {
          if (selectedQuotation) {
            // Update existing quotation
            setQuotations(prev => prev.map(q => 
              q.id === selectedQuotation.id 
                ? { ...quotationData, id: selectedQuotation.id, createdAt: selectedQuotation.createdAt }
                : q
            ));
          } else {
            // Add new quotation
            const newQuotation = {
              ...quotationData,
              id: Date.now().toString(),
              createdAt: new Date().toISOString().split('T')[0]
            };
            setQuotations(prev => [newQuotation, ...prev]);
          }
          setIsDialogOpen(false);
        }}
      />

      {/* Quotation History Dialog */}
      <QuotationHistory
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        history={selectedQuotationForHistory?.history || []}
        quotationNumber={selectedQuotationForHistory?.quotationNumber || ''}
      />

      {/* View Quotation Dialog */}
      <Dialog open={!!viewQuotationId} onOpenChange={() => setViewQuotationId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "تفاصيل عرض السعر" : "Quotation Details"}
            </DialogTitle>
          </DialogHeader>
          {viewQuotationId && (() => {
            const quotation = quotations.find(q => q.id === viewQuotationId);
            if (!quotation) return null;
            
            return (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{quotation.quotationNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "تاريخ الإنشاء:" : "Created:"} {quotation.createdAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(quotation.status)}>
                      {getStatusText(quotation.status)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isArabic ? "صالح حتى:" : "Valid until:"} {quotation.expiryDate}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-3">
                    {isArabic ? "معلومات العميل" : "Customer Information"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isArabic ? "الاسم" : "Name"}
                      </label>
                      <p className="text-sm">{quotation.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isArabic ? "نوع العميل" : "Customer Type"}
                      </label>
                      <p className="text-sm capitalize">
                        {quotation.customer.type === 'individual' 
                          ? (isArabic ? 'فردي' : 'Individual')
                          : (isArabic ? 'شركة' : 'Business')
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isArabic ? "الهاتف" : "Phone"}
                      </label>
                      <p className="text-sm">{quotation.customer.phone}</p>
                    </div>
                    {quotation.customer.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {isArabic ? "البريد الإلكتروني" : "Email"}
                        </label>
                        <p className="text-sm">{quotation.customer.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3">
                    {isArabic ? "العناصر" : "Items"}
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">
                            {isArabic ? "المنتج" : "Product"}
                          </th>
                          <th className="text-center p-3 text-sm font-medium">
                            {isArabic ? "الكمية" : "Quantity"}
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            {isArabic ? "السعر" : "Price"}
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            {isArabic ? "المجموع" : "Total"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">{item.name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">
                              {item.price} {isArabic ? "ر.س" : "SAR"}
                            </td>
                            <td className="p-3 text-right">
                              {item.total} {isArabic ? "ر.س" : "SAR"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2 max-w-xs ml-auto">
                    <div className="flex justify-between">
                      <span>{isArabic ? "المجموع الفرعي:" : "Subtotal:"}</span>
                      <span>{quotation.subtotal} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? "الخصم:" : "Discount:"}</span>
                      <span>-{quotation.discount} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? `الضريبة (${quotation.taxRate}%):` : `Tax (${quotation.taxRate}%):`}</span>
                      <span>{quotation.taxAmount} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{isArabic ? "المجموع الكلي:" : "Total:"}</span>
                      <span>{quotation.total} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                  </div>
                </div>

                {quotation.notes && (
                  <div>
                    <h4 className="font-medium mb-2">
                      {isArabic ? "ملاحظات" : "Notes"}
                    </h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                      {quotation.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;