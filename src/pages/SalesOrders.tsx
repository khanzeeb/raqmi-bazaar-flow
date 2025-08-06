import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Printer, Eye, RotateCcw } from "lucide-react";
import { OrderDialog } from "@/components/SalesOrders/OrderDialog";
import { ReturnDialog } from "@/components/SalesOrders/ReturnDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
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
  paymentMode: 'cash' | 'bank_transfer' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  status: 'pending' | 'completed' | 'returned';
  createdAt: string;
  notes?: string;
}

const SalesOrders = () => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | SalesOrder['status']>('all');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([
    {
      id: '1',
      orderNumber: 'SO-001',
      customer: { name: 'أحمد محمد', phone: '+966501234567', type: 'individual' },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
        { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
      ],
      subtotal: 2600,
      taxRate: 15,
      taxAmount: 390,
      discount: 100,
      total: 2890,
      paymentMode: 'cash',
      paymentStatus: 'paid',
      paidAmount: 2890,
      status: 'completed',
      createdAt: '2024-01-15',
      notes: 'تسليم سريع'
    },
    {
      id: '2',
      orderNumber: 'SO-002',
      customer: { name: 'شركة التقنية المتقدمة', phone: '+966112345678', type: 'business' },
      items: [
        { id: '3', name: 'طابعة ليزر', quantity: 3, price: 800, total: 2400 }
      ],
      subtotal: 2400,
      taxRate: 15,
      taxAmount: 360,
      discount: 0,
      total: 2760,
      paymentMode: 'credit',
      paymentStatus: 'partial',
      paidAmount: 1500,
      status: 'pending',
      createdAt: '2024-01-16'
    }
  ]);

  const getStatusColor = (status: SalesOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'returned': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getPaymentStatusColor = (status: SalesOrder['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'partial': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: SalesOrder['status']) => {
    const statusMap = {
      pending: { ar: 'معلق', en: 'Pending' },
      completed: { ar: 'مكتمل', en: 'Completed' },
      returned: { ar: 'مرتجع', en: 'Returned' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentStatusText = (status: SalesOrder['paymentStatus']) => {
    const statusMap = {
      pending: { ar: 'غير مدفوع', en: 'Unpaid' },
      partial: { ar: 'مدفوع جزئياً', en: 'Partially Paid' },
      paid: { ar: 'مدفوع بالكامل', en: 'Fully Paid' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentModeText = (mode: SalesOrder['paymentMode']) => {
    const modeMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' }
    };
    return modeMap[mode]?.[isArabic ? 'ar' : 'en'] || mode;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSaveOrder = (orderData: Partial<SalesOrder>) => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, ...orderData }
          : order
      ));
    } else {
      const newOrder: SalesOrder = {
        id: Date.now().toString(),
        orderNumber: `SO-${String(orders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...orderData
      } as SalesOrder;
      setOrders([newOrder, ...orders]);
    }
    setSelectedOrder(null);
    setIsOrderDialogOpen(false);
  };

  const handlePrintOrder = (order: SalesOrder) => {
    const printContent = `
      <html>
        <head>
          <title>${isArabic ? 'طلب بيع' : 'Sales Order'} - ${order.orderNumber}</title>
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
            <h1>${isArabic ? 'طلب بيع' : 'Sales Order'}</h1>
            <p><strong>${isArabic ? 'رقم الطلب:' : 'Order Number:'}</strong> ${order.orderNumber}</p>
            <p><strong>${isArabic ? 'التاريخ:' : 'Date:'}</strong> ${order.createdAt}</p>
            <p><strong>${isArabic ? 'الحالة:' : 'Status:'}</strong> ${getStatusText(order.status)}</p>
          </div>
          
          <div class="section">
            <h3>${isArabic ? 'معلومات العميل' : 'Customer Information'}</h3>
            <p><strong>${isArabic ? 'الاسم:' : 'Name:'}</strong> ${order.customer.name}</p>
            <p><strong>${isArabic ? 'الهاتف:' : 'Phone:'}</strong> ${order.customer.phone}</p>
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
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} ${isArabic ? 'ر.س' : 'SAR'}</td>
                    <td>${item.total} ${isArabic ? 'ر.س' : 'SAR'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <table>
              <tr><td><strong>${isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</strong></td><td>${order.subtotal} ${isArabic ? 'ر.س' : 'SAR'}</td></tr>
              <tr><td><strong>${isArabic ? 'الخصم:' : 'Discount:'}</strong></td><td>-${order.discount} ${isArabic ? 'ر.س' : 'SAR'}</td></tr>
              <tr><td><strong>${isArabic ? 'الضريبة' : 'Tax'} (${order.taxRate}%):</strong></td><td>${order.taxAmount} ${isArabic ? 'ر.س' : 'SAR'}</td></tr>
              <tr class="total"><td><strong>${isArabic ? 'المجموع الكلي:' : 'Total:'}</strong></td><td>${order.total} ${isArabic ? 'ر.س' : 'SAR'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>${isArabic ? 'معلومات الدفع' : 'Payment Information'}</h3>
            <p><strong>${isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</strong> ${getPaymentModeText(order.paymentMode)}</p>
            <p><strong>${isArabic ? 'حالة الدفع:' : 'Payment Status:'}</strong> ${getPaymentStatusText(order.paymentStatus)}</p>
            <p><strong>${isArabic ? 'المبلغ المدفوع:' : 'Paid Amount:'}</strong> ${order.paidAmount} ${isArabic ? 'ر.س' : 'SAR'}</p>
          </div>

          ${order.notes ? `
          <div class="section">
            <h3>${isArabic ? 'ملاحظات' : 'Notes'}</h3>
            <p>${order.notes}</p>
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

  const handleDownloadOrder = (order: SalesOrder) => {
    const csvContent = [
      [isArabic ? 'طلب بيع' : 'Sales Order', order.orderNumber].join(','),
      [isArabic ? 'العميل' : 'Customer', order.customer.name].join(','),
      [isArabic ? 'الهاتف' : 'Phone', order.customer.phone].join(','),
      [isArabic ? 'التاريخ' : 'Date', order.createdAt].join(','),
      [isArabic ? 'الحالة' : 'Status', getStatusText(order.status)].join(','),
      '',
      [isArabic ? 'المنتج' : 'Product', isArabic ? 'الكمية' : 'Quantity', isArabic ? 'السعر' : 'Price', isArabic ? 'المجموع' : 'Total'].join(','),
      ...order.items.map(item => [item.name, item.quantity, item.price, item.total].join(',')),
      '',
      [isArabic ? 'المجموع الفرعي' : 'Subtotal', order.subtotal].join(','),
      [isArabic ? 'الخصم' : 'Discount', -order.discount].join(','),
      [isArabic ? 'الضريبة' : 'Tax', order.taxAmount].join(','),
      [isArabic ? 'المجموع الكلي' : 'Total', order.total].join(','),
      [isArabic ? 'طريقة الدفع' : 'Payment Method', getPaymentModeText(order.paymentMode)].join(','),
      [isArabic ? 'حالة الدفع' : 'Payment Status', getPaymentStatusText(order.paymentStatus)].join(','),
      [isArabic ? 'المبلغ المدفوع' : 'Paid Amount', order.paidAmount].join(','),
      order.notes ? [isArabic ? 'ملاحظات' : 'Notes', order.notes].join(',') : ''
    ].filter(Boolean).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-order-${order.orderNumber}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({
      title: isArabic ? "تم تحميل الطلب" : "Order downloaded",
      description: isArabic ? "تم تحميل طلب البيع كملف CSV" : "Sales order has been downloaded as CSV file",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('sales_orders')}
        </h1>
        <p className="text-muted-foreground">
          {t('sales_orders_management')}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={isArabic ? "البحث برقم الطلب أو اسم العميل..." : "Search by order number or customer name..."}
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
            <option value="all">{t('all_statuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="returned">{t('returned')}</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setSelectedOrder(null);
              setIsOrderDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('new_order')}
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.customer.name}
                    {order.customer.phone && ` - ${order.customer.phone}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total')}</p>
                  <p className="font-semibold">{order.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('payment_method')}</p>
                  <p className="font-medium">{getPaymentModeText(order.paymentMode)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('paid_amount')}</p>
                  <p className="font-medium">{order.paidAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('date')}</p>
                  <p className="font-medium">{order.createdAt}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('items')} ({order.items.length})
                </p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic 
                        ? `و ${order.items.length - 2} عنصر آخر...`
                        : `and ${order.items.length - 2} more items...`
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
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsOrderDialogOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t('view')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintOrder(order)}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  {t('print')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadOrder(order)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t('download')}
                </Button>
                
                {/* Return Button - Only show for completed orders */}
                {order.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsReturnDialogOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {isArabic ? "إرجاع" : "Return"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isArabic ? "لا توجد أوامر مطابقة للبحث" : "No orders match your search"}
          </p>
        </div>
      )}

      <OrderDialog
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onSave={handleSaveOrder}
      />
      
      {selectedOrder && (
        <ReturnDialog
          isOpen={isReturnDialogOpen}
          onOpenChange={setIsReturnDialogOpen}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default SalesOrders;