import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";
import { QuotationStatus } from "@/types/quotation.types";

interface QuotationFiltersProps {
  search: string;
  status: 'all' | QuotationStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'all' | QuotationStatus) => void;
  onNewQuotation: () => void;
}

export const QuotationFilters: React.FC<QuotationFiltersProps> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onNewQuotation,
}) => {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
      <div className="flex-1 relative">
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
        <Input
          placeholder={isArabic ? "البحث برقم العرض أو اسم العميل..." : "Search by quotation number or customer name..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isRTL ? 'pr-10' : 'pl-10'}
        />
      </div>
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'all' | QuotationStatus)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? "جميع الحالات" : "All Status"}</option>
          <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
          <option value="sent">{isArabic ? "مرسل" : "Sent"}</option>
          <option value="accepted">{isArabic ? "مقبول" : "Accepted"}</option>
          <option value="expired">{isArabic ? "منتهي الصلاحية" : "Expired"}</option>
        </select>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={onNewQuotation}>
          <Plus className="w-4 h-4" />
          <BilingualLabel 
            enLabel="New Quotation" 
            arLabel="عرض سعر جديد"
            showBoth={true}
            primaryClassName="text-sm"
            secondaryClassName="text-[10px] opacity-80"
          />
        </Button>
      </div>
    </div>
  );
};
