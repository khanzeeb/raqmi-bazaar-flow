import { useState } from 'react';
import { PricingRule } from '@/types/pricing.types';

export const usePricingData = (isArabic: boolean) => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: isArabic ? 'خصم الجملة - إلكترونيات' : 'Bulk Discount - Electronics',
      type: 'tiered',
      status: 'active',
      description: isArabic ? 'خصم تدريجي للإلكترونيات بناءً على الكمية' : 'Tiered discount for electronics based on quantity',
      conditions: {
        minQuantity: 10,
        productCategories: [isArabic ? 'إلكترونيات' : 'Electronics'],
        customerType: 'business'
      },
      discount: { type: 'percentage', value: 15, maxDiscount: 5000 },
      priority: 1,
      usageCount: 45,
      maxUsage: 100,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: isArabic ? 'عرض نهاية الأسبوع' : 'Weekend Special',
      type: 'time_based',
      status: 'active',
      description: isArabic ? 'خصم خاص خلال عطلة نهاية الأسبوع' : 'Special discount during weekends',
      conditions: { startDate: '2024-01-26', endDate: '2024-01-28' },
      discount: { type: 'percentage', value: 10 },
      priority: 2,
      usageCount: 23,
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: isArabic ? 'عرض اشتري 2 واحصل على 1' : 'Buy 2 Get 1 Free',
      type: 'bundle',
      status: 'active',
      description: isArabic ? 'عرض خاص على الإكسسوارات' : 'Special offer on accessories',
      conditions: { minQuantity: 3, productCategories: [isArabic ? 'إكسسوارات' : 'Accessories'] },
      discount: { type: 'percentage', value: 33 },
      priority: 3,
      usageCount: 12,
      maxUsage: 50,
      createdAt: '2024-01-15'
    },
    {
      id: '4',
      name: isArabic ? 'كود خصم VIP20' : 'VIP20 Discount Code',
      type: 'promo_code',
      status: 'active',
      description: isArabic ? 'كود خصم خاص للعملاء المميزين' : 'Special discount code for VIP customers',
      conditions: { promoCode: 'VIP20', customerType: 'vip' },
      discount: { type: 'percentage', value: 20, maxDiscount: 2000 },
      priority: 4,
      usageCount: 8,
      maxUsage: 25,
      createdAt: '2024-01-10'
    }
  ]);

  return { pricingRules, setPricingRules };
};
