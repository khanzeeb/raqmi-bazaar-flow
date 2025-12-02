// Purchases Page - Refactored with modular components
import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { PurchaseDialog } from "@/components/Purchases/PurchaseDialog";
import { PaymentDialog } from "@/components/Purchases/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/Purchases/PaymentHistoryDialog";
import { PurchaseCard } from "@/components/Purchases/PurchaseCard";
import { PurchaseFilters } from "@/components/Purchases/PurchaseFilters";
import { PurchaseStats } from "@/components/Purchases/PurchaseStats";
import { usePurchasesData, usePurchasesFiltering, usePurchasesActions, usePurchasesStats } from '@/hooks/purchases';
import { Purchase } from '@/types/purchase.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Purchases = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Hooks
  const { purchases, updateStore, refresh } = usePurchasesData();
  const { search, localFilters, filteredPurchases, updateSearch, updateLocalFilters } = usePurchasesFiltering(purchases);
  const { create, update, markReceived, addPayment, addToInventory } = usePurchasesActions({ updateStore, isArabic, onSuccess: refresh });
  const stats = usePurchasesStats(purchases);

  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | undefined>(undefined);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState<Purchase | null>(null);
  const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
  const [selectedPurchaseForHistory, setSelectedPurchaseForHistory] = useState<Purchase | null>(null);

  const handleSavePayment = (paymentData: any) => {
    if (selectedPurchaseForPayment) {
      addPayment(selectedPurchaseForPayment.id, paymentData);
    }
    setIsPaymentDialogOpen(false);
    setSelectedPurchaseForPayment(null);
  };

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

      <PurchaseStats stats={stats} />

      <PurchaseFilters
        search={search}
        status={localFilters.status}
        onSearchChange={updateSearch}
        onStatusChange={(value) => updateLocalFilters('status', value)}
        onNewPurchase={() => { setSelectedPurchase(undefined); setIsDialogOpen(true); }}
      />

      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onViewDetails={() => { setSelectedPurchase(purchase); setIsDialogOpen(true); }}
            onMarkReceived={() => markReceived(purchase.id)}
            onAddPayment={() => { setSelectedPurchaseForPayment(purchase); setIsPaymentDialogOpen(true); }}
            onViewHistory={() => { setSelectedPurchaseForHistory(purchase); setIsPaymentHistoryDialogOpen(true); }}
            onAddToInventory={() => addToInventory(purchase.id)}
          />
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
          if (selectedPurchase) update(selectedPurchase.id, purchaseData);
          else create(purchaseData);
          setIsDialogOpen(false);
        }}
      />
      <PaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} purchase={selectedPurchaseForPayment} onSave={handleSavePayment} />
      <PaymentHistoryDialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen} purchase={selectedPurchaseForHistory} />
    </div>
  );
};

export default Purchases;
