// InvoiceFilters - Search and filter controls
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { InvoiceStatus } from "@/types/invoice.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface InvoiceFiltersProps {
  search: string;
  status: 'all' | InvoiceStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | InvoiceStatus) => void;
  onNewInvoice: () => void;
}

export const InvoiceFilters = ({ search, status, onSearchChange, onStatusChange, onNewInvoice }: InvoiceFiltersProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
        <Input
          placeholder={isArabic ? "البحث برقم الفاتورة أو اسم العميل..." : "Search by invoice number or customer name..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | InvoiceStatus)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
          <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
          <option value="sent">{isArabic ? 'مرسلة' : 'Sent'}</option>
          <option value="paid">{isArabic ? 'مدفوعة' : 'Paid'}</option>
          <option value="overdue">{isArabic ? 'متأخرة' : 'Overdue'}</option>
          <option value="cancelled">{isArabic ? 'ملغاة' : 'Cancelled'}</option>
        </select>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        <Button onClick={onNewInvoice}>
          <Plus className="w-4 h-4 mr-2" />
          <BilingualLabel enLabel="New Invoice" arLabel="فاتورة جديدة" showBoth={false} />
        </Button>
      </div>
    </div>
  );
};
