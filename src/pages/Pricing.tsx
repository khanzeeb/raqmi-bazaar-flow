import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Tag, Percent, Clock, Users, Package } from "lucide-react";

export interface PricingRule {
  id: string;
  name: string;
  type: 'tiered' | 'time_based' | 'bundle' | 'customer_specific' | 'promo_code';
  status: 'active' | 'inactive' | 'scheduled';
  description: string;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    customerType?: 'individual' | 'business' | 'vip';
    productCategories?: string[];
    startDate?: string;
    endDate?: string;
    promoCode?: string;
  };
  discount: {
    type: 'percentage' | 'fixed_amount';
    value: number;
    maxDiscount?: number;
  };
  priority: number;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
}

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | PricingRule['type']>('all');
  const [pricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'خصم الجملة - إلكترونيات',
      type: 'tiered',
      status: 'active',
      description: 'خصم تدريجي للإلكترونيات بناءً على الكمية',
      conditions: {
        minQuantity: 10,
        productCategories: ['إلكترونيات'],
        customerType: 'business'
      },
      discount: {
        type: 'percentage',
        value: 15,
        maxDiscount: 5000
      },
      priority: 1,
      usageCount: 45,
      maxUsage: 100,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'عرض نهاية الأسبوع',
      type: 'time_based',
      status: 'active',
      description: 'خصم خاص خلال عطلة نهاية الأسبوع',
      conditions: {
        startDate: '2024-01-26',
        endDate: '2024-01-28'
      },
      discount: {
        type: 'percentage',
        value: 10
      },
      priority: 2,
      usageCount: 23,
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'عرض اشتري 2 واحصل على 1',
      type: 'bundle',
      status: 'active',
      description: 'عرض خاص على الإكسسوارات',
      conditions: {
        minQuantity: 3,
        productCategories: ['إكسسوارات']
      },
      discount: {
        type: 'percentage',
        value: 33
      },
      priority: 3,
      usageCount: 12,
      maxUsage: 50,
      createdAt: '2024-01-15'
    },
    {
      id: '4',
      name: 'كود خصم VIP20',
      type: 'promo_code',
      status: 'active',
      description: 'كود خصم خاص للعملاء المميزين',
      conditions: {
        promoCode: 'VIP20',
        customerType: 'vip'
      },
      discount: {
        type: 'percentage',
        value: 20,
        maxDiscount: 2000
      },
      priority: 4,
      usageCount: 8,
      maxUsage: 25,
      createdAt: '2024-01-10'
    }
  ]);

  const getTypeColor = (type: PricingRule['type']) => {
    switch (type) {
      case 'tiered': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'time_based': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'bundle': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'customer_specific': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'promo_code': return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getTypeText = (type: PricingRule['type']) => {
    switch (type) {
      case 'tiered': return 'تسعير متدرج';
      case 'time_based': return 'مؤقت';
      case 'bundle': return 'عرض حزمة';
      case 'customer_specific': return 'خاص بالعميل';
      case 'promo_code': return 'كود خصم';
      default: return type;
    }
  };

  const getTypeIcon = (type: PricingRule['type']) => {
    switch (type) {
      case 'tiered': return <Tag className="w-4 h-4" />;
      case 'time_based': return <Clock className="w-4 h-4" />;
      case 'bundle': return <Package className="w-4 h-4" />;
      case 'customer_specific': return <Users className="w-4 h-4" />;
      case 'promo_code': return <Percent className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: PricingRule['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'scheduled': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: PricingRule['status']) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'scheduled': return 'مجدول';
      default: return status;
    }
  };

  const filteredRules = pricingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || rule.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleRuleStatus = (ruleId: string) => {
    // This would update the rule status in a real application
    console.log('Toggle rule status:', ruleId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">التسعير والخصومات</h1>
        <p className="text-muted-foreground">إدارة قواعد التسعير والعروض التجارية</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {pricingRules.filter(r => r.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">قواعد نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {pricingRules.reduce((sum, rule) => sum + rule.usageCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">إجمالي الاستخدام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {pricingRules.filter(r => r.type === 'promo_code').length}
            </div>
            <p className="text-sm text-muted-foreground">أكواد الخصم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              15%
            </div>
            <p className="text-sm text-muted-foreground">متوسط الخصم</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث في قواعد التسعير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">جميع الأنواع</option>
            <option value="tiered">تسعير متدرج</option>
            <option value="time_based">مؤقت</option>
            <option value="bundle">عرض حزمة</option>
            <option value="customer_specific">خاص بالعميل</option>
            <option value="promo_code">كود خصم</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            قاعدة تسعير جديدة
          </Button>
        </div>
      </div>

      {/* Pricing Rules Grid */}
      <div className="grid gap-4">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {rule.name}
                    {getTypeIcon(rule.type)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <Badge className={getTypeColor(rule.type)}>
                    {getTypeText(rule.type)}
                  </Badge>
                  <Badge className={getStatusColor(rule.status)}>
                    {getStatusText(rule.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">نوع الخصم</p>
                  <p className="font-semibold">
                    {rule.discount.type === 'percentage' ? 
                      `${rule.discount.value}%` : 
                      `${rule.discount.value} ر.س`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأولوية</p>
                  <p className="font-medium">{rule.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الاستخدام</p>
                  <p className="font-medium">
                    {rule.usageCount}
                    {rule.maxUsage && ` / ${rule.maxUsage}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">{rule.createdAt}</p>
                </div>
              </div>
              
              {/* Conditions */}
              <div className="border-t pt-3 mb-4">
                <p className="text-sm text-muted-foreground mb-2">الشروط:</p>
                <div className="flex flex-wrap gap-2">
                  {rule.conditions.minQuantity && (
                    <Badge variant="outline">
                      الحد الأدنى: {rule.conditions.minQuantity} قطعة
                    </Badge>
                  )}
                  {rule.conditions.customerType && (
                    <Badge variant="outline">
                      نوع العميل: {rule.conditions.customerType === 'business' ? 'شركة' : 
                                    rule.conditions.customerType === 'vip' ? 'مميز' : 'فرد'}
                    </Badge>
                  )}
                  {rule.conditions.productCategories && (
                    <Badge variant="outline">
                      الفئات: {rule.conditions.productCategories.join(', ')}
                    </Badge>
                  )}
                  {rule.conditions.promoCode && (
                    <Badge variant="outline">
                      الكود: {rule.conditions.promoCode}
                    </Badge>
                  )}
                  {rule.conditions.startDate && rule.conditions.endDate && (
                    <Badge variant="outline">
                      {rule.conditions.startDate} - {rule.conditions.endDate}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                  <Button variant="outline" size="sm">
                    نسخ
                  </Button>
                  <Button variant="outline" size="sm">
                    إحصائيات
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                    {rule.status === 'active' ? 'تعطيل' : 'تفعيل'}
                  </Label>
                  <Switch
                    id={`rule-${rule.id}`}
                    checked={rule.status === 'active'}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد قواعد تسعير مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Pricing;