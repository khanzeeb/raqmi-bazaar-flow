// PurchaseFilters - Search and filter controls
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { PurchaseStatus } from "@/types/purchase.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface PurchaseFiltersProps {
  search: string;
  status: 'all' | PurchaseStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | PurchaseStatus) => void;
  onNewPurchase: () => void;
}

export const PurchaseFilters = ({ search, status, onSearchChange, onStatusChange, onNewPurchase }: PurchaseFiltersProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={isArabic ? "البحث برقم الطلب أو اسم المورد..." : "Search by order number or supplier..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | PurchaseStatus)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
          <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
          <option value="received">{isArabic ? 'تم الاستلام' : 'Received'}</option>
          <option value="partial">{isArabic ? 'استلام جزئي' : 'Partial'}</option>
          <option value="returned">{isArabic ? 'مرتجع' : 'Returned'}</option>
        </select>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        <Button onClick={onNewPurchase}>
          <Plus className="w-4 h-4 mr-2" />
          <BilingualLabel enLabel="New Purchase Order" arLabel="طلب شراء جديد" showBoth={false} />
        </Button>
      </div>
    </div>
  );
};
