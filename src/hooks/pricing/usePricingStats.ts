import { useMemo } from 'react';
import { PricingRule, PricingStats } from '@/types/pricing.types';

export const usePricingStats = (pricingRules: PricingRule[]): PricingStats => {
  return useMemo(() => ({
    activeRules: pricingRules.filter(r => r.status === 'active').length,
    totalUsage: pricingRules.reduce((sum, rule) => sum + rule.usageCount, 0),
    promoCodes: pricingRules.filter(r => r.type === 'promo_code').length,
    averageDiscount: 15
  }), [pricingRules]);
};
