import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { PricingRule } from "@/types/pricing.types";

interface PricingFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: 'all' | PricingRule['type'];
  onTypeChange: (type: 'all' | PricingRule['type']) => void;
  onNewRule: () => void;
  isArabic: boolean;
}

export const PricingFilters = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  onNewRule,
  isArabic
}: PricingFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isArabic ? 'right-3' : 'left-3'}`} />
        <Input
          placeholder={isArabic ? "البحث في قواعد التسعير..." : "Search pricing rules..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as any)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? "جميع الأنواع" : "All Types"}</option>
          <option value="tiered">{isArabic ? "تسعير متدرج" : "Tiered Pricing"}</option>
          <option value="time_based">{isArabic ? "مؤقت" : "Time-based"}</option>
          <option value="bundle">{isArabic ? "عرض حزمة" : "Bundle Offer"}</option>
          <option value="customer_specific">{isArabic ? "خاص بالعميل" : "Customer Specific"}</option>
          <option value="promo_code">{isArabic ? "كود خصم" : "Promo Code"}</option>
        </select>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button className="flex items-center gap-2" onClick={onNewRule}>
          <Plus className="w-4 h-4" />
          {isArabic ? "قاعدة تسعير جديدة" : "New Pricing Rule"}
        </Button>
      </div>
    </div>
  );
};
