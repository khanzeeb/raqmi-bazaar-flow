import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { SalesOrder } from "@/types/salesOrder.types";

interface SalesOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatus: 'all' | SalesOrder['status'];
  onStatusChange: (status: 'all' | SalesOrder['status']) => void;
  onNewOrder: () => void;
  isArabic: boolean;
  t: (key: string) => string;
}

export const SalesOrderFilters = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onNewOrder,
  isArabic,
  t
}: SalesOrderFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={isArabic ? "البحث برقم الطلب أو اسم العميل..." : "Search by order number or customer name..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{t('all_statuses')}</option>
          <option value="pending">{t('pending')}</option>
          <option value="completed">{t('completed')}</option>
          <option value="returned">{t('returned')}</option>
        </select>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button onClick={onNewOrder} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('new_order')}
        </Button>
      </div>
    </div>
  );
};
