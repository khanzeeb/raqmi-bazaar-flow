// useSalesOrdersActions - CRUD operations with backend integration
import { useCallback } from 'react';
import { SalesOrder } from '@/types/salesOrder.types';
import { salesOrderGateway } from '@/features/sales/services/salesOrder.gateway';
import { useToast } from '@/hooks/use-toast';

interface UseSalesOrdersActionsOptions {
  updateStore: (updater: (prev: SalesOrder[]) => SalesOrder[]) => void;
  onSuccess?: () => void;
  isArabic?: boolean;
}

export const useSalesOrdersActions = (
  orders: SalesOrder[],
  setOrders: React.Dispatch<React.SetStateAction<SalesOrder[]>>,
  isArabic: boolean = false,
  options?: Omit<UseSalesOrdersActionsOptions, 'isArabic'>
) => {
  const { toast } = useToast();
  const updateStore = options?.updateStore || setOrders;

  const saveOrder = useCallback(async (
    orderData: Partial<SalesOrder>, 
    selectedOrder: SalesOrder | null
  ): Promise<boolean> => {
    try {
      if (selectedOrder) {
        // Update existing order
        const response = await salesOrderGateway.update(selectedOrder.id, {
          customerId: orderData.customer?.name || selectedOrder.customer.name,
          customerName: orderData.customer?.name || selectedOrder.customer.name,
          customerPhone: orderData.customer?.phone || selectedOrder.customer.phone,
          customerType: orderData.customer?.type || selectedOrder.customer.type,
          items: orderData.items?.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: orderData.subtotal,
          taxRate: orderData.taxRate,
          discount: orderData.discount,
          notes: orderData.notes,
          paymentMode: orderData.paymentMode
        });

        if (response.success && response.data) {
          updateStore((prev: SalesOrder[]) => 
            prev.map(order => order.id === selectedOrder.id ? response.data! : order)
          );
          toast({
            title: isArabic ? 'تم التحديث' : 'Success',
            description: isArabic ? 'تم تحديث الطلب بنجاح' : 'Order updated successfully'
          });
          return true;
        } else {
          throw new Error(response.error);
        }
      } else {
        // Create new order
        const response = await salesOrderGateway.create({
          customerId: orderData.customer?.name || '',
          customerName: orderData.customer?.name || '',
          customerPhone: orderData.customer?.phone || '',
          customerType: orderData.customer?.type || 'individual',
          items: orderData.items?.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })) || [],
          subtotal: orderData.subtotal || 0,
          taxRate: orderData.taxRate || 15,
          discount: orderData.discount,
          notes: orderData.notes,
          paymentMode: orderData.paymentMode || 'cash'
        });

        if (response.success && response.data) {
          updateStore((prev: SalesOrder[]) => [response.data!, ...prev]);
          toast({
            title: isArabic ? 'تم الحفظ' : 'Success',
            description: isArabic ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully'
          });
          return true;
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error instanceof Error ? error.message : (isArabic ? 'فشل في حفظ الطلب' : 'Failed to save order'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, isArabic, updateStore]);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await salesOrderGateway.delete(id);
      
      if (response.success) {
        updateStore((prev: SalesOrder[]) => prev.filter(order => order.id !== id));
        toast({
          title: isArabic ? 'تم الحذف' : 'Success',
          description: isArabic ? 'تم حذف الطلب' : 'Order deleted'
        });
        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في حذف الطلب' : 'Failed to delete order',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, isArabic, updateStore]);

  const cancelOrder = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    try {
      const response = await salesOrderGateway.cancel(id, reason);
      
      if (response.success && response.data) {
        updateStore((prev: SalesOrder[]) => 
          prev.map(order => order.id === id ? response.data! : order)
        );
        toast({
          title: isArabic ? 'تم الإلغاء' : 'Cancelled',
          description: isArabic ? 'تم إلغاء الطلب' : 'Order has been cancelled'
        });
        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في إلغاء الطلب' : 'Failed to cancel order',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, isArabic, updateStore]);

  const addPayment = useCallback(async (
    id: string, 
    amount: number, 
    method: string = 'cash'
  ): Promise<boolean> => {
    try {
      const response = await salesOrderGateway.addPayment(id, amount, method);
      
      if (response.success && response.data) {
        updateStore((prev: SalesOrder[]) => 
          prev.map(order => order.id === id ? response.data! : order)
        );
        toast({
          title: isArabic ? 'تم الدفع' : 'Payment Added',
          description: isArabic ? 'تم إضافة الدفعة بنجاح' : 'Payment added successfully'
        });
        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في إضافة الدفعة' : 'Failed to add payment',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, isArabic, updateStore]);

  const printOrder = useCallback((order: SalesOrder) => {
    const printContent = generatePrintContent(order, isArabic);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }, [isArabic]);

  const downloadOrder = useCallback((order: SalesOrder) => {
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
  }, [toast, isArabic]);

  return { 
    saveOrder, 
    deleteOrder, 
    cancelOrder, 
    addPayment, 
    printOrder, 
    downloadOrder 
  };
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
        <p><strong>${isArabic ? 'الهاتف:' : 'Phone:'}</strong> ${order.customer.phone}</p>
        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'المنتج' : 'Product'}</th>
              <th>${isArabic ? 'الكمية' : 'Qty'}</th>
              <th>${isArabic ? 'السعر' : 'Price'}</th>
              <th>${isArabic ? 'المجموع' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><strong>${isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</strong> ${order.subtotal}</p>
        <p><strong>${isArabic ? 'الضريبة:' : 'Tax:'}</strong> ${order.taxAmount}</p>
        <p><strong>${isArabic ? 'الخصم:' : 'Discount:'}</strong> ${order.discount}</p>
        <p><strong>${isArabic ? 'المجموع الكلي:' : 'Total:'}</strong> ${order.total} ${isArabic ? 'ر.س' : 'SAR'}</p>
      </body>
    </html>
  `;
};

const generateCSVContent = (order: SalesOrder, isArabic: boolean) => {
  const header = [
    isArabic ? 'رقم الطلب' : 'Order Number',
    isArabic ? 'العميل' : 'Customer',
    isArabic ? 'التاريخ' : 'Date',
    isArabic ? 'المجموع' : 'Total',
    isArabic ? 'الحالة' : 'Status'
  ].join(',');
  
  const row = [
    order.orderNumber,
    order.customer.name,
    order.createdAt,
    order.total,
    order.status
  ].join(',');

  return `${header}\n${row}`;
};
