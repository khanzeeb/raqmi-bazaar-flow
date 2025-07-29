import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { CustomerCredit } from "./PaymentDialog";

interface CustomerCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerCredit?: CustomerCredit;
  customerId: string;
  customerName: string;
  onSave: (creditData: Partial<CustomerCredit>) => void;
  isArabic?: boolean;
}

export function CustomerCreditDialog({
  open,
  onOpenChange,
  customerCredit,
  customerId,
  customerName,
  onSave,
  isArabic = false
}: CustomerCreditDialogProps) {
  const [formData, setFormData] = useState<Partial<CustomerCredit>>({
    customerId,
    customerName,
    creditLimit: 0,
    availableCredit: 0,
    usedCredit: 0,
    overdueAmount: 0,
    totalOutstanding: 0,
    creditStatus: 'good'
  });

  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    if (customerCredit) {
      setFormData(customerCredit);
    } else {
      setFormData({
        customerId,
        customerName,
        creditLimit: 0,
        availableCredit: 0,
        usedCredit: 0,
        overdueAmount: 0,
        totalOutstanding: 0,
        creditStatus: 'good'
      });
    }
    setAdjustmentAmount(0);
    setAdjustmentReason('');
  }, [customerCredit, customerId, customerName, open]);

  const calculateCreditMetrics = (creditLimit: number, usedCredit: number, overdueAmount: number) => {
    const availableCredit = Math.max(0, creditLimit - usedCredit);
    const utilizationRate = creditLimit > 0 ? (usedCredit / creditLimit) * 100 : 0;
    
    let creditStatus: 'good' | 'warning' | 'blocked' = 'good';
    if (overdueAmount > 0 || utilizationRate > 90) {
      creditStatus = 'blocked';
    } else if (utilizationRate > 75) {
      creditStatus = 'warning';
    }

    return { availableCredit, utilizationRate, creditStatus };
  };

  const handleCreditLimitChange = (newLimit: number) => {
    const { availableCredit, utilizationRate, creditStatus } = calculateCreditMetrics(
      newLimit, 
      formData.usedCredit || 0, 
      formData.overdueAmount || 0
    );

    setFormData(prev => ({
      ...prev,
      creditLimit: newLimit,
      availableCredit,
      creditStatus
    }));
  };

  const applyCreditAdjustment = () => {
    if (adjustmentAmount <= 0) return;

    const currentUsed = formData.usedCredit || 0;
    const newUsedCredit = adjustmentType === 'increase' 
      ? currentUsed + adjustmentAmount 
      : Math.max(0, currentUsed - adjustmentAmount);

    const { availableCredit, creditStatus } = calculateCreditMetrics(
      formData.creditLimit || 0,
      newUsedCredit,
      formData.overdueAmount || 0
    );

    setFormData(prev => ({
      ...prev,
      usedCredit: newUsedCredit,
      availableCredit,
      creditStatus,
      totalOutstanding: newUsedCredit + (prev.overdueAmount || 0)
    }));

    setAdjustmentAmount(0);
    setAdjustmentReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getCreditStatusText = (status: string) => {
    const statusMap = {
      good: { ar: 'جيد', en: 'Good' },
      warning: { ar: 'تحذير', en: 'Warning' },
      blocked: { ar: 'محظور', en: 'Blocked' }
    };
    return statusMap[status as keyof typeof statusMap]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const utilizationRate = formData.creditLimit && formData.creditLimit > 0 
    ? ((formData.usedCredit || 0) / formData.creditLimit) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {isArabic ? "إدارة ائتمان العميل" : "Customer Credit Management"} - {customerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credit Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {isArabic ? "نظرة عامة على الائتمان" : "Credit Overview"}
                <Badge className={getCreditStatusColor(formData.creditStatus || 'good')}>
                  {getCreditStatusText(formData.creditStatus || 'good')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(formData.creditLimit || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "حد الائتمان" : "Credit Limit"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(formData.availableCredit || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "الائتمان المتاح" : "Available Credit"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {(formData.usedCredit || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "الائتمان المستخدم" : "Used Credit"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {(formData.overdueAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ المتأخر" : "Overdue Amount"}</p>
                </div>
              </div>

              {/* Credit Utilization */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? "نسبة الاستخدام" : "Credit Utilization"}</span>
                  <span>{utilizationRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={utilizationRate} 
                  className={`h-2 ${
                    utilizationRate > 90 ? 'text-red-600' : 
                    utilizationRate > 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {formData.creditStatus === 'blocked' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    {isArabic 
                      ? "تم حظر الائتمان بسبب تجاوز الحد المسموح أو وجود مبالغ متأخرة"
                      : "Credit blocked due to limit exceeded or overdue amounts"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Limit Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إعدادات حد الائتمان" : "Credit Limit Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="creditLimit">{isArabic ? "حد الائتمان" : "Credit Limit"}</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.creditLimit}
                  onChange={(e) => handleCreditLimitChange(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="overdueAmount">{isArabic ? "المبلغ المتأخر" : "Overdue Amount"}</Label>
                <Input
                  id="overdueAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.overdueAmount}
                  onChange={(e) => {
                    const overdueAmount = parseFloat(e.target.value) || 0;
                    const { creditStatus } = calculateCreditMetrics(
                      formData.creditLimit || 0,
                      formData.usedCredit || 0,
                      overdueAmount
                    );
                    setFormData(prev => ({
                      ...prev,
                      overdueAmount,
                      creditStatus,
                      totalOutstanding: (prev.usedCredit || 0) + overdueAmount
                    }));
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Credit Adjustment */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "تعديل الائتمان" : "Credit Adjustment"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adjustmentType">{isArabic ? "نوع التعديل" : "Adjustment Type"}</Label>
                  <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-red-600" />
                          {isArabic ? "زيادة الدين" : "Increase Debt"}
                        </div>
                      </SelectItem>
                      <SelectItem value="decrease">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          {isArabic ? "تقليل الدين" : "Decrease Debt"}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustmentAmount">{isArabic ? "مبلغ التعديل" : "Adjustment Amount"}</Label>
                  <Input
                    id="adjustmentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="adjustmentReason">{isArabic ? "سبب التعديل" : "Adjustment Reason"}</Label>
                <Textarea
                  id="adjustmentReason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder={isArabic ? "أدخل سبب التعديل" : "Enter adjustment reason"}
                  rows={2}
                />
              </div>

              <Button
                type="button"
                onClick={applyCreditAdjustment}
                disabled={adjustmentAmount <= 0 || !adjustmentReason.trim()}
                className="w-full"
              >
                {isArabic ? "تطبيق التعديل" : "Apply Adjustment"}
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit">
              {isArabic ? "حفظ إعدادات الائتمان" : "Save Credit Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}