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
import { Purchase } from "@/pages/Purchases";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase;
  onSave: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  purchase,
  onSave,
}: PurchaseDialogProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    purchaseNumber: '',
        supplier: { name: '', phone: '', email: '' },
        items: [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    orderDate: '',
    expectedDate: '',
    status: 'pending' as 'pending' | 'received' | 'partial' | 'returned',
    notes: ''
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchaseNumber: purchase.purchaseNumber,
        supplier: purchase.supplier,
        items: purchase.items,
        subtotal: purchase.subtotal,
        taxRate: purchase.taxRate,
        taxAmount: purchase.taxAmount,
        discount: purchase.discount,
        total: purchase.total,
        orderDate: purchase.orderDate,
        expectedDelivery: purchase.expectedDelivery,
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        paidAmount: purchase.paidAmount,
        notes: purchase.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        purchaseNumber: `PO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        supplier: { name: '', phone: '', email: '', contactPerson: '' },
        items: [{ id: '1', name: '', quantity: 1, unitCost: 0, total: 0 }],
        subtotal: 0,
        taxRate: 15,
        taxAmount: 0,
        discount: 0,
        total: 0,
        orderDate: today,
        expectedDelivery: nextWeek,
        status: 'pending',
        paymentStatus: 'unpaid',
        paidAmount: 0,
        notes: ''
      });
    }
  }, [purchase, open]);

  const calculateTotals = (items: any[], discount: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitCost') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    }
    
    const { subtotal, taxAmount, total } = calculateTotals(newItems, formData.discount, formData.taxRate);
    setFormData({ ...formData, items: newItems, subtotal, taxAmount, total });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitCost: 0,
      total: 0
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      const { subtotal, taxAmount, total } = calculateTotals(newItems, formData.discount, formData.taxRate);
      setFormData({ ...formData, items: newItems, subtotal, taxAmount, total });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchase ? 'تعديل أمر الشراء' : 'أمر شراء جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="purchaseNumber">رقم أمر الشراء</Label>
              <Input
                id="purchaseNumber"
                value={formData.purchaseNumber}
                onChange={(e) => setFormData({ ...formData, purchaseNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="orderDate">تاريخ الطلب</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="expectedDelivery">التسليم المتوقع</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات المورد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">اسم المورد</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplier.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      supplier: { ...formData.supplier, name: e.target.value }
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">الشخص المسؤول</Label>
                  <Input
                    id="contactPerson"
                    value={formData.supplier.contactPerson}
                    onChange={(e) => setFormData({
                      ...formData,
                      supplier: { ...formData.supplier, contactPerson: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierPhone">الهاتف</Label>
                  <Input
                    id="supplierPhone"
                    value={formData.supplier.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      supplier: { ...formData.supplier, phone: e.target.value }
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplierEmail">البريد الإلكتروني</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={formData.supplier.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      supplier: { ...formData.supplier, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>العناصر</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة عنصر
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>اسم المنتج</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>سعر الوحدة</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>المجموع</Label>
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

          {/* Status and Payment */}
          <Card>
            <CardHeader>
              <CardTitle>الحالة والدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status">حالة الطلب</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="ordered">مطلوب</SelectItem>
                      <SelectItem value="received">مستلم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentStatus">حالة الدفع</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">غير مدفوع</SelectItem>
                      <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                      <SelectItem value="paid">مدفوع بالكامل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount">الخصم</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const { subtotal, taxAmount, total } = calculateTotals(formData.items, discount, formData.taxRate);
                      setFormData({ ...formData, discount, taxAmount, total });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="paidAmount">المبلغ المدفوع</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{formData.subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الخصم:</span>
                    <span>-{formData.discount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة ({formData.taxRate}%):</span>
                    <span>{formData.taxAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>المجموع الكلي:</span>
                    <span>{formData.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
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
              {purchase ? 'تحديث الطلب' : 'حفظ الطلب'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}