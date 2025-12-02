// Payments Page - Refactored with separated hooks
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Eye, CreditCard, History, Users, AlertTriangle, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PaymentDialog } from "@/components/Payments/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/Payments/PaymentHistoryDialog";
import { CustomerCreditDialog } from "@/components/Payments/CustomerCreditDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePaymentsData, usePaymentsFiltering, usePaymentsActions, usePaymentsStats } from '@/hooks/payments';
import { Payment, PaymentStatus, CustomerCredit } from '@/types/payment.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Payments = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const location = useLocation();

  // Data hook
  const { payments, customerCredits, loading, updatePaymentsStore, updateCreditsStore, refresh } = usePaymentsData();

  // Filtering hook
  const { search, localFilters, filteredPayments, updateSearch, updateLocalFilters } = usePaymentsFiltering(payments);

  // Actions hook
  const { create, update, remove, updateCustomerCredit } = usePaymentsActions({ 
    updatePaymentsStore, updateCreditsStore, isArabic, onSuccess: refresh 
  });

  // Stats hook
  const stats = usePaymentsStats(filteredPayments, customerCredits);

  // Local UI state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Handle navigation state
  useEffect(() => {
    if (location.state?.action === 'newPayment' && location.state?.customerId) {
      const { customerId, customerName } = location.state;
      handleNewPaymentForCustomer(customerId, customerName);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getStatusColor = (status: PaymentStatus) => {
    const colors: Record<PaymentStatus, string> = {
      completed: 'bg-green-500/10 text-green-700 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-700 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: PaymentStatus) => {
    const texts: Record<PaymentStatus, { ar: string; en: string }> = {
      completed: { ar: 'مكتمل', en: 'Completed' },
      pending: { ar: 'معلق', en: 'Pending' },
      failed: { ar: 'فاشل', en: 'Failed' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Payment['paymentMethod']) => {
    const texts = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' },
      check: { ar: 'شيك', en: 'Check' },
    };
    return texts[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getCreditStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      good: 'bg-green-500/10 text-green-700 border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      blocked: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.good;
  };

  const handleNewPaymentForCustomer = (customerId: string, customerName: string) => {
    setSelectedPayment({
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      customerId, customerName, amount: 0, paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'completed', reference: '', notes: '', relatedOrderIds: [], allocations: [],
    } as Payment);
    setIsViewMode(false);
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = (paymentData: Partial<Payment>) => {
    if (selectedPayment?.id && !isViewMode) {
      update(selectedPayment.id, paymentData);
    } else if (!isViewMode) {
      create(paymentData);
    }
    setSelectedPayment(null);
    setIsPaymentDialogOpen(false);
    setIsViewMode(false);
  };

  const confirmDeletePayment = () => {
    if (paymentToDelete) {
      remove(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Payment Management" arLabel="إدارة المدفوعات" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel enLabel="Manage payments and customer credit" arLabel="إدارة المدفوعات وائتمان العملاء" showBoth={false} />
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Payments" arLabel="إجمالي المدفوعات" showBoth={false} /></p>
                <p className="text-2xl font-bold">{stats.totalPayments.toLocaleString()} {currencySymbol}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg"><CreditCard className="w-6 h-6 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending Payments" arLabel="دفعات معلقة" showBoth={false} /></p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg"><History className="w-6 h-6 text-yellow-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Outstanding" arLabel="إجمالي المستحقات" showBoth={false} /></p>
                <p className="text-2xl font-bold">{stats.totalOutstanding.toLocaleString()} {currencySymbol}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Blocked Customers" arLabel="عملاء محظورين" showBoth={false} /></p>
                <p className="text-2xl font-bold">{stats.blockedCustomers}</p>
              </div>
              <div className="p-2 bg-gray-500/10 rounded-lg"><Users className="w-6 h-6 text-gray-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments"><BilingualLabel enLabel="Payments" arLabel="المدفوعات" showBoth={false} /></TabsTrigger>
          <TabsTrigger value="credit"><BilingualLabel enLabel="Customer Credit" arLabel="ائتمان العملاء" showBoth={false} /></TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={isArabic ? "البحث برقم الدفعة أو اسم العميل..." : "Search by payment number or customer name..."}
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={localFilters.status}
                onChange={(e) => updateLocalFilters('status', e.target.value as 'all' | PaymentStatus)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                <option value="failed">{isArabic ? 'فاشل' : 'Failed'}</option>
                <option value="cancelled">{isArabic ? 'ملغى' : 'Cancelled'}</option>
              </select>
              <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
              <Button onClick={() => { setSelectedPayment(null); setIsViewMode(false); setIsPaymentDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                <BilingualLabel enLabel="New Payment" arLabel="دفعة جديدة" showBoth={false} />
              </Button>
            </div>
          </div>

          {/* Payments Grid */}
          <div className="grid gap-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{payment.paymentNumber}</h3>
                      <p className="text-sm text-muted-foreground">{payment.customerName}</p>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="font-semibold">{payment.amount.toLocaleString()} {currencySymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'طريقة الدفع' : 'Method'}</p>
                      <p className="font-medium">{getPaymentMethodText(payment.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'التاريخ' : 'Date'}</p>
                      <p className="font-medium">{payment.paymentDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المرجع' : 'Reference'}</p>
                      <p className="font-medium">{payment.reference || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setIsViewMode(true); setIsPaymentDialogOpen(true); }}>
                      <Eye className="w-4 h-4 mr-1" />{isArabic ? 'عرض' : 'View'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setIsViewMode(false); setIsPaymentDialogOpen(true); }}>
                      <Edit className="w-4 h-4 mr-1" />{isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPaymentToDelete(payment)}>
                      <Trash2 className="w-4 h-4 mr-1" />{isArabic ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <div className="grid gap-4">
            {customerCredits.map((credit) => (
              <Card key={credit.customerId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{credit.customerName}</h3>
                      <Badge className={getCreditStatusColor(credit.creditStatus)}>
                        {credit.creditStatus === 'good' ? (isArabic ? 'جيد' : 'Good') :
                         credit.creditStatus === 'warning' ? (isArabic ? 'تحذير' : 'Warning') : (isArabic ? 'محظور' : 'Blocked')}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'حد الائتمان' : 'Credit Limit'}</p>
                      <p className="font-semibold">{credit.creditLimit.toLocaleString()} {currencySymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المتاح' : 'Available'}</p>
                      <p className="font-semibold text-green-600">{credit.availableCredit.toLocaleString()} {currencySymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المستخدم' : 'Used'}</p>
                      <p className="font-semibold text-yellow-600">{credit.usedCredit.toLocaleString()} {currencySymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المستحق' : 'Outstanding'}</p>
                      <p className="font-semibold text-red-600">{credit.totalOutstanding.toLocaleString()} {currencySymbol}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        payment={selectedPayment} 
        onSave={handleSavePayment}
        isViewMode={isViewMode}
      />
      <PaymentHistoryDialog 
        open={isHistoryDialogOpen} 
        onOpenChange={setIsHistoryDialogOpen}
        customerId={selectedCustomer?.id || ''}
        customerName={selectedCustomer?.name || ''}
        payments={payments.filter(p => p.customerId === selectedCustomer?.id)}
        onViewPayment={(payment) => { setSelectedPayment(payment); setIsViewMode(true); setIsPaymentDialogOpen(true); }}
        onDownloadStatement={() => {}}
      />
      <CustomerCreditDialog 
        open={isCreditDialogOpen} 
        onOpenChange={setIsCreditDialogOpen}
        customerId={selectedCustomer?.id || ''}
        customerName={selectedCustomer?.name || ''}
        customerCredit={customerCredits.find(c => c.customerId === selectedCustomer?.id)}
        onSave={updateCustomerCredit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic ? 'هل أنت متأكد من حذف هذه الدفعة؟' : 'Are you sure you want to delete this payment?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isArabic ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePayment}>{isArabic ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;
