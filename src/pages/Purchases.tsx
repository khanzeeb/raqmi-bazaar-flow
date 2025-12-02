// Purchases Page - Refactored with separated hooks
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Truck, Package, Clock, CheckCircle, DollarSign, History } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PurchaseDialog } from "@/components/Purchases/PurchaseDialog";
import { PaymentDialog } from "@/components/Purchases/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/Purchases/PaymentHistoryDialog";
import { usePurchasesData, usePurchasesFiltering, usePurchasesActions, usePurchasesStats } from '@/hooks/purchases';
import { Purchase, PurchaseStatus } from '@/types/purchase.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Purchases = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Data hook
  const { purchases, loading, updateStore, refresh } = usePurchasesData();

  // Filtering hook
  const { search, localFilters, filteredPurchases, updateSearch, updateLocalFilters } = usePurchasesFiltering(purchases);

  // Actions hook
  const { create, update, remove, markReceived, addPayment, addToInventory } = usePurchasesActions({ 
    updateStore, isArabic, onSuccess: refresh 
  });

  // Stats hook
  const stats = usePurchasesStats(purchases);

  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | undefined>(undefined);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState<Purchase | null>(null);
  const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
  const [selectedPurchaseForHistory, setSelectedPurchaseForHistory] = useState<Purchase | null>(null);

  const getStatusColor = (status: PurchaseStatus) => {
    const colors: Record<PurchaseStatus, string> = {
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      received: 'bg-green-500/10 text-green-700 border-green-500/20',
      partial: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      returned: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: PurchaseStatus) => {
    const texts: Record<PurchaseStatus, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      received: { ar: 'تم الاستلام', en: 'Received' },
      partial: { ar: 'استلام جزئي', en: 'Partial' },
      returned: { ar: 'مرتجع', en: 'Returned' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Purchase['paymentMethod']) => {
    const texts = {
      full: { ar: 'دفع كامل', en: 'Full Payment' },
      partial: { ar: 'دفع جزئي', en: 'Partial Payment' },
      credit: { ar: 'آجل', en: 'Credit' },
    };
    return texts[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getPaymentStatusColor = (status: Purchase['paymentStatus']) => {
    const colors = {
      paid: 'bg-green-500/10 text-green-700 border-green-500/20',
      partial: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      unpaid: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.unpaid;
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    const icons = { pending: Clock, received: CheckCircle, partial: Package, returned: Truck };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const handleSavePayment = (paymentData: any) => {
    if (selectedPurchaseForPayment) {
      addPayment(selectedPurchaseForPayment.id, paymentData);
    }
    setIsPaymentDialogOpen(false);
    setSelectedPurchaseForPayment(null);
  };

  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Purchases" arLabel="المشتريات" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel enLabel="Manage purchase orders and suppliers" arLabel="إدارة طلبات الشراء والموردين" showBoth={false} />
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Orders" arLabel="إجمالي الطلبات" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending" arLabel="قيد الانتظار" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Value" arLabel="القيمة الإجمالية" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.unpaidValue.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Unpaid" arLabel="غير مدفوع" showBoth={false} /></p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={isArabic ? "البحث برقم الطلب أو اسم المورد..." : "Search by order number or supplier..."}
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className={isArabic ? "pr-10" : "pl-10"}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={localFilters.status}
            onChange={(e) => updateLocalFilters('status', e.target.value as 'all' | PurchaseStatus)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
            <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="received">{isArabic ? 'تم الاستلام' : 'Received'}</option>
            <option value="partial">{isArabic ? 'استلام جزئي' : 'Partial'}</option>
            <option value="returned">{isArabic ? 'مرتجع' : 'Returned'}</option>
          </select>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <Button onClick={() => { setSelectedPurchase(undefined); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            <BilingualLabel enLabel="New Purchase Order" arLabel="طلب شراء جديد" showBoth={false} />
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
                    {purchase.supplier.name}{purchase.supplier.phone && ` - ${purchase.supplier.phone}`}
                  </p>
                </div>
                <Badge className={getStatusColor(purchase.status)}>{getStatusText(purchase.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
                  <p className="font-semibold">{purchase.total.toLocaleString()} {currencySymbol}</p>
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
                  <Badge className={getPaymentStatusColor(purchase.paymentStatus)}>{getPaymentMethodText(purchase.paymentMethod)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'حالة الدفع' : 'Payment Status'}</p>
                  <p className="font-medium">{purchase.paidAmount.toLocaleString()} / {purchase.total.toLocaleString()} {currencySymbol}</p>
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
                      <span>{item.total.toLocaleString()} {currencySymbol}</span>
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
                <Button variant="outline" size="sm" onClick={() => { setSelectedPurchase(purchase); setIsDialogOpen(true); }}>
                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => markReceived(purchase.id)} disabled={purchase.status === 'received'}>
                  <Truck className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'تسجيل الاستلام' : 'Mark Received'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedPurchaseForPayment(purchase); setIsPaymentDialogOpen(true); }}>
                  <DollarSign className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'إضافة دفعة' : 'Add Payment'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedPurchaseForHistory(purchase); setIsPaymentHistoryDialogOpen(true); }}>
                  <History className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                  {isArabic ? 'سجل المدفوعات' : 'Payment History'}
                </Button>
                {purchase.status === 'received' && !purchase.addedToInventory && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => addToInventory(purchase.id)}>
                    {isArabic ? 'إضافة للمخزون' : 'Add to Inventory'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد طلبات شراء مطابقة للبحث' : 'No purchase orders found matching your search'}</p>
        </div>
      )}

      {/* Dialogs */}
      <PurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        purchase={selectedPurchase}
        onSave={(purchaseData) => {
          if (selectedPurchase) {
            update(selectedPurchase.id, purchaseData);
          } else {
            create(purchaseData);
          }
          setIsDialogOpen(false);
        }}
      />
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        purchase={selectedPurchaseForPayment}
        onSave={handleSavePayment}
      />
      <PaymentHistoryDialog
        open={isPaymentHistoryDialogOpen}
        onOpenChange={setIsPaymentHistoryDialogOpen}
        purchase={selectedPurchaseForHistory}
      />
    </div>
  );
};

export default Purchases;
