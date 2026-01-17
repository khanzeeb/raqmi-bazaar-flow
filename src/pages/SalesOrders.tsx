import { useState } from 'react';
import { useRTL } from "@/hooks/useRTL";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSalesOrdersData, useSalesOrdersFiltering, useSalesOrdersActions, useSalesOrdersStats } from "@/hooks/salesOrders";
import { SalesOrderFilters } from "@/components/SalesOrders/SalesOrderFilters";
import { SalesOrderCard } from "@/components/SalesOrders/SalesOrderCard";
import { OrderDialog } from "@/components/SalesOrders/OrderDialog";
import { ReturnDialog } from "@/components/SalesOrders/ReturnDialog";
import { SalesOrder } from "@/types/salesOrder.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

const SalesOrders = () => {
  const { t } = useLanguage();
  const { isArabic, isRTL } = useRTL();
  const { formatCurrency, getCurrencySymbol } = useUserSettings();
  const { toast } = useToast();
  
  const { orders, setOrders, loading, error, refresh, updateStore } = useSalesOrdersData();
  const { filters, filteredOrders, setSearchTerm, setSelectedStatus } = useSalesOrdersFiltering(orders);
  const { saveOrder, deleteOrder, cancelOrder, addPayment, printOrder, downloadOrder } = useSalesOrdersActions(
    orders, 
    setOrders, 
    isArabic, 
    { updateStore }
  );
  const stats = useSalesOrdersStats(orders);
  
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const handleNewOrder = () => {
    setSelectedOrder(null);
    setIsOrderDialogOpen(true);
  };

  const handleViewOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleSaveOrder = async (orderData: Partial<SalesOrder>) => {
    const success = await saveOrder(orderData, selectedOrder);
    if (success) {
      setSelectedOrder(null);
      setIsOrderDialogOpen(false);
    }
  };

  const handlePrintOrder = (order: SalesOrder) => {
    printOrder(order);
  };

  const handleDownloadOrder = (order: SalesOrder) => {
    downloadOrder(order);
  };

  const handleReturnOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsReturnDialogOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{isArabic ? 'جارٍ تحميل الطلبات...' : 'Loading orders...'}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('sales_orders')}
        </h1>
        <p className="text-muted-foreground">
          {t('sales_orders_management')}
        </p>
      </div>

      <SalesOrderFilters
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={filters.selectedStatus}
        onStatusChange={setSelectedStatus}
        onNewOrder={handleNewOrder}
        isArabic={isArabic}
        t={t}
      />

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <SalesOrderCard
            key={order.id}
            order={order}
            isArabic={isArabic}
            onView={handleViewOrder}
            onPrint={handlePrintOrder}
            onDownload={handleDownloadOrder}
            onReturn={handleReturnOrder}
            t={t}
          />
        ))}
      </div>

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
