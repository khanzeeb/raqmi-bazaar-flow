import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Expense } from "@/pages/Expenses";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSave,
}: ExpenseDialogProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    expenseNumber: '',
    category: 'office' as 'rent' | 'utilities' | 'transport' | 'office' | 'marketing' | 'maintenance' | 'other',
    description: '',
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'card',
    vendor: '',
    date: '',
    receiptAttached: false,
    status: 'pending' as 'pending' | 'approved' | 'paid',
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        expenseNumber: expense.expenseNumber,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        vendor: expense.vendor || '',
        date: expense.date,
        receiptAttached: expense.receiptAttached,
        status: expense.status,
        notes: expense.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        expenseNumber: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        category: 'office',
        description: '',
        amount: 0,
        paymentMethod: 'cash',
        vendor: '',
        date: today,
        receiptAttached: false,
        status: 'pending',
        notes: ''
      });
    }
  }, [expense, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = [
    'rent',
    'utilities', 
    'transport',
    'office',
    'marketing',
    'maintenance',
    'other'
  ];

  const getCategoryText = (category: string) => {
    const categoryMap = {
      rent: 'الإيجار',
      utilities: 'المرافق',
      transport: 'النقل',
      office: 'لوازم المكتب',
      marketing: 'التسويق',
      maintenance: 'الصيانة',
      other: 'أخرى'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'تعديل المصروف' : 'مصروف جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expenseNumber">رقم المصروف</Label>
              <Input
                id="expenseNumber"
                value={formData.expenseNumber}
                onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">وصف المصروف</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryText(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="card">بطاقة</SelectItem>
                    </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vendor">المورد</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="receiptAttached"
                checked={formData.receiptAttached}
                onChange={(e) => setFormData({ ...formData, receiptAttached: e.target.checked })}
                className="rounded border border-input"
              />
              <Label htmlFor="receiptAttached">إيصال مرفق</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {expense ? 'تحديث المصروف' : 'حفظ المصروف'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}