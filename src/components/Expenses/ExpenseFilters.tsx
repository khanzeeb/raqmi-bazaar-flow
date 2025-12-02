// ExpenseFilters - Search and filter controls
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { ExpenseCategory } from "@/types/expense.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface ExpenseFiltersProps {
  search: string;
  category: 'all' | ExpenseCategory;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: 'all' | ExpenseCategory) => void;
  onNewExpense: () => void;
}

export const ExpenseFilters = ({ search, category, onSearchChange, onCategoryChange, onNewExpense }: ExpenseFiltersProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isArabic ? 'right-3' : 'left-3'}`} />
        <Input
          placeholder={isArabic ? "البحث برقم المصروف أو الوصف..." : "Search by expense number or description..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as 'all' | ExpenseCategory)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
          <option value="rent">{isArabic ? 'إيجار' : 'Rent'}</option>
          <option value="utilities">{isArabic ? 'مرافق' : 'Utilities'}</option>
          <option value="transport">{isArabic ? 'مواصلات' : 'Transport'}</option>
          <option value="office">{isArabic ? 'مكتب' : 'Office'}</option>
          <option value="marketing">{isArabic ? 'تسويق' : 'Marketing'}</option>
          <option value="maintenance">{isArabic ? 'صيانة' : 'Maintenance'}</option>
          <option value="other">{isArabic ? 'أخرى' : 'Other'}</option>
        </select>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        <Button onClick={onNewExpense}>
          <Plus className="w-4 h-4 mr-2" />
          <BilingualLabel enLabel="New Expense" arLabel="مصروف جديد" showBoth={false} />
        </Button>
      </div>
    </div>
  );
};
