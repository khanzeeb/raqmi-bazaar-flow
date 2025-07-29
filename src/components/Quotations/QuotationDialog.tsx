import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Quotation } from "@/pages/Quotations";

interface QuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: Quotation;
  onSave: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => void;
}

export function QuotationDialog({
  open,
  onOpenChange,
  quotation,
  onSave,
}: QuotationDialogProps) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const [formData, setFormData] = useState({
    quotationNumber: '',
      customer: { name: '', phone: '', email: '', type: 'individual' as 'individual' | 'business' },
    items: [{ id: '1', name: '', quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    taxRate: 15,
    taxAmount: 0,
    discount: 0,
    total: 0,
    validityDays: 30,
    expiryDate: '',
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'expired',
    notes: ''
  });

  useEffect(() => {
    if (quotation) {
      setFormData({
        quotationNumber: quotation.quotationNumber,
        customer: {
          name: quotation.customer.name,
          phone: quotation.customer.phone,
          email: quotation.customer.email || '',
          type: quotation.customer.type,
        },
        items: quotation.items,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        discount: quotation.discount,
        total: quotation.total,
        validityDays: quotation.validityDays,
        expiryDate: quotation.expiryDate,
        status: quotation.status,
        notes: quotation.notes || ''
      });
    } else {
      const today = new Date();
      const expiryDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      setFormData({
        quotationNumber: `QT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customer: { name: '', phone: '', email: '', type: 'individual' },
        items: [{ id: '1', name: '', quantity: 1, price: 0, total: 0 }],
        subtotal: 0,
        taxRate: 15,
        taxAmount: 0,
        discount: 0,
        total: 0,
        validityDays: 30,
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'draft',
        notes: ''
      });
    }
  }, [quotation, open]);

  const calculateTotals = (items: any[], discount: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    const { subtotal, taxAmount, total } = calculateTotals(newItems, formData.discount, formData.taxRate);
    setFormData({ ...formData, items: newItems, subtotal, taxAmount, total });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
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
    
    const currentDate = new Date().toISOString();
    const historyEntry = {
      id: Date.now().toString(),
      action: quotation ? 'sent' : 'created',
      timestamp: currentDate
    } as const;
    
    const quotationWithHistory = {
      ...formData,
      history: quotation ? [...quotation.history] : [historyEntry]
    };
    
    onSave(quotationWithHistory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quotation 
              ? (isArabic ? 'تعديل عرض السعر' : 'Edit Quotation') 
              : (isArabic ? 'عرض سعر جديد' : 'New Quotation')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quotationNumber">
                {isArabic ? "رقم العرض" : "Quotation Number"}
              </Label>
              <Input
                id="quotationNumber"
                value={formData.quotationNumber}
                onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="validityDays">
                {isArabic ? "مدة الصلاحية (بالأيام)" : "Validity (Days)"}
              </Label>
              <Input
                id="validityDays"
                type="number"
                value={formData.validityDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 30;
                  const today = new Date();
                  const expiryDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
                  setFormData({ 
                    ...formData, 
                    validityDays: days,
                    expiryDate: expiryDate.toISOString().split('T')[0]
                  });
                }}
                required
              />
            </div>
          </div>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "معلومات العميل" : "Customer Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={formData.customer.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, name: e.target.value }
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerType">نوع العميل</Label>
                  <Select
                    value={formData.customer.type}
                    onValueChange={(value: 'individual' | 'business') =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, type: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فردي</SelectItem>
                      <SelectItem value="business">شركة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">الهاتف</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customer.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, phone: e.target.value }
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customer.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer: { ...formData.customer, email: e.target.value }
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
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
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

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>التسعير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="taxRate">معدل الضريبة (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      const { subtotal, taxAmount, total } = calculateTotals(formData.items, formData.discount, taxRate);
                      setFormData({ ...formData, taxRate, taxAmount, total });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="status">حالة العرض</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sent">مرسل</SelectItem>
                      <SelectItem value="accepted">مقبول</SelectItem>
                      <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                    </SelectContent>
                  </Select>
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
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit">
              {quotation 
                ? (isArabic ? 'تحديث العرض' : 'Update Quotation')
                : (isArabic ? 'حفظ العرض' : 'Save Quotation')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}