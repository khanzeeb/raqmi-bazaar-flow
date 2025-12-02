import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Copy, BarChart3, Tag, Clock, Package, Users, Percent } from "lucide-react";
import { PricingRule } from "@/types/pricing.types";

interface PricingCardProps {
  rule: PricingRule;
  isArabic: boolean;
  onEdit: (rule: PricingRule) => void;
  onCopy: (rule: PricingRule) => void;
  onToggleStatus: (ruleId: string) => void;
  onViewStats: (rule: PricingRule) => void;
}

export const PricingCard = ({
  rule,
  isArabic,
  onEdit,
  onCopy,
  onToggleStatus,
  onViewStats
}: PricingCardProps) => {
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
    if (isArabic) {
      switch (type) {
        case 'tiered': return 'تسعير متدرج';
        case 'time_based': return 'مؤقت';
        case 'bundle': return 'عرض حزمة';
        case 'customer_specific': return 'خاص بالعميل';
        case 'promo_code': return 'كود خصم';
        default: return type;
      }
    } else {
      switch (type) {
        case 'tiered': return 'Tiered Pricing';
        case 'time_based': return 'Time-based';
        case 'bundle': return 'Bundle Offer';
        case 'customer_specific': return 'Customer Specific';
        case 'promo_code': return 'Promo Code';
        default: return type;
      }
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
    if (isArabic) {
      switch (status) {
        case 'active': return 'نشط';
        case 'inactive': return 'غير نشط';
        case 'scheduled': return 'مجدول';
        default: return status;
      }
    } else {
      switch (status) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'scheduled': return 'Scheduled';
        default: return status;
      }
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {rule.name}
              {getTypeIcon(rule.type)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
          </div>
          <div className="flex gap-2 flex-col items-end">
            <Badge className={getTypeColor(rule.type)}>{getTypeText(rule.type)}</Badge>
            <Badge className={getStatusColor(rule.status)}>{getStatusText(rule.status)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "نوع الخصم" : "Discount Type"}</p>
            <p className="font-semibold">
              {rule.discount.type === 'percentage' ? 
                `${rule.discount.value}%` : 
                `${rule.discount.value} ${isArabic ? 'ر.س' : 'SAR'}`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "الأولوية" : "Priority"}</p>
            <p className="font-medium">{rule.priority}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "الاستخدام" : "Usage"}</p>
            <p className="font-medium">
              {rule.usageCount}
              {rule.maxUsage && ` / ${rule.maxUsage}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "تاريخ الإنشاء" : "Created Date"}</p>
            <p className="font-medium">{rule.createdAt}</p>
          </div>
        </div>
        
        {/* Conditions */}
        <div className="border-t pt-3 mb-4">
          <p className="text-sm text-muted-foreground mb-2">{isArabic ? "الشروط:" : "Conditions:"}</p>
          <div className="flex flex-wrap gap-2">
            {rule.conditions.minQuantity && (
              <Badge variant="outline">
                {isArabic ? `الحد الأدنى: ${rule.conditions.minQuantity} قطعة` : `Min Qty: ${rule.conditions.minQuantity} units`}
              </Badge>
            )}
            {rule.conditions.customerType && (
              <Badge variant="outline">
                {isArabic ? 
                  `نوع العميل: ${rule.conditions.customerType === 'business' ? 'شركة' : 
                    rule.conditions.customerType === 'vip' ? 'مميز' : 'فرد'}` :
                  `Customer: ${rule.conditions.customerType === 'business' ? 'Business' : 
                    rule.conditions.customerType === 'vip' ? 'VIP' : 'Individual'}`
                }
              </Badge>
            )}
            {rule.conditions.productCategories && (
              <Badge variant="outline">
                {isArabic ? `الفئات: ${rule.conditions.productCategories.join(', ')}` : `Categories: ${rule.conditions.productCategories.join(', ')}`}
              </Badge>
            )}
            {rule.conditions.promoCode && (
              <Badge variant="outline">
                {isArabic ? `الكود: ${rule.conditions.promoCode}` : `Code: ${rule.conditions.promoCode}`}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.status === 'active'}
              onCheckedChange={() => onToggleStatus(rule.id)}
            />
            <span className="text-sm">{isArabic ? "تفعيل" : "Active"}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(rule)}>
              <Edit className="w-4 h-4 mr-1" />
              {isArabic ? "تعديل" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onCopy(rule)}>
              <Copy className="w-4 h-4 mr-1" />
              {isArabic ? "نسخ" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewStats(rule)}>
              <BarChart3 className="w-4 h-4 mr-1" />
              {isArabic ? "إحصائيات" : "Stats"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
