import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import type { PricingRule } from "@/pages/Pricing";

interface PricingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: PricingRule | null;
  onSave: (rule: Omit<PricingRule, 'id' | 'createdAt' | 'usageCount'>) => void;
}

export const PricingRuleDialog: React.FC<PricingRuleDialogProps> = ({
  open,
  onOpenChange,
  rule,
  onSave
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'tiered' as PricingRule['type'],
    status: 'active' as PricingRule['status'],
    description: '',
    conditions: {
      minQuantity: undefined as number | undefined,
      maxQuantity: undefined as number | undefined,
      customerType: undefined as 'individual' | 'business' | 'vip' | undefined,
      productCategories: [] as string[],
      startDate: '',
      endDate: '',
      promoCode: ''
    },
    discount: {
      type: 'percentage' as 'percentage' | 'fixed_amount',
      value: 0,
      maxDiscount: undefined as number | undefined
    },
    priority: 1,
    maxUsage: undefined as number | undefined
  });

  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        type: rule.type,
        status: rule.status,
        description: rule.description,
        conditions: {
          minQuantity: rule.conditions.minQuantity,
          maxQuantity: rule.conditions.maxQuantity,
          customerType: rule.conditions.customerType,
          productCategories: rule.conditions.productCategories || [],
          startDate: rule.conditions.startDate || '',
          endDate: rule.conditions.endDate || '',
          promoCode: rule.conditions.promoCode || ''
        },
        discount: {
          type: rule.discount.type,
          value: rule.discount.value,
          maxDiscount: rule.discount.maxDiscount
        },
        priority: rule.priority,
        maxUsage: rule.maxUsage
      });
    } else {
      // Reset form for new rule
      setFormData({
        name: '',
        type: 'tiered',
        status: 'active',
        description: '',
        conditions: {
          minQuantity: undefined,
          maxQuantity: undefined,
          customerType: undefined,
          productCategories: [],
          startDate: '',
          endDate: '',
          promoCode: ''
        },
        discount: {
          type: 'percentage',
          value: 0,
          maxDiscount: undefined
        },
        priority: 1,
        maxUsage: undefined
      });
    }
  }, [rule, open]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "اسم القاعدة مطلوب" : "Rule name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.discount.value <= 0) {
      toast({
        title: isArabic ? "خطأ" : "Error", 
        description: isArabic ? "قيمة الخصم يجب أن تكون أكبر من صفر" : "Discount value must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    
    toast({
      title: isArabic ? "تم الحفظ" : "Saved",
      description: rule ? 
        (isArabic ? "تم تعديل قاعدة التسعير بنجاح" : "Pricing rule updated successfully") :
        (isArabic ? "تم إنشاء قاعدة التسعير بنجاح" : "Pricing rule created successfully")
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.conditions.productCategories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          productCategories: [...prev.conditions.productCategories, newCategory.trim()]
        }
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        productCategories: prev.conditions.productCategories.filter(c => c !== category)
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule ? 
              (isArabic ? "تعديل قاعدة التسعير" : "Edit Pricing Rule") :
              (isArabic ? "قاعدة تسعير جديدة" : "New Pricing Rule")
            }
          </DialogTitle>
          <DialogDescription>
            {rule ? 
              (isArabic ? "قم بتعديل تفاصيل قاعدة التسعير أدناه" : "Edit the pricing rule details below") :
              (isArabic ? "أنشئ قاعدة تسعير جديدة بملء النموذج أدناه" : "Create a new pricing rule by filling out the form below")
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? "المعلومات الأساسية" : "Basic Information"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{isArabic ? "اسم القاعدة" : "Rule Name"}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={isArabic ? "أدخل اسم القاعدة" : "Enter rule name"}
                  />
                </div>

                <div>
                  <Label htmlFor="type">{isArabic ? "نوع القاعدة" : "Rule Type"}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PricingRule['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiered">{isArabic ? "تسعير متدرج" : "Tiered Pricing"}</SelectItem>
                      <SelectItem value="time_based">{isArabic ? "مؤقت" : "Time-based"}</SelectItem>
                      <SelectItem value="bundle">{isArabic ? "عرض حزمة" : "Bundle Offer"}</SelectItem>
                      <SelectItem value="customer_specific">{isArabic ? "خاص بالعميل" : "Customer Specific"}</SelectItem>
                      <SelectItem value="promo_code">{isArabic ? "كود خصم" : "Promo Code"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">{isArabic ? "الأولوية" : "Priority"}</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                  />
                  <Label htmlFor="status">{isArabic ? "قاعدة نشطة" : "Active Rule"}</Label>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description">{isArabic ? "الوصف" : "Description"}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isArabic ? "أدخل وصف القاعدة" : "Enter rule description"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? "إعدادات الخصم" : "Discount Settings"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountType">{isArabic ? "نوع الخصم" : "Discount Type"}</Label>
                  <Select value={formData.discount.type} onValueChange={(value) => setFormData(prev => ({ ...prev, discount: { ...prev.discount, type: value as 'percentage' | 'fixed_amount' } }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{isArabic ? "نسبة مئوية" : "Percentage"}</SelectItem>
                      <SelectItem value="fixed_amount">{isArabic ? "مبلغ ثابت" : "Fixed Amount"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discountValue">
                    {isArabic ? "قيمة الخصم" : "Discount Value"}
                    {formData.discount.type === 'percentage' ? ' (%)' : ` (${isArabic ? 'ر.س' : 'SAR'})`}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step={formData.discount.type === 'percentage' ? "0.1" : "1"}
                    value={formData.discount.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: { ...prev.discount, value: parseFloat(e.target.value) || 0 } }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxDiscount">{isArabic ? "الحد الأقصى للخصم" : "Max Discount"} ({isArabic ? 'ر.س' : 'SAR'})</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    value={formData.discount.maxDiscount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: { ...prev.discount, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined } }))}
                    placeholder={isArabic ? "اختياري" : "Optional"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? "الشروط" : "Conditions"}
              </h3>
              
              <div className="grid gap-4">
                {/* Quantity Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minQuantity">{isArabic ? "الحد الأدنى للكمية" : "Minimum Quantity"}</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="0"
                      value={formData.conditions.minQuantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, minQuantity: e.target.value ? parseInt(e.target.value) : undefined } }))}
                      placeholder={isArabic ? "اختياري" : "Optional"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxQuantity">{isArabic ? "الحد الأقصى للكمية" : "Maximum Quantity"}</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      min="0"
                      value={formData.conditions.maxQuantity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, maxQuantity: e.target.value ? parseInt(e.target.value) : undefined } }))}
                      placeholder={isArabic ? "اختياري" : "Optional"}
                    />
                  </div>
                </div>

                {/* Customer Type */}
                <div>
                  <Label htmlFor="customerType">{isArabic ? "نوع العميل" : "Customer Type"}</Label>
                  <Select value={formData.conditions.customerType || 'all'} onValueChange={(value) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, customerType: value === 'all' ? undefined : value as 'individual' | 'business' | 'vip' } }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "اختر نوع العميل" : "Select customer type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? "جميع العملاء" : "All Customers"}</SelectItem>
                      <SelectItem value="individual">{isArabic ? "فرد" : "Individual"}</SelectItem>
                      <SelectItem value="business">{isArabic ? "شركة" : "Business"}</SelectItem>
                      <SelectItem value="vip">{isArabic ? "مميز" : "VIP"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Categories */}
                <div>
                  <Label>{isArabic ? "فئات المنتجات" : "Product Categories"}</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder={isArabic ? "أضف فئة منتج" : "Add product category"}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Button type="button" size="sm" onClick={addCategory}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.conditions.productCategories.map((category) => (
                      <Badge key={category} variant="outline" className="flex items-center gap-1">
                        {category}
                        <button onClick={() => removeCategory(category)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                {(formData.type === 'time_based' || formData.type === 'bundle') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">{isArabic ? "تاريخ البداية" : "Start Date"}</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.conditions.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, startDate: e.target.value } }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">{isArabic ? "تاريخ النهاية" : "End Date"}</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.conditions.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, endDate: e.target.value } }))}
                      />
                    </div>
                  </div>
                )}

                {/* Promo Code */}
                {formData.type === 'promo_code' && (
                  <div>
                    <Label htmlFor="promoCode">{isArabic ? "كود الخصم" : "Promo Code"}</Label>
                    <Input
                      id="promoCode"
                      value={formData.conditions.promoCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, promoCode: e.target.value } }))}
                      placeholder={isArabic ? "أدخل كود الخصم" : "Enter promo code"}
                    />
                  </div>
                )}

                {/* Max Usage */}
                <div>
                  <Label htmlFor="maxUsage">{isArabic ? "الحد الأقصى للاستخدام" : "Maximum Usage"}</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    min="0"
                    value={formData.maxUsage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder={isArabic ? "بلا حدود" : "Unlimited"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            {rule ? (isArabic ? "تعديل" : "Update") : (isArabic ? "إنشاء" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};