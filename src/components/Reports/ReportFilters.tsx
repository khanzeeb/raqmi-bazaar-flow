import { Button } from "@/components/ui/button";
import { Filter, Calendar, Download } from "lucide-react";

interface ReportFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedReport: string;
  onReportChange: (report: string) => void;
  onFilter: () => void;
  onDateCustomize: () => void;
  onExport: () => void;
  isArabic: boolean;
}

export const ReportFilters = ({
  selectedPeriod,
  onPeriodChange,
  selectedReport,
  onReportChange,
  onFilter,
  onDateCustomize,
  onExport,
  isArabic
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex gap-2">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="week">{isArabic ? "هذا الأسبوع" : "This Week"}</option>
          <option value="month">{isArabic ? "هذا الشهر" : "This Month"}</option>
          <option value="quarter">{isArabic ? "هذا الربع" : "This Quarter"}</option>
          <option value="year">{isArabic ? "هذا العام" : "This Year"}</option>
        </select>
        
        <select
          value={selectedReport}
          onChange={(e) => onReportChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="overview">{isArabic ? "نظرة عامة" : "Overview"}</option>
          <option value="sales">{isArabic ? "تقرير المبيعات" : "Sales Report"}</option>
          <option value="purchases">{isArabic ? "تقرير المشتريات" : "Purchases Report"}</option>
          <option value="expenses">{isArabic ? "تقرير المصروفات" : "Expenses Report"}</option>
          <option value="inventory">{isArabic ? "تقرير المخزون" : "Inventory Report"}</option>
          <option value="customers">{isArabic ? "تقرير العملاء" : "Customers Report"}</option>
        </select>
      </div>
      
      <div className={`flex gap-2 ${isArabic ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
          {isArabic ? "تصفية" : "Filter"}
        </Button>
        <Button variant="outline" size="sm" onClick={onDateCustomize}>
          <Calendar className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
          {isArabic ? "تخصيص التاريخ" : "Customize Date"}
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
          {isArabic ? "تصدير" : "Export"}
        </Button>
      </div>
    </div>
  );
};
