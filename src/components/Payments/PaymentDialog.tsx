import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit' | 'check';
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  notes?: string;
  relatedOrderIds: string[];
  allocations: PaymentAllocation[];
  createdAt: string;
}

export interface PaymentAllocation {
  orderId: string;
  orderNumber: string;
  allocatedAmount: number;
  orderTotal: number;
  previouslyPaid: number;
  remainingAfterPayment: number;
}

export interface CustomerCredit {
  customerId: string;
  customerName: string;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  overdueAmount: number;
  totalOutstanding: number;
  lastPaymentDate?: string;
  creditStatus: 'good' | 'warning' | 'blocked';
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
  customerId?: string;
  customerName?: string;
  onSave: (payment: Partial<Payment>) => void;
  isArabic?: boolean;
  isViewMode?: boolean;
  customerCredit?: CustomerCredit;
  outstandingOrders?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    dueDate: string;
    status: string;
  }>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  customerId,
  customerName,
  onSave,
  isArabic = false,
  isViewMode = false,
  customerCredit,
  outstandingOrders = []
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Payment>>({
    paymentNumber: '',
    customerId: '',
    customerName: '',
    amount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    reference: '',
    notes: '',
    relatedOrderIds: [],
    allocations: [],
  });

  const [autoAllocate, setAutoAllocate] = useState(true);
  const [manualAllocations, setManualAllocations] = useState<PaymentAllocation[]>([]);

  useEffect(() => {
    if (payment) {
      setFormData(payment);
      setManualAllocations(payment.allocations || []);
    } else {
      const paymentNum = `PAY-${Date.now().toString().slice(-6)}`;
      setFormData({
        paymentNumber: paymentNum,
        customerId: customerId || '',
        customerName: customerName || '',
        amount: 0,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        reference: '',
        notes: '',
        relatedOrderIds: [],
        allocations: [],
      });
      setManualAllocations([]);
    }
  }, [payment, customerId, customerName, open]);

  // Auto-allocate payment to outstanding orders (oldest first)
  const calculateAutoAllocation = (amount: number): PaymentAllocation[] => {
    const allocations: PaymentAllocation[] = [];
    let remainingAmount = amount;

    // Sort orders by due date (oldest first)
    const sortedOrders = [...outstandingOrders].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    for (const order of sortedOrders) {
      if (remainingAmount <= 0) break;

      const allocationAmount = Math.min(remainingAmount, order.remainingAmount);
      if (allocationAmount > 0) {
        allocations.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          allocatedAmount: allocationAmount,
          orderTotal: order.total,
          previouslyPaid: order.paidAmount,
          remainingAfterPayment: order.remainingAmount - allocationAmount
        });
        remainingAmount -= allocationAmount;
      }
    }

    return allocations;
  };

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));

    if (autoAllocate && outstandingOrders.length > 0) {
      const allocations = calculateAutoAllocation(amount);
      setManualAllocations(allocations);
      setFormData(prev => ({
        ...prev,
        allocations,
        relatedOrderIds: allocations.map(a => a.orderId)
      }));
    }
  };

  const handleManualAllocationChange = (index: number, field: keyof PaymentAllocation, value: number) => {
    const updated = [...manualAllocations];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'allocatedAmount') {
      updated[index].remainingAfterPayment = updated[index].orderTotal - updated[index].previouslyPaid - value;
    }
    
    setManualAllocations(updated);
    setFormData(prev => ({
      ...prev,
      allocations: updated,
      relatedOrderIds: updated.filter(a => a.allocatedAmount > 0).map(a => a.orderId)
    }));
  };

  const getTotalAllocated = () => {
    return manualAllocations.reduce((sum, allocation) => sum + allocation.allocatedAmount, 0);
  };

  const getUnallocatedAmount = () => {
    return (formData.amount || 0) - getTotalAllocated();
  };

  const validatePayment = (): boolean => {
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يجب إدخال مبلغ صحيح" : "Please enter a valid amount",
        variant: "destructive"
      });
      return false;
    }

    const totalAllocated = getTotalAllocated();
    if (totalAllocated > formData.amount) {
      toast({
        title: isArabic ? "خطأ في التوزيع" : "Allocation Error",
        description: isArabic ? "مجموع التوزيع يتجاوز مبلغ الدفعة" : "Total allocation exceeds payment amount",
        variant: "destructive"
      });
      return false;
    }

    if (customerCredit && customerCredit.creditStatus === 'blocked') {
      toast({
        title: isArabic ? "عميل محظور" : "Customer Blocked",
        description: isArabic ? "لا يمكن استقبال مدفوعات من عميل محظور" : "Cannot accept payments from blocked customer",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewMode) {
      onOpenChange(false);
      return;
    }
    
    if (!validatePayment()) return;

    const paymentData = {
      ...formData,
      allocations: manualAllocations.filter(a => a.allocatedAmount > 0),
      relatedOrderIds: manualAllocations.filter(a => a.allocatedAmount > 0).map(a => a.orderId)
    };

    onSave(paymentData);
    onOpenChange(false);
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

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode 
              ? (isArabic ? "عرض الدفعة" : "View Payment")
              : payment 
                ? (isArabic ? "تعديل الدفعة" : "Edit Payment")
                : (isArabic ? "دفعة جديدة" : "New Payment")
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Credit Info */}
          {customerCredit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isArabic ? "معلومات الائتمان" : "Credit Information"}
                  <Badge className={getCreditStatusColor(customerCredit.creditStatus)}>
                    {isArabic 
                      ? (customerCredit.creditStatus === 'good' ? 'جيد' : 
                         customerCredit.creditStatus === 'warning' ? 'تحذير' : 'محظور')
                      : customerCredit.creditStatus
                    }
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "حد الائتمان" : "Credit Limit"}</p>
                    <p className="font-semibold">{customerCredit.creditLimit.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "الائتمان المتاح" : "Available Credit"}</p>
                    <p className="font-semibold text-green-600">{customerCredit.availableCredit.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ المستحق" : "Outstanding Amount"}</p>
                    <p className="font-semibold text-red-600">{customerCredit.totalOutstanding.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ المتأخر" : "Overdue Amount"}</p>
                    <p className="font-semibold text-orange-600">{customerCredit.overdueAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "معلومات الدفعة" : "Payment Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentNumber">{isArabic ? "رقم الدفعة" : "Payment Number"}</Label>
                  <Input
                    id="paymentNumber"
                    value={formData.paymentNumber}
                    onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                    required
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentDate">{isArabic ? "تاريخ الدفعة" : "Payment Date"}</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    required
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">{isArabic ? "مبلغ الدفعة" : "Payment Amount"}</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                    required
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">{isArabic ? "طريقة الدفع" : "Payment Method"}</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{getPaymentMethodText('cash')}</SelectItem>
                      <SelectItem value="bank_transfer">{getPaymentMethodText('bank_transfer')}</SelectItem>
                      <SelectItem value="credit">{getPaymentMethodText('credit')}</SelectItem>
                      <SelectItem value="check">{getPaymentMethodText('check')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="reference">{isArabic ? "المرجع" : "Reference"}</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder={isArabic ? "رقم المرجع أو الشيك" : "Reference or check number"}
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label htmlFor="notes">{isArabic ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Allocation */}
          {outstandingOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {isArabic ? "توزيع الدفعة" : "Payment Allocation"}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoAllocate"
                      checked={autoAllocate}
                      onChange={(e) => {
                        setAutoAllocate(e.target.checked);
                        if (e.target.checked && formData.amount) {
                          const allocations = calculateAutoAllocation(formData.amount);
                          setManualAllocations(allocations);
                        }
                      }}
                      className="rounded"
                      disabled={isViewMode}
                    />
                    <Label htmlFor="autoAllocate" className="text-sm">
                      {isArabic ? "توزيع تلقائي" : "Auto Allocate"}
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {outstandingOrders.map((order, index) => {
                    const allocation = manualAllocations.find(a => a.orderId === order.id) || {
                      orderId: order.id,
                      orderNumber: order.orderNumber,
                      allocatedAmount: 0,
                      orderTotal: order.total,
                      previouslyPaid: order.paidAmount,
                      remainingAfterPayment: order.remainingAmount
                    };

                    return (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.dueDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">{isArabic ? "المجموع" : "Total"}</p>
                            <p className="font-medium">{order.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">{isArabic ? "المدفوع سابقاً" : "Previously Paid"}</p>
                            <p className="font-medium">{order.paidAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">{isArabic ? "المتبقي" : "Remaining"}</p>
                            <p className="font-medium text-red-600">{order.remainingAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                          </div>
                          <div className="col-span-3">
                            <Label className="text-sm">{isArabic ? "مبلغ الدفع" : "Allocated Amount"}</Label>
                            <Input
                              type="number"
                              min="0"
                              max={order.remainingAmount}
                              step="0.01"
                              value={allocation.allocatedAmount}
                              onChange={(e) => {
                                const amount = parseFloat(e.target.value) || 0;
                                const existingIndex = manualAllocations.findIndex(a => a.orderId === order.id);
                                if (existingIndex >= 0) {
                                  handleManualAllocationChange(existingIndex, 'allocatedAmount', amount);
                                } else {
                                  const newAllocation = {
                                    ...allocation,
                                    allocatedAmount: amount,
                                    remainingAfterPayment: order.remainingAmount - amount
                                  };
                                  setManualAllocations([...manualAllocations, newAllocation]);
                                }
                              }}
                              disabled={autoAllocate || isViewMode}
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            {allocation.allocatedAmount > 0 && allocation.remainingAfterPayment === 0 ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : allocation.allocatedAmount > 0 ? (
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Separator />
                  
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground">{isArabic ? "إجمالي الدفعة:" : "Payment Total:"} </span>
                      <span className="font-medium">{(formData.amount || 0).toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? "المُوزع:" : "Allocated:"} </span>
                      <span className="font-medium">{getTotalAllocated().toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? "غير موزع:" : "Unallocated:"} </span>
                      <span className={`font-medium ${getUnallocatedAmount() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {getUnallocatedAmount().toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit">
                {payment 
                  ? (isArabic ? "تحديث الدفعة" : "Update Payment")
                  : (isArabic ? "حفظ الدفعة" : "Save Payment")
                }
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}