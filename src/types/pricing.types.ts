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

export interface PricingFilters {
  searchTerm: string;
  selectedType: 'all' | PricingRule['type'];
}

export interface PricingStats {
  activeRules: number;
  totalUsage: number;
  promoCodes: number;
  averageDiscount: number;
}
