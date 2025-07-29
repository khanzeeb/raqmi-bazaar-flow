import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, FileText, Calendar, CreditCard } from "lucide-react";
import { Payment, PaymentAllocation } from "./PaymentDialog";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  payments: Payment[];
  isArabic?: boolean;
  onViewPayment: (payment: Payment) => void;
  onDownloadStatement: (customerId: string, fromDate: string, toDate: string) => void;
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  payments,
  isArabic = false,
  onViewPayment,
  onDownloadStatement
}: PaymentHistoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = (!fromDate || payment.paymentDate >= fromDate) &&
                        (!toDate || payment.paymentDate <= toDate);
    
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'cancelled': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: { ar: 'مكتمل', en: 'Completed' },
      pending: { ar: 'معلق', en: 'Pending' },
      failed: { ar: 'فاشل', en: 'Failed' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' }
    };
    return statusMap[status as keyof typeof statusMap]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' },
      check: { ar: 'شيك', en: 'Check' }
    };
    return methodMap[method as keyof typeof methodMap]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'bank_transfer': return '🏦';
      case 'credit': return '💳';
      case 'check': return '📄';
      default: return '💰';
    }
  };

  const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = filteredPayments.filter(p => p.status === 'completed');
  const totalCompleted = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isArabic ? "سجل المدفوعات" : "Payment History"} - {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي المدفوعات" : "Total Payments"}</p>
                    <p className="text-2xl font-bold">{filteredPayments.length}</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ الكلي" : "Total Amount"}</p>
                    <p className="text-2xl font-bold">{totalPayments.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "المدفوعات المكتملة" : "Completed Payments"}</p>
                    <p className="text-2xl font-bold">{totalCompleted.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={isArabic ? "البحث برقم الدفعة أو المرجع..." : "Search by payment number or reference..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    placeholder={isArabic ? "من تاريخ" : "From date"}
                  />
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    placeholder={isArabic ? "إلى تاريخ" : "To date"}
                  />
                  <Button
                    variant="outline"
                    onClick={() => onDownloadStatement(customerId, fromDate, toDate)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {isArabic ? "كشف" : "Statement"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment List */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "المدفوعات" : "Payments"}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {filteredPayments.map((payment) => (
                    <Card key={payment.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                          onClick={() => onViewPayment(payment)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getMethodIcon(payment.paymentMethod)}</div>
                            <div>
                              <h4 className="font-semibold">{payment.paymentNumber}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.paymentDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{payment.amount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusText(payment.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {isArabic ? "الطريقة:" : "Method:"} {getPaymentMethodText(payment.paymentMethod)}
                            </span>
                            {payment.reference && (
                              <span className="text-muted-foreground">
                                {isArabic ? "المرجع:" : "Ref:"} {payment.reference}
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {isArabic ? `${payment.allocations?.length || 0} طلب` : `${payment.allocations?.length || 0} orders`}
                          </span>
                        </div>

                        {/* Order Allocations */}
                        {payment.allocations && payment.allocations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">{isArabic ? "توزيع على الطلبات:" : "Allocated to orders:"}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {payment.allocations.slice(0, 4).map((allocation) => (
                                <div key={allocation.orderId} className="flex justify-between text-xs bg-muted/50 rounded px-2 py-1">
                                  <span>{allocation.orderNumber}</span>
                                  <span>{allocation.allocatedAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                                </div>
                              ))}
                              {payment.allocations.length > 4 && (
                                <div className="text-xs text-muted-foreground">
                                  {isArabic 
                                    ? `و ${payment.allocations.length - 4} طلب آخر...`
                                    : `and ${payment.allocations.length - 4} more...`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {payment.notes && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-muted-foreground">{payment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredPayments.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {isArabic ? "لا توجد مدفوعات مطابقة للبحث" : "No payments match your search"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? "إغلاق" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}