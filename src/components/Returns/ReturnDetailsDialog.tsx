import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  RotateCcw, 
  Clock, 
  User, 
  Package, 
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReturnDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  returnData: any;
}

// Mock order data - in real app this would come from API
const getMockOrderData = (saleNumber: string, returnData: any) => {
  const originalOrder = {
    id: saleNumber,
    orderNumber: saleNumber,
    customer: {
      name: returnData.customer_name,
      phone: "+966501234567",
      type: "individual" as const
    },
    items: [
      { id: "1", name: "جهاز كمبيوتر محمول", quantity: 1, price: 2500, total: 2500 },
      { id: "2", name: "ماوس لاسلكي", quantity: 2, price: 50, total: 100 },
      { id: "3", name: "لوحة مفاتيح", quantity: 1, price: 150, total: 150 }
    ],
    subtotal: 2750,
    taxRate: 15,
    taxAmount: 412.5,
    discount: 0,
    total: 3162.5,
    createdAt: "2024-12-28",
    status: "completed" as const
  };

  // Simulate returned items based on return type
  const returnedItems = returnData.return_type === 'full' 
    ? originalOrder.items
    : [originalOrder.items[1]]; // Just the mouse for partial return

  const orderAfterReturn = {
    ...originalOrder,
    items: originalOrder.items.map(item => {
      const returnedItem = returnedItems.find(ri => ri.id === item.id);
      if (returnedItem) {
        return {
          ...item,
          quantity: returnData.return_type === 'full' ? 0 : item.quantity - 1,
          total: returnData.return_type === 'full' ? 0 : (item.quantity - 1) * item.price
        };
      }
      return item;
    }),
    subtotal: originalOrder.subtotal - returnData.total_amount,
    total: originalOrder.total - returnData.refund_amount,
    taxAmount: (originalOrder.subtotal - returnData.total_amount) * 0.15
  };

  return { originalOrder, orderAfterReturn, returnedItems };
};

export function ReturnDetailsDialog({ isOpen, onOpenChange, returnData }: ReturnDetailsDialogProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!returnData) return null;

  const { originalOrder, orderAfterReturn, returnedItems } = getMockOrderData(returnData.sale_number, returnData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {isArabic ? "تفاصيل المرتجع" : "Return Details"} - {returnData.return_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Return Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RotateCcw className="h-5 w-5" />
                {isArabic ? "معلومات المرتجع" : "Return Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "رقم المرتجع" : "Return Number"}</p>
                  <p className="font-semibold">{returnData.return_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "تاريخ المرتجع" : "Return Date"}</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{returnData.return_date}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "نوع المرتجع" : "Return Type"}</p>
                  <Badge className={returnData.return_type === 'full' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}>
                    {isArabic ? 
                      (returnData.return_type === 'full' ? 'كامل' : 'جزئي') :
                      (returnData.return_type === 'full' ? 'Full' : 'Partial')
                    }
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "حالة المرتجع" : "Return Status"}</p>
                  <Badge className={getStatusColor(returnData.status)}>
                    {isArabic ? 
                      (returnData.status === 'completed' ? 'مكتمل' : 
                       returnData.status === 'pending' ? 'معلق' : 'مرفوض') :
                      returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)
                    }
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "السبب" : "Reason"}</p>
                  <p className="font-medium">
                    {returnData.reason === 'defective' ? (isArabic ? 'منتج معيب' : 'Defective') :
                     returnData.reason === 'wrong_item' ? (isArabic ? 'منتج خاطئ' : 'Wrong Item') :
                     returnData.reason === 'not_needed' ? (isArabic ? 'غير مطلوب' : 'Not Needed') :
                     returnData.reason === 'damaged' ? (isArabic ? 'تالف' : 'Damaged') : 
                     (isArabic ? 'أخرى' : 'Other')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ المسترد" : "Refund Amount"}</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="font-bold text-green-600">${returnData.refund_amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "حالة الاسترداد" : "Refund Status"}</p>
                  <Badge className={getRefundStatusColor(returnData.refund_status)}>
                    {isArabic ? 
                      (returnData.refund_status === 'processed' ? 'تم الاسترداد' : 
                       returnData.refund_status === 'pending' ? 'معلق' : 'ملغي') :
                      returnData.refund_status.charAt(0).toUpperCase() + returnData.refund_status.slice(1)
                    }
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{isArabic ? "العميل" : "Customer"}</p>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{returnData.customer_name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Comparison Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Before Return */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Package className="h-5 w-5" />
                  {isArabic ? "الطلب قبل المرتجع" : "Order Before Return"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{isArabic ? "رقم الطلب" : "Order Number"}</p>
                      <p className="font-medium">{originalOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{isArabic ? "التاريخ" : "Date"}</p>
                      <p className="font-medium">{originalOrder.createdAt}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{isArabic ? "العناصر" : "Items"}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{isArabic ? "المنتج" : "Product"}</TableHead>
                          <TableHead className="text-xs text-center">{isArabic ? "الكمية" : "Qty"}</TableHead>
                          <TableHead className="text-xs text-right">{isArabic ? "المجموع" : "Total"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {originalOrder.items.map((item) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span>${originalOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? "الضريبة" : "Tax"} ({originalOrder.taxRate}%)</span>
                      <span>${originalOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-blue-800">
                      <span>{isArabic ? "الإجمالي" : "Total"}</span>
                      <span>${originalOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order After Return */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Package className="h-5 w-5" />
                  {isArabic ? "الطلب بعد المرتجع" : "Order After Return"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{isArabic ? "رقم الطلب" : "Order Number"}</p>
                      <p className="font-medium">{orderAfterReturn.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{isArabic ? "تاريخ المرتجع" : "Return Date"}</p>
                      <p className="font-medium">{returnData.return_date}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{isArabic ? "العناصر المتبقية" : "Remaining Items"}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{isArabic ? "المنتج" : "Product"}</TableHead>
                          <TableHead className="text-xs text-center">{isArabic ? "الكمية" : "Qty"}</TableHead>
                          <TableHead className="text-xs text-right">{isArabic ? "المجموع" : "Total"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderAfterReturn.items.filter(item => item.quantity > 0).map((item) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        {orderAfterReturn.items.filter(item => item.quantity > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground text-xs">
                              {isArabic ? "لا توجد عناصر متبقية" : "No remaining items"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span>${orderAfterReturn.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? "الضريبة" : "Tax"} ({orderAfterReturn.taxRate}%)</span>
                      <span>${orderAfterReturn.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-green-800">
                      <span>{isArabic ? "الإجمالي" : "Total"}</span>
                      <span>${orderAfterReturn.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Returned Items Details */}
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <RotateCcw className="h-5 w-5" />
                {isArabic ? "العناصر المرتجعة" : "Returned Items"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                    <TableHead className="text-center">{isArabic ? "الكمية المرتجعة" : "Returned Qty"}</TableHead>
                    <TableHead className="text-center">{isArabic ? "سعر الوحدة" : "Unit Price"}</TableHead>
                    <TableHead className="text-right">{isArabic ? "مبلغ الاسترداد" : "Refund Amount"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        {returnData.return_type === 'full' ? item.quantity : 1}
                      </TableCell>
                      <TableCell className="text-center">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(returnData.return_type === 'full' ? item.total : item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell colSpan={3} className="text-right">
                      {isArabic ? "إجمالي المبلغ المسترد:" : "Total Refund Amount:"}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-bold text-lg">
                      ${returnData.refund_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Timeline Summary */}
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Clock className="h-5 w-5" />
                {isArabic ? "ملخص زمني" : "Timeline Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <p className="font-medium">{isArabic ? "إنشاء الطلب" : "Order Created"}</p>
                  <p className="text-muted-foreground">{originalOrder.createdAt}</p>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">
                    ${originalOrder.total.toFixed(2)}
                  </Badge>
                </div>
                
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                
                <div className="text-center">
                  <p className="font-medium">{isArabic ? "تاريخ المرتجع" : "Return Date"}</p>
                  <p className="text-muted-foreground">{returnData.return_date}</p>
                  <Badge className="mt-1 bg-red-100 text-red-800">
                    -${returnData.refund_amount.toFixed(2)}
                  </Badge>
                </div>
                
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                
                <div className="text-center">
                  <p className="font-medium">{isArabic ? "الرصيد النهائي" : "Final Balance"}</p>
                  <p className="text-muted-foreground">{returnData.return_date}</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">
                    ${orderAfterReturn.total.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}