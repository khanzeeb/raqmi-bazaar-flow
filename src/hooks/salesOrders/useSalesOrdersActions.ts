import { SalesOrder } from '@/types/salesOrder.types';
import { useToast } from '@/hooks/use-toast';

export const useSalesOrdersActions = (
  orders: SalesOrder[],
  setOrders: React.Dispatch<React.SetStateAction<SalesOrder[]>>,
  isArabic: boolean
) => {
  const { toast } = useToast();

  const saveOrder = (orderData: Partial<SalesOrder>, selectedOrder: SalesOrder | null) => {
    if (selectedOrder) {
      setOrders(prev => prev.map(order =>
        order.id === selectedOrder.id ? { ...order, ...orderData } : order
      ));
    } else {
      const newOrder: SalesOrder = {
        id: Date.now().toString(),
        orderNumber: `SO-${String(orders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...orderData
      } as SalesOrder;
      setOrders(prev => [newOrder, ...prev]);
    }
  };

  const printOrder = (order: SalesOrder) => {
    const printContent = generatePrintContent(order, isArabic);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const downloadOrder = (order: SalesOrder) => {
    const csvContent = generateCSVContent(order, isArabic);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-order-${order.orderNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: isArabic ? "تم تحميل الطلب" : "Order downloaded",
      description: isArabic ? "تم تحميل طلب البيع كملف CSV" : "Sales order has been downloaded as CSV file",
    });
  };

  return { saveOrder, printOrder, downloadOrder };
};

const generatePrintContent = (order: SalesOrder, isArabic: boolean) => {
  return `
    <html>
      <head>
        <title>${isArabic ? 'طلب بيع' : 'Sales Order'} - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: ${isArabic ? 'right' : 'left'}; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isArabic ? 'طلب بيع' : 'Sales Order'}</h1>
          <p><strong>${isArabic ? 'رقم الطلب:' : 'Order Number:'}</strong> ${order.orderNumber}</p>
          <p><strong>${isArabic ? 'التاريخ:' : 'Date:'}</strong> ${order.createdAt}</p>
        </div>
        <p><strong>${isArabic ? 'العميل:' : 'Customer:'}</strong> ${order.customer.name}</p>
        <p><strong>${isArabic ? 'المجموع:' : 'Total:'}</strong> ${order.total} ${isArabic ? 'ر.س' : 'SAR'}</p>
      </body>
    </html>
  `;
};

const generateCSVContent = (order: SalesOrder, isArabic: boolean) => {
  return [
    [isArabic ? 'طلب بيع' : 'Sales Order', order.orderNumber].join(','),
    [isArabic ? 'العميل' : 'Customer', order.customer.name].join(','),
    [isArabic ? 'المجموع الكلي' : 'Total', order.total].join(','),
  ].join('\n');
};
