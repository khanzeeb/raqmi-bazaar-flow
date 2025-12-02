// PaymentFilters - Search and filter controls
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { PaymentStatus } from "@/types/payment.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface PaymentFiltersProps {
  search: string;
  status: 'all' | PaymentStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | PaymentStatus) => void;
  onNewPayment: () => void;
}

export const PaymentFilters = ({ search, status, onSearchChange, onStatusChange, onNewPayment }: PaymentFiltersProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={isArabic ? "البحث برقم الدفعة أو اسم العميل..." : "Search by payment number or customer name..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | PaymentStatus)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
          <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
          <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
          <option value="failed">{isArabic ? 'فاشل' : 'Failed'}</option>
          <option value="cancelled">{isArabic ? 'ملغى' : 'Cancelled'}</option>
        </select>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        <Button onClick={onNewPayment}>
          <Plus className="w-4 h-4 mr-2" />
          <BilingualLabel enLabel="New Payment" arLabel="دفعة جديدة" showBoth={false} />
        </Button>
      </div>
    </div>
  );
};
