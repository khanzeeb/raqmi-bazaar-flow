import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Truck, Package, Clock, CheckCircle, DollarSign, History } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PurchaseDialog } from "@/components/Purchases/PurchaseDialog";

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
  paymentMethod: 'full' | 'partial' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount: number;
  remainingAmount: number;
  paymentHistory: {
    id: string;
    amount: number;
    date: string;
    method: 'cash' | 'bank_transfer' | 'check';
    reference?: string;
  }[];
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

const Purchases = () => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Purchase['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | undefined>(undefined);
  const [showPaymentHistory, setShowPaymentHistory] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([
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
      paymentMethod: 'partial',
      paymentStatus: 'partial',
      paidAmount: 15000,
      remainingAmount: 11450,
      paymentHistory: [
        { id: '1', amount: 15000, date: '2024-01-12', method: 'bank_transfer', reference: 'TXN001' }
      ],
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
      paymentMethod: 'credit',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      remainingAmount: 5060,
      paymentHistory: [],
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
    if (isArabic) {
      switch (status) {
        case 'pending': return 'قيد الانتظار';
        case 'received': return 'تم الاستلام';
        case 'partial': return 'استلام جزئي';
        case 'returned': return 'مرتجع';
        default: return status;
      }
    } else {
      switch (status) {
        case 'pending': return 'Pending';
        case 'received': return 'Received';
        case 'partial': return 'Partial';
        case 'returned': return 'Returned';
        default: return status;
      }
    }
  };

  const getPaymentMethodText = (method: Purchase['paymentMethod']) => {
    if (isArabic) {
      switch (method) {
        case 'full': return 'دفع كامل';
        case 'partial': return 'دفع جزئي';
        case 'credit': return 'آجل';
        default: return method;
      }
    } else {
      switch (method) {
        case 'full': return 'Full Payment';
        case 'partial': return 'Partial Payment';
        case 'credit': return 'Credit';
        default: return method;
      }
    }
  };

  const getPaymentStatusColor = (status: Purchase['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'partial': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'unpaid': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
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
    <div className={`p-6 max-w-7xl mx-auto ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'المشتريات' : 'Purchases'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'إدارة طلبات الشراء والموردين' : 'Manage purchase orders and suppliers'}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={isArabic ? "البحث برقم الطلب أو اسم المورد..." : "Search by order number or supplier..."}
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
            <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="received">{isArabic ? 'تم الاستلام' : 'Received'}</option>
            <option value="partial">{isArabic ? 'استلام جزئي' : 'Partial'}</option>
            <option value="returned">{isArabic ? 'مرتجع' : 'Returned'}</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedPurchase(undefined);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {isArabic ? 'طلب شراء جديد' : 'New Purchase Order'}
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
                  <p className="font-semibold">{purchase.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الطلب' : 'Order Date'}</p>
                  <p className="font-medium">{purchase.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'التاريخ المتوقع' : 'Expected Date'}</p>
                  <p className="font-medium">{purchase.expectedDate || (isArabic ? 'غير محدد' : 'Not set')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</p>
                  <Badge className={getPaymentStatusColor(purchase.paymentStatus)}>
                    {getPaymentMethodText(purchase.paymentMethod)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'حالة الدفع' : 'Payment Status'}</p>
                  <p className="font-medium">{purchase.paidAmount.toLocaleString()} / {purchase.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {isArabic ? `العناصر (${purchase.items.length})` : `Items (${purchase.items.length})`}
                </p>
                <div className="space-y-1">
                  {purchase.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                    </div>
                  ))}
                  {purchase.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? `و ${purchase.items.length - 2} عنصر آخر...` : `And ${purchase.items.length - 2} more items...`}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
                <Button variant="outline" size="sm">
                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'تسجيل الاستلام' : 'Mark Received'}
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'إضافة دفعة' : 'Add Payment'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPaymentHistory(showPaymentHistory === purchase.id ? null : purchase.id)}
                >
                  <History className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'تاريخ المدفوعات' : 'Payment History'}
                </Button>
                {purchase.status === 'received' && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {isArabic ? 'إضافة للمخزون' : 'Add to Inventory'}
                  </Button>
                )}
              </div>
              
              {/* Payment History */}
              {showPaymentHistory === purchase.id && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">
                    {isArabic ? 'تاريخ المدفوعات' : 'Payment History'}
                  </h4>
                  {purchase.paymentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {purchase.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-background rounded border">
                          <div>
                            <p className="font-medium">{payment.amount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.method === 'cash' ? (isArabic ? 'نقدي' : 'Cash') : 
                               payment.method === 'bank_transfer' ? (isArabic ? 'تحويل بنكي' : 'Bank Transfer') : 
                               payment.method === 'check' ? (isArabic ? 'شيك' : 'Check') : payment.method}
                              {payment.reference && ` - ${payment.reference}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {isArabic ? 'لا توجد مدفوعات مسجلة' : 'No payments recorded'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isArabic ? 'لا توجد طلبات شراء مطابقة للبحث' : 'No purchase orders found matching your search'}
          </p>
        </div>
      )}

      <PurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        purchase={selectedPurchase}
        onSave={(purchaseData) => {
          if (selectedPurchase) {
            setPurchases(prev => prev.map(p => 
              p.id === selectedPurchase.id 
                ? { ...purchaseData, id: selectedPurchase.id }
                : p
            ));
          } else {
            const newPurchase = {
              ...purchaseData,
              id: Date.now().toString()
            };
            setPurchases(prev => [newPurchase, ...prev]);
          }
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Purchases;