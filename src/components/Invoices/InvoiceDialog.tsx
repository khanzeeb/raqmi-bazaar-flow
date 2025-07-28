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
import { Invoice } from "@/pages/Invoices";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSave: (invoice: Omit<Invoice, 'id'>) => void;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSave,
}: InvoiceDialogProps) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: { 
      name: '', 
      phone: '', 
      email: '', 
      address: '', 
      taxId: '',
      type: 'individual' as 'individual' | 'business' 
    },
    items: [] as { id: string; name: string; quantity: number; unitPrice: number; total: number }[],
    subtotal: 0,
    taxAmount: 0,
    taxRate: 15,
    discount: 0,
    total: 0,
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    paymentTerms: '30',
    currency: 'SAR',
    language: 'ar' as 'ar' | 'en' | 'both',
    qrCode: '',
    notes: '',
    customFields: {
      poNumber: '',
      deliveryTerms: ''
    }
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        customer: {
          name: invoice.customer.name,
          phone: invoice.customer.phone,
          email: invoice.customer.email || '',
          address: invoice.customer.address || '',
          taxId: invoice.customer.taxId || '',
          type: invoice.customer.type,
        },
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        taxRate: invoice.taxRate,
        discount: invoice.discount,
        total: invoice.total,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paymentTerms: invoice.paymentTerms,
        currency: invoice.currency,
        language: invoice.language,
        qrCode: invoice.qrCode || '',
        notes: invoice.notes || '',
        customFields: {
          poNumber: invoice.customFields?.poNumber || '',
          deliveryTerms: invoice.customFields?.deliveryTerms || ''
        }
      });
    } else {
      setFormData({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customer: { 
          name: '', 
          phone: '', 
          email: '', 
          address: '', 
          taxId: '',
          type: 'individual' as 'individual' | 'business' 
        },
        items: [{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        taxAmount: 0,
        taxRate: 15,
        discount: 0,
        total: 0,
        status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentTerms: '30',
        currency: 'SAR',
        language: 'ar' as 'ar' | 'en' | 'both',
        qrCode: '',
        notes: '',
        customFields: {
          poNumber: '',
          deliveryTerms: ''
        }
      });
    }
  }, [invoice, open]);

  const calculateTotals = (items: any[], discount: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateCalculations = () => {
    const { subtotal, taxAmount, total } = calculateTotals(formData.items, formData.discount, formData.taxRate);
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
    const { subtotal, taxAmount, total } = calculateTotals(finalData.items, finalData.discount, finalData.taxRate);
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
            {invoice ? (isArabic ? 'تعديل الفاتورة' : 'Edit Invoice') : (isArabic ? 'فاتورة جديدة' : 'New Invoice')}
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
                <Label htmlFor="invoiceNumber">{isArabic ? 'رقم الفاتورة' : 'Invoice Number'}</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="issueDate">{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">{isArabic ? 'اسم العميل' : 'Customer Name'}</Label>
                  <Input
                    id="customerName"
                    value={formData.customer.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, name: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">{isArabic ? 'الهاتف' : 'Phone'}</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customer.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, phone: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">{isArabic ? 'العنوان' : 'Address'}</Label>
                  <Input
                    id="customerAddress"
                    value={formData.customer.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, address: e.target.value }
                    }))}
                  />
                </div>
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

          {/* Status and Payment */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الحالة والدفع' : 'Status & Payment'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">{isArabic ? 'حالة الفاتورة' : 'Invoice Status'}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                      <SelectItem value="sent">{isArabic ? 'مرسلة' : 'Sent'}</SelectItem>
                      <SelectItem value="paid">{isArabic ? 'مدفوعة' : 'Paid'}</SelectItem>
                      <SelectItem value="overdue">{isArabic ? 'متأخرة' : 'Overdue'}</SelectItem>
                      <SelectItem value="cancelled">{isArabic ? 'ملغية' : 'Cancelled'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount">{isArabic ? 'الخصم' : 'Discount'}</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({ ...prev, discount }));
                      setTimeout(updateCalculations, 0);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">{isArabic ? 'معدل الضريبة (%)' : 'Tax Rate (%)'}</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({ ...prev, taxRate }));
                      setTimeout(updateCalculations, 0);
                    }}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span>{formData.subtotal.toFixed(2)} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                    <span>-{formData.discount.toFixed(2)} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isArabic ? `الضريبة (${formData.taxRate}%):` : `Tax (${formData.taxRate}%):`}</span>
                    <span>{formData.taxAmount.toFixed(2)} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{isArabic ? 'المجموع الكلي:' : 'Total:'}</span>
                    <span>{formData.total.toFixed(2)} {formData.currency}</span>
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
              {invoice ? (isArabic ? 'تحديث الفاتورة' : 'Update Invoice') : (isArabic ? 'حفظ الفاتورة' : 'Save Invoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}