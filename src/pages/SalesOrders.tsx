import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSalesOrdersData, useSalesOrdersFiltering, useSalesOrdersActions, useSalesOrdersStats } from "@/hooks/salesOrders";
import { SalesOrderFilters } from "@/components/SalesOrders/SalesOrderFilters";
import { SalesOrderCard } from "@/components/SalesOrders/SalesOrderCard";
import { OrderDialog } from "@/components/SalesOrders/OrderDialog";
import { ReturnDialog } from "@/components/SalesOrders/ReturnDialog";
import { SalesOrder } from "@/types/salesOrder.types";

const SalesOrders = () => {
  const { t, language, isRTL } = useLanguage();
  const { formatCurrency, getCurrencySymbol } = useUserSettings();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const { orders, setOrders } = useSalesOrdersData();
  const { filters, filteredOrders, setSearchQuery, setStatus } = useSalesOrdersFiltering(orders);
  const { addOrder, updateOrder } = useSalesOrdersActions(orders, setOrders);
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

  const handleSaveOrder = (orderData: Partial<SalesOrder>) => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, orderData);
    } else {
      addOrder(orderData);
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
          </div>
          <div class="section">
            <h3>${isArabic ? 'معلومات العميل' : 'Customer Information'}</h3>
            <p><strong>${isArabic ? 'الاسم:' : 'Name:'}</strong> ${order.customer.name}</p>
            <p><strong>${isArabic ? 'الهاتف:' : 'Phone:'}</strong> ${order.customer.phone}</p>
          </div>
          <div class="section">
            <h3>${isArabic ? 'العناصر' : 'Items'}</h3>
            <table>
              <thead><tr><th>${isArabic ? 'المنتج' : 'Product'}</th><th>${isArabic ? 'الكمية' : 'Qty'}</th><th>${isArabic ? 'السعر' : 'Price'}</th><th>${isArabic ? 'المجموع' : 'Total'}</th></tr></thead>
              <tbody>${order.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.total}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <div class="section total">
            <p>${isArabic ? 'المجموع الكلي:' : 'Total:'} ${order.total} ${isArabic ? 'ر.س' : 'SAR'}</p>
          </div>
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
      ['Order', order.orderNumber],
      ['Customer', order.customer.name],
      ['Date', order.createdAt],
      ['Total', order.total],
      '',
      ['Product', 'Qty', 'Price', 'Total'],
      ...order.items.map(item => [item.name, item.quantity, item.price, item.total])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales-order-${order.orderNumber}.csv`;
    link.click();
    
    toast({
      title: isArabic ? "تم تحميل الطلب" : "Order downloaded",
      description: isArabic ? "تم تحميل طلب البيع كملف CSV" : "Sales order has been downloaded as CSV file",
    });
  };

  const handleReturnOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsReturnDialogOpen(true);
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

      <SalesOrderFilters
        searchTerm={filters.searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={filters.status}
        onStatusChange={setStatus}
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
          open={isReturnDialogOpen}
          onOpenChange={setIsReturnDialogOpen}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default SalesOrders;
