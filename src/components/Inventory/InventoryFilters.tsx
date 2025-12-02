import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Plus } from "lucide-react";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  categories: string[];
  isArabic: boolean;
}

export const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  isArabic
}: InventoryFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
        <Input
          placeholder={isArabic ? "البحث بالمنتج أو الرمز أو المورد..." : "Search by product, SKU, or supplier..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
          <option value="in_stock">{isArabic ? 'متوفر' : 'In Stock'}</option>
          <option value="low_stock">{isArabic ? 'مخزون قليل' : 'Low Stock'}</option>
          <option value="out_of_stock">{isArabic ? 'نفد المخزون' : 'Out of Stock'}</option>
        </select>
        
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="sm">
          <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
          {isArabic ? 'تصدير' : 'Export'}
        </Button>
        
        <Button size="sm">
          <Plus className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
          {isArabic ? 'إضافة منتج' : 'Add Product'}
        </Button>
      </div>
    </div>
  );
};
