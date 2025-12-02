import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Purchase } from "@/types/purchase.types";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase;
  onSave: (purchase: Omit<Purchase, 'id'>) => void;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  purchase,
  onSave,
}: PurchaseDialogProps) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [formData, setFormData] = useState({
    purchaseNumber: '',
    supplier: { 
      name: '', 
      phone: '', 
      email: '' 
    },
    items: [] as { id: string; name: string; quantity: number; unitPrice: number; total: number }[],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    status: 'pending' as 'pending' | 'received' | 'partial' | 'returned',
    paymentMethod: 'full' as 'full' | 'partial' | 'credit',
    paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    paidAmount: 0,
    remainingAmount: 0,
    paymentHistory: [] as { id: string; amount: number; date: string; method: 'cash' | 'bank_transfer' | 'check'; reference?: string }[],
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    receivedDate: '',
    notes: ''
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchaseNumber: purchase.purchaseNumber,
        supplier: {
          name: purchase.supplier.name,
          phone: purchase.supplier.phone,
          email: purchase.supplier.email || '',
        },
        items: purchase.items,
        subtotal: purchase.subtotal,
        taxAmount: purchase.taxAmount,
        total: purchase.total,
        status: purchase.status,
        paymentMethod: purchase.paymentMethod,
        paymentStatus: purchase.paymentStatus,
        paidAmount: purchase.paidAmount,
        remainingAmount: purchase.remainingAmount,
        paymentHistory: purchase.paymentHistory,
        orderDate: purchase.orderDate,
        expectedDate: purchase.expectedDate || '',
        receivedDate: purchase.receivedDate || '',
        notes: purchase.notes || ''
      });
    } else {
      setFormData({
        purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
        supplier: { 
          name: '', 
          phone: '', 
          email: '' 
        },
        items: [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        status: 'pending' as 'pending' | 'received' | 'partial' | 'returned',
        paymentMethod: 'full' as 'full' | 'partial' | 'credit',
        paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
        paidAmount: 0,
        remainingAmount: 0,
        paymentHistory: [],
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        receivedDate: '',
        notes: ''
      });
    }
  }, [purchase, open]);

  const calculateTotals = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.15; // 15% tax
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateCalculations = () => {
    const { subtotal, taxAmount, total } = calculateTotals(formData.items);
    setFormData(prev => ({ ...prev, subtotal, taxAmount, total }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    setTimeout(updateCalculations, 0);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      setTimeout(updateCalculations, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    const { subtotal, taxAmount, total } = calculateTotals(finalData.items);
    finalData.subtotal = subtotal;
    finalData.taxAmount = taxAmount;
    finalData.total = total;
    onSave(finalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchase ? (isArabic ? 'تعديل أمر الشراء' : 'Edit Purchase Order') : (isArabic ? 'أمر شراء جديد' : 'New Purchase Order')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchaseNumber">{isArabic ? 'رقم أمر الشراء' : 'Purchase Number'}</Label>
                <Input
                  id="purchaseNumber"
                  value={formData.purchaseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="orderDate">{isArabic ? 'تاريخ الطلب' : 'Order Date'}</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expectedDate">{isArabic ? 'التسليم المتوقع' : 'Expected Delivery'}</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'معلومات المورد' : 'Supplier Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">{isArabic ? 'اسم المورد' : 'Supplier Name'}</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplier.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      supplier: { ...prev.supplier, name: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplierPhone">{isArabic ? 'الهاتف' : 'Phone'}</Label>
                  <Input
                    id="supplierPhone"
                    value={formData.supplier.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      supplier: { ...prev.supplier, phone: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="supplierEmail">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={formData.supplier.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    supplier: { ...prev.supplier, email: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{isArabic ? 'العناصر' : 'Items'}</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {isArabic ? 'إضافة عنصر' : 'Add Item'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>{isArabic ? 'اسم المنتج' : 'Product Name'}</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>{isArabic ? 'الكمية' : 'Quantity'}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>{isArabic ? 'سعر الوحدة' : 'Unit Price'}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>{isArabic ? 'المجموع' : 'Total'}</Label>
                      <Input value={item.total.toFixed(2)} readOnly />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الحالة والدفع' : 'Status & Payment'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">{isArabic ? 'حالة الطلب' : 'Order Status'}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isArabic ? 'معلق' : 'Pending'}</SelectItem>
                      <SelectItem value="received">{isArabic ? 'مستلم' : 'Received'}</SelectItem>
                      <SelectItem value="partial">{isArabic ? 'مستلم جزئياً' : 'Partial'}</SelectItem>
                      <SelectItem value="returned">{isArabic ? 'مُرجع' : 'Returned'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">{isArabic ? 'دفع كامل' : 'Full Payment'}</SelectItem>
                      <SelectItem value="partial">{isArabic ? 'دفع جزئي' : 'Partial Payment'}</SelectItem>
                      <SelectItem value="credit">{isArabic ? 'آجل' : 'Credit'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="receivedDate">{isArabic ? 'تاريخ الاستلام' : 'Received Date'}</Label>
                  <Input
                    id="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Payment Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paidAmount">{isArabic ? 'المبلغ المدفوع' : 'Paid Amount'}</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({ 
                        ...prev, 
                        paidAmount: amount,
                        remainingAmount: prev.total - amount,
                        paymentStatus: amount === 0 ? 'unpaid' : amount >= prev.total ? 'paid' : 'partial'
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'المبلغ المتبقي' : 'Remaining Amount'}</Label>
                  <Input 
                    value={formData.remainingAmount.toFixed(2)} 
                    readOnly 
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span>{formData.subtotal.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isArabic ? 'الضريبة (15%):' : 'Tax (15%):'}</span>
                    <span>{formData.taxAmount.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{isArabic ? 'المجموع الكلي:' : 'Total:'}</span>
                    <span>{formData.total.toFixed(2)} SAR</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">{isArabic ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              {purchase ? (isArabic ? 'تحديث الطلب' : 'Update Order') : (isArabic ? 'حفظ الطلب' : 'Save Order')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}