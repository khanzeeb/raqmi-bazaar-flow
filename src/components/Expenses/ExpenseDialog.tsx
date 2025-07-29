import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Expense } from "@/pages/Expenses";
import { Upload, X, FileText } from "lucide-react";

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
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
      setUploadedFile(null);
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
      setUploadedFile(null);
    }
  }, [expense, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      receiptAttached: uploadedFile !== null || formData.receiptAttached
    };
    onSave(finalData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFormData({ ...formData, receiptAttached: true });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormData({ ...formData, receiptAttached: false });
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
      rent: { ar: 'الإيجار', en: 'Rent' },
      utilities: { ar: 'المرافق', en: 'Utilities' },
      transport: { ar: 'النقل', en: 'Transport' },
      office: { ar: 'لوازم المكتب', en: 'Office Supplies' },
      marketing: { ar: 'التسويق', en: 'Marketing' },
      maintenance: { ar: 'الصيانة', en: 'Maintenance' },
      other: { ar: 'أخرى', en: 'Other' }
    };
    return categoryMap[category as keyof typeof categoryMap]?.[isArabic ? 'ar' : 'en'] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {expense ? (isArabic ? 'تعديل المصروف' : 'Edit Expense') : (isArabic ? 'مصروف جديد' : 'New Expense')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expenseNumber">{isArabic ? "رقم المصروف" : "Expense Number"}</Label>
              <Input
                id="expenseNumber"
                value={formData.expenseNumber}
                onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">{isArabic ? "التاريخ" : "Date"}</Label>
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
            <Label htmlFor="description">{isArabic ? "وصف المصروف" : "Expense Description"}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{isArabic ? "الفئة" : "Category"}</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
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
              <Label htmlFor="amount">{isArabic ? "المبلغ" : "Amount"}</Label>
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
              <Label htmlFor="paymentMethod">{isArabic ? "طريقة الدفع" : "Payment Method"}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{isArabic ? "نقدي" : "Cash"}</SelectItem>
                      <SelectItem value="bank_transfer">{isArabic ? "تحويل بنكي" : "Bank Transfer"}</SelectItem>
                      <SelectItem value="card">{isArabic ? "بطاقة" : "Card"}</SelectItem>
                    </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vendor">{isArabic ? "المورد" : "Vendor"}</Label>
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
              <Label htmlFor="status">{isArabic ? "الحالة" : "Status"}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{isArabic ? "معلق" : "Pending"}</SelectItem>
                  <SelectItem value="approved">{isArabic ? "موافق عليه" : "Approved"}</SelectItem>
                  <SelectItem value="paid">{isArabic ? "مدفوع" : "Paid"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="receiptAttached"
                checked={formData.receiptAttached || uploadedFile !== null}
                onChange={(e) => setFormData({ ...formData, receiptAttached: e.target.checked })}
                className="rounded border border-input"
                disabled={uploadedFile !== null}
              />
              <Label htmlFor="receiptAttached">{isArabic ? "إيصال مرفق" : "Receipt Attached"}</Label>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label>{isArabic ? "إرفاق إيصال" : "Attach Receipt"}</Label>
            
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <Label 
                      htmlFor="file-upload" 
                      className="cursor-pointer text-primary hover:text-primary/80 font-medium"
                    >
                      {isArabic ? "انقر لاختيار ملف" : "Click to select file"}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isArabic ? "أو اسحب الملف هنا" : "or drag and drop here"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? "PNG، JPG، PDF حتى 10MB" : "PNG, JPG, PDF up to 10MB"}
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">{isArabic ? "ملاحظات" : "Notes"}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit">
              {expense ? (isArabic ? 'تحديث المصروف' : 'Update Expense') : (isArabic ? 'حفظ المصروف' : 'Save Expense')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}