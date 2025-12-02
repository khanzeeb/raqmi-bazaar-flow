import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { usePricingData, usePricingFiltering, usePricingActions, usePricingStats } from "@/hooks/pricing";
import { PricingFilters } from "@/components/Pricing/PricingFilters";
import { PricingCard } from "@/components/Pricing/PricingCard";
import { PricingRuleDialog } from "@/components/Pricing/PricingRuleDialog";
import { PricingRuleStatsDialog } from "@/components/Pricing/PricingRuleStatsDialog";
import { PricingRule } from "@/types/pricing.types";

const Pricing = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const { pricingRules, setPricingRules } = usePricingData();
  const { filters, filteredRules, setSearchQuery, setType } = usePricingFiltering(pricingRules);
  const { addRule, updateRule, toggleStatus, copyRule } = usePricingActions(pricingRules, setPricingRules);
  const stats = usePricingStats(pricingRules);
  
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const handleNewRule = () => {
    setSelectedRule(null);
    setRuleDialogOpen(true);
  };

  const handleEditRule = (rule: PricingRule) => {
    setSelectedRule(rule);
    setRuleDialogOpen(true);
  };

  const handleCopyRule = (rule: PricingRule) => {
    copyRule(rule);
    toast({
      title: isArabic ? "نسخ القاعدة" : "Copy Rule",
      description: isArabic ? "تم نسخ قاعدة التسعير" : "Pricing rule has been copied",
    });
  };

  const handleToggleStatus = (ruleId: string) => {
    toggleStatus(ruleId);
    toast({
      title: isArabic ? "تغيير حالة القاعدة" : "Rule Status Changed",
      description: isArabic ? "تم تغيير حالة قاعدة التسعير" : "Pricing rule status has been changed",
    });
  };

  const handleViewStats = (rule: PricingRule) => {
    setSelectedRule(rule);
    setStatsDialogOpen(true);
  };

  const handleSaveRule = (ruleData: Omit<PricingRule, 'id' | 'createdAt' | 'usageCount'>) => {
    if (selectedRule) {
      updateRule(selectedRule.id, ruleData);
    } else {
      addRule(ruleData);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'التسعير والخصومات' : 'Pricing & Discounts'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'إدارة قواعد التسعير والعروض التجارية' : 'Manage pricing rules and promotional offers'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.activeRules}</div>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "قواعد نشطة" : "Active Rules"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalUsage}</div>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "إجمالي الاستخدام" : "Total Usage"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.promoCodes}</div>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "أكواد الخصم" : "Promo Codes"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.averageDiscount}%</div>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "متوسط الخصم" : "Average Discount"}
            </p>
          </CardContent>
        </Card>
      </div>

      <PricingFilters
        searchQuery={filters.searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={filters.type}
        onTypeChange={setType}
        onAddRule={handleNewRule}
        isArabic={isArabic}
      />

      <div className="grid gap-4 mt-6">
        {filteredRules.map((rule) => (
          <PricingCard
            key={rule.id}
            rule={rule}
            isArabic={isArabic}
            onEdit={handleEditRule}
            onCopy={handleCopyRule}
            onToggleStatus={handleToggleStatus}
            onViewStats={handleViewStats}
          />
        ))}
      </div>

      <PricingRuleDialog
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
        rule={selectedRule}
        onSave={handleSaveRule}
        isArabic={isArabic}
      />

      {selectedRule && (
        <PricingRuleStatsDialog
          open={statsDialogOpen}
          onOpenChange={setStatsDialogOpen}
          rule={selectedRule}
          isArabic={isArabic}
        />
      )}
    </div>
  );
};

export default Pricing;
