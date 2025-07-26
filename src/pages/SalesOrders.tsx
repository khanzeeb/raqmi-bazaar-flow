import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Printer, Eye } from "lucide-react";
import { OrderDialog } from "@/components/SalesOrders/OrderDialog";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | SalesOrder['status']>('all');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
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
    switch (status) {
      case 'pending': return 'معلق';
      case 'completed': return 'مكتمل';
      case 'returned': return 'مرتجع';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: SalesOrder['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'غير مدفوع';
      case 'partial': return 'مدفوع جزئياً';
      case 'paid': return 'مدفوع بالكامل';
      default: return status;
    }
  };

  const getPaymentModeText = (mode: SalesOrder['paymentMode']) => {
    switch (mode) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'credit': return 'آجل';
      default: return mode;
    }
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">أوامر البيع</h1>
        <p className="text-muted-foreground">إدارة أوامر البيع والمدفوعات</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث برقم الطلب أو اسم العميل..."
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
            <option value="pending">معلق</option>
            <option value="completed">مكتمل</option>
            <option value="returned">مرتجع</option>
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
            طلب جديد
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
                  <p className="text-sm text-muted-foreground">المجموع</p>
                  <p className="font-semibold">{order.total.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                  <p className="font-medium">{getPaymentModeText(order.paymentMode)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المدفوع</p>
                  <p className="font-medium">{order.paidAmount.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{order.createdAt}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">العناصر ({order.items.length})</p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      و {order.items.length - 2} عنصر آخر...
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
                  عرض
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1" />
                  طباعة
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  تحميل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد أوامر مطابقة للبحث</p>
        </div>
      )}

      <OrderDialog
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        onSave={handleSaveOrder}
        isArabic={true}
      />
    </div>
  );
};

export default SalesOrders;