// Payments Page - Refactored with modular components
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PaymentDialog } from "@/components/Payments/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/Payments/PaymentHistoryDialog";
import { CustomerCreditDialog } from "@/components/Payments/CustomerCreditDialog";
import { PaymentCard } from "@/components/Payments/PaymentCard";
import { PaymentFilters } from "@/components/Payments/PaymentFilters";
import { PaymentStats } from "@/components/Payments/PaymentStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePaymentsData, usePaymentsFiltering, usePaymentsActions, usePaymentsStats } from '@/hooks/payments';
import { Payment, CustomerCredit } from '@/types/payment.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Payments = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const location = useLocation();

  // Hooks
  const { payments, customerCredits, updatePaymentsStore, updateCreditsStore, refresh } = usePaymentsData();
  const { search, localFilters, filteredPayments, updateSearch, updateLocalFilters } = usePaymentsFiltering(payments);
  const { create, update, remove, updateCustomerCredit } = usePaymentsActions({ updatePaymentsStore, updateCreditsStore, isArabic, onSuccess: refresh });
  const stats = usePaymentsStats(filteredPayments, customerCredits);

  // Local UI state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  // Handle navigation state
  useEffect(() => {
    if (location.state?.action === 'newPayment' && location.state?.customerId) {
      const { customerId, customerName } = location.state;
      handleNewPaymentForCustomer(customerId, customerName);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const getCreditStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      good: 'bg-green-500/10 text-green-700 border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      blocked: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.good;
  };

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

      <PaymentStats stats={stats} />

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments"><BilingualLabel enLabel="Payments" arLabel="المدفوعات" showBoth={false} /></TabsTrigger>
          <TabsTrigger value="credit"><BilingualLabel enLabel="Customer Credit" arLabel="ائتمان العملاء" showBoth={false} /></TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          <PaymentFilters
            search={search}
            status={localFilters.status}
            onSearchChange={updateSearch}
            onStatusChange={(value) => updateLocalFilters('status', value)}
            onNewPayment={() => { setSelectedPayment(null); setIsViewMode(false); setIsPaymentDialogOpen(true); }}
          />

          <div className="grid gap-4">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onView={() => { setSelectedPayment(payment); setIsViewMode(true); setIsPaymentDialogOpen(true); }}
                onEdit={() => { setSelectedPayment(payment); setIsViewMode(false); setIsPaymentDialogOpen(true); }}
                onDelete={() => setPaymentToDelete(payment)}
              />
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
      <PaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} payment={selectedPayment} onSave={handleSavePayment} isViewMode={isViewMode} />
      <PaymentHistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} customerId={selectedCustomer?.id || ''} customerName={selectedCustomer?.name || ''} payments={payments.filter(p => p.customerId === selectedCustomer?.id)} onViewPayment={(payment) => { setSelectedPayment(payment); setIsViewMode(true); setIsPaymentDialogOpen(true); }} onDownloadStatement={() => {}} />
      <CustomerCreditDialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen} customerId={selectedCustomer?.id || ''} customerName={selectedCustomer?.name || ''} customerCredit={customerCredits.find(c => c.customerId === selectedCustomer?.id)} onSave={updateCustomerCredit} />

      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
            <AlertDialogDescription>{isArabic ? 'هل أنت متأكد من حذف هذه الدفعة؟' : 'Are you sure you want to delete this payment?'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isArabic ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (paymentToDelete) { remove(paymentToDelete.id); setPaymentToDelete(null); } }}>{isArabic ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;
