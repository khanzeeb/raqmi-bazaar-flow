import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Truck, Package, Clock, CheckCircle } from "lucide-react";

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplier: {
    name: string;
    phone: string;
    email?: string;
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
  total: number;
  status: 'pending' | 'received' | 'partial' | 'returned';
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Purchase['status']>('all');
  const [purchases] = useState<Purchase[]>([
    {
      id: '1',
      purchaseNumber: 'PO-001',
      supplier: {
        name: 'شركة الإمدادات التقنية',
        phone: '+966112345678',
        email: 'supplies@tech.com'
      },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 10, unitPrice: 2000, total: 20000 },
        { id: '2', name: 'طابعة ليزر', quantity: 5, unitPrice: 600, total: 3000 }
      ],
      subtotal: 23000,
      taxAmount: 3450,
      total: 26450,
      status: 'received',
      orderDate: '2024-01-10',
      expectedDate: '2024-01-20',
      receivedDate: '2024-01-18',
      notes: 'تم الاستلام بحالة ممتازة'
    },
    {
      id: '2',
      purchaseNumber: 'PO-002',
      supplier: {
        name: 'مورد الإكسسوارات',
        phone: '+966509876543'
      },
      items: [
        { id: '3', name: 'ماوس لاسلكي', quantity: 50, unitPrice: 40, total: 2000 },
        { id: '4', name: 'لوحة مفاتيح', quantity: 30, unitPrice: 80, total: 2400 }
      ],
      subtotal: 4400,
      taxAmount: 660,
      total: 5060,
      status: 'pending',
      orderDate: '2024-01-15',
      expectedDate: '2024-01-25'
    }
  ]);

  const getStatusColor = (status: Purchase['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'received': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'partial': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'returned': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Purchase['status']) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'received': return 'تم الاستلام';
      case 'partial': return 'استلام جزئي';
      case 'returned': return 'مرتجع';
      default: return status;
    }
  };

  const getStatusIcon = (status: Purchase['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Package className="w-4 h-4" />;
      case 'returned': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || purchase.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">المشتريات</h1>
        <p className="text-muted-foreground">إدارة طلبات الشراء والموردين</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث برقم الطلب أو اسم المورد..."
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
            <option value="pending">قيد الانتظار</option>
            <option value="received">تم الاستلام</option>
            <option value="partial">استلام جزئي</option>
            <option value="returned">مرتجع</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            طلب شراء جديد
          </Button>
        </div>
      </div>

      {/* Purchases Grid */}
      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {purchase.purchaseNumber}
                    {getStatusIcon(purchase.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {purchase.supplier.name}
                    {purchase.supplier.phone && ` - ${purchase.supplier.phone}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(purchase.status)}>
                    {getStatusText(purchase.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">المجموع</p>
                  <p className="font-semibold">{purchase.total.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                  <p className="font-medium">{purchase.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ المتوقع</p>
                  <p className="font-medium">{purchase.expectedDate || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الاستلام</p>
                  <p className="font-medium">{purchase.receivedDate || 'لم يتم بعد'}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">العناصر ({purchase.items.length})</p>
                <div className="space-y-1">
                  {purchase.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  {purchase.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      و {purchase.items.length - 2} عنصر آخر...
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className="w-4 h-4 mr-1" />
                  تسجيل الاستلام
                </Button>
                <Button variant="outline" size="sm">
                  طباعة
                </Button>
                {purchase.status === 'received' && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    إضافة للمخزون
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد طلبات شراء مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;