import { PricingRule } from '@/types/pricing.types';
import { useToast } from '@/hooks/use-toast';

export const usePricingActions = (
  pricingRules: PricingRule[],
  setPricingRules: React.Dispatch<React.SetStateAction<PricingRule[]>>,
  isArabic: boolean
) => {
  const { toast } = useToast();

  const toggleRuleStatus = (ruleId: string) => {
    setPricingRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ));
    toast({
      title: isArabic ? "تغيير حالة القاعدة" : "Rule Status Changed",
      description: isArabic ? "تم تغيير حالة قاعدة التسعير" : "Pricing rule status has been changed",
    });
  };

  const copyRule = (rule: PricingRule) => {
    const newRule = {
      ...rule,
      id: Date.now().toString(),
      name: `${rule.name} - ${isArabic ? 'نسخة' : 'Copy'}`,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPricingRules(prev => [...prev, newRule]);
    toast({
      title: isArabic ? "نسخ القاعدة" : "Copy Rule",
      description: isArabic ? "تم نسخ قاعدة التسعير" : "Pricing rule has been copied",
    });
  };

  const saveRule = (ruleData: Omit<PricingRule, 'id' | 'createdAt' | 'usageCount'>, selectedRule: PricingRule | null) => {
    if (selectedRule) {
      setPricingRules(prev => prev.map(rule =>
        rule.id === selectedRule.id ? { ...rule, ...ruleData } : rule
      ));
    } else {
      const newRule: PricingRule = {
        ...ruleData,
        id: Date.now().toString(),
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPricingRules(prev => [...prev, newRule]);
    }
  };

  return { toggleRuleStatus, copyRule, saveRule };
};
