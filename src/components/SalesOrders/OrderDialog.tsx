import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Search, Calculator } from "lucide-react";
import { SalesOrder } from "@/pages/SalesOrders";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SalesOrder | null;
  onSave: (order: Partial<SalesOrder>) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// Mock products data
const mockProducts: Product[] = [
  { id: '1', name: 'جهاز كمبيوتر محمول', price: 2500, stock: 15, category: 'إلكترونيات' },
  { id: '2', name: 'ماوس لاسلكي', price: 50, stock: 30, category: 'إكسسوارات' },
  { id: '3', name: 'طابعة ليزر', price: 800, stock: 8, category: 'طابعات' },
  { id: '4', name: 'لوحة مفاتيح', price: 120, stock: 25, category: 'إكسسوارات' },
  { id: '5', name: 'شاشة 24 بوصة', price: 600, stock: 12, category: 'شاشات' }
];

const mockCustomers = [
  { id: '1', name: 'أحمد محمد', phone: '+966501234567', type: 'individual' as const },
  { id: '2', name: 'شركة التقنية المتقدمة', phone: '+966112345678', type: 'business' as const },
  { id: '3', name: 'فاطمة أحمد', phone: '+966509876543', type: 'individual' as const }
];

export const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onOpenChange,
  order,
  onSave
}) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const [formData, setFormData] = useState({
    customer: { name: '', phone: '', type: 'individual' as 'individual' | 'business' },
    items: [] as Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>,
    subtotal: 0,
    taxRate: 15,
    taxAmount: 0,
    discount: 0,
    total: 0,
    paymentMode: 'cash' as 'cash' | 'bank_transfer' | 'credit',
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
    paidAmount: 0,
    status: 'pending' as 'pending' | 'completed' | 'returned',
    notes: ''
  });

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        taxRate: order.taxRate,
        taxAmount: order.taxAmount,
        discount: order.discount,
        total: order.total,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        paidAmount: order.paidAmount,
        status: order.status,
        notes: order.notes || ''
      });
    } else {
      setFormData({
        customer: { name: '', phone: '', type: 'individual' as 'individual' | 'business' },
        items: [],
        subtotal: 0,
        taxRate: 15,
        taxAmount: 0,
        discount: 0,
        total: 0,
        paymentMode: 'cash',
        paymentStatus: 'pending',
        paidAmount: 0,
        status: 'pending',
        notes: ''
      });
      setSelectedCustomer('');
    }
  }, [order]);

  const calculateTotals = (items: typeof formData.items, discount: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountedAmount = subtotal - discount;
    const taxAmount = (discountedAmount * taxRate) / 100;
    const total = discountedAmount + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const updateCalculations = (newItems = formData.items, newDiscount = formData.discount) => {
    const { subtotal, taxAmount, total } = calculateTotals(newItems, newDiscount, formData.taxRate);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      taxAmount,
      total,
      discount: newDiscount
    }));
  };

  const addProduct = (product: Product) => {
    const existingItem = formData.items.find(item => item.id === product.id);
    
    if (existingItem) {
      const newItems = formData.items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      );
      updateCalculations(newItems);
    } else {
      const newItems = [...formData.items, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }];
      updateCalculations(newItems);
    }
    setProductSearch('');
    setShowProductSearch(false);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newItems = formData.items.filter(item => item.id !== productId);
      updateCalculations(newItems);
    } else {
      const newItems = formData.items.map(item =>
        item.id === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      );
      updateCalculations(newItems);
    }
  };

  const updatePrice = (productId: string, price: number) => {
    const newItems = formData.items.map(item =>
      item.id === productId
        ? { ...item, price, total: item.quantity * price }
        : item
    );
    updateCalculations(newItems);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer: { name: customer.name, phone: customer.phone, type: customer.type }
      }));
      setSelectedCustomer(customerId);
    }
  };

  const handleSave = () => {
    if (formData.items.length === 0) {
      alert(isArabic ? 'يرجى إضافة منتجات للطلب' : 'Please add products to order');
      return;
    }
    if (!formData.customer.name) {
      alert(isArabic ? 'يرجى اختيار العميل' : 'Please select customer');
      return;
    }
    
    onSave(formData);
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? `${t('edit')} ${t('order_number')} ${order.orderNumber}` : t('new_order')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('customer_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('select_customer')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder={isArabic ? "البحث عن عميل بالاسم أو رقم الهاتف..." : "Search customer by name or phone..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('customer_name')}</Label>
                    <Input
                      value={formData.customer.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, name: e.target.value }
                      }))}
                      placeholder={isArabic ? "أدخل اسم العميل" : "Enter customer name"}
                    />
                  </div>
                  <div>
                    <Label>{t('phone')}</Label>
                    <Input
                      value={formData.customer.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      placeholder={isArabic ? "رقم الهاتف" : "Phone number"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{t('products')}</CardTitle>
                  <Button
                    onClick={() => setShowProductSearch(!showProductSearch)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('add_product_to_order')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showProductSearch && (
                  <div className="border rounded-md p-4 bg-muted/50">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder={t('search_product')}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-accent"
                          onClick={() => addProduct(product)}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.price} ر.س - المخزون: {product.stock}
                            </p>
                          </div>
                          <Plus className="w-4 h-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {isArabic ? "لا توجد منتجات مضافة للطلب" : "No products added to order"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="border rounded-md p-3">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-4">
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 0)}
                                className="mx-1 h-8 text-center"
                                type="number"
                                min="0"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <Input
                              value={item.price}
                              onChange={(e) => updatePrice(item.id, Number(e.target.value) || 0)}
                              className="h-8"
                              type="number"
                              step="0.01"
                            />
                          </div>
                          <div className="col-span-2">
                            <p className="font-medium text-right">
                              {item.total.toLocaleString()} ر.س
                            </p>
                          </div>
                          <div className="col-span-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 0)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isArabic ? "ملخص الطلب" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}:</span>
                    <span>{formData.subtotal.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                  </div>
                  
                  <div>
                    <Label>{t('discount')}</Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => {
                        const discount = Number(e.target.value) || 0;
                        updateCalculations(formData.items, discount);
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>{t('tax_rate')} (%)</Label>
                    <Input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => {
                        const taxRate = Number(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, taxRate }));
                        updateCalculations();
                      }}
                      placeholder="15"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>{t('tax')} ({formData.taxRate}%):</span>
                    <span>{formData.taxAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('grand_total')}:</span>
                    <span>{formData.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('payment_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('payment_method')}</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('cash')}</SelectItem>
                      <SelectItem value="bank_transfer">{t('bank_transfer')}</SelectItem>
                      <SelectItem value="credit">{t('credit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('payment_status')}</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('unpaid')}</SelectItem>
                      <SelectItem value="partial">{t('partially_paid')}</SelectItem>
                      <SelectItem value="paid">{t('fully_paid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('paid_amount')}</Label>
                  <Input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: Number(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>{t('order_status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="completed">{t('completed')}</SelectItem>
                      <SelectItem value="returned">{t('returned')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isArabic ? "ملاحظات إضافية..." : "Additional notes..."}
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {order ? t('update_order') : t('save_order')}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};