import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/hooks/use-toast";
import { usePricingData, usePricingFiltering, usePricingActions, usePricingStats } from "@/hooks/pricing";
import { PricingFilters } from "@/components/Pricing/PricingFilters";
import { PricingCard } from "@/components/Pricing/PricingCard";
import { PricingRuleDialog } from "@/components/Pricing/PricingRuleDialog";
import { PricingRuleStatsDialog } from "@/components/Pricing/PricingRuleStatsDialog";
import { PricingRule } from "@/types/pricing.types";

const Pricing = () => {
  const { isArabic, isRTL } = useRTL();
  const { toast } = useToast();
  
  const { pricingRules, setPricingRules } = usePricingData(isArabic);
  const { filters, filteredRules, setSearchTerm, setSelectedType } = usePricingFiltering(pricingRules);
  const { toggleRuleStatus, copyRule, saveRule } = usePricingActions(pricingRules, setPricingRules, isArabic);
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
    toggleRuleStatus(ruleId);
  };

  const handleViewStats = (rule: PricingRule) => {
    setSelectedRule(rule);
    setStatsDialogOpen(true);
  };

  const handleSaveRule = (ruleData: Omit<PricingRule, 'id' | 'createdAt' | 'usageCount'>) => {
    saveRule(ruleData, selectedRule);
    setRuleDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
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
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={filters.selectedType}
        onTypeChange={setSelectedType}
        onNewRule={handleNewRule}
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
      />

      {selectedRule && (
        <PricingRuleStatsDialog
          open={statsDialogOpen}
          onOpenChange={setStatsDialogOpen}
          rule={selectedRule}
        />
      )}
    </div>
  );
};

export default Pricing;
