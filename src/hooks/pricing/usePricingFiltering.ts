import { useState, useMemo } from 'react';
import { PricingRule, PricingFilters } from '@/types/pricing.types';

export const usePricingFiltering = (pricingRules: PricingRule[]) => {
  const [filters, setFilters] = useState<PricingFilters>({
    searchTerm: '',
    selectedType: 'all'
  });

  const filteredRules = useMemo(() => {
    return pricingRules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesType = filters.selectedType === 'all' || rule.type === filters.selectedType;
      return matchesSearch && matchesType;
    });
  }, [pricingRules, filters]);

  const setSearchTerm = (term: string) => setFilters(prev => ({ ...prev, searchTerm: term }));
  const setSelectedType = (type: PricingFilters['selectedType']) => setFilters(prev => ({ ...prev, selectedType: type }));

  return { filters, filteredRules, setSearchTerm, setSelectedType };
};
