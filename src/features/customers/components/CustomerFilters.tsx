import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Upload, Download, Plus, Grid3x3, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddCustomer: () => void;
  isArabic: boolean;
}

export const CustomerFilters = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddCustomer,
  isArabic
}: CustomerFiltersProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={isArabic ? "البحث في العملاء..." : "Search customers..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
              {isArabic ? "استيراد" : "Import"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              {isArabic ? "استيراد من Excel" : "Import from Excel"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              {isArabic ? "استيراد من CSV" : "Import from CSV"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير" : "Export"}
        </Button>
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {isArabic ? "تصفية" : "Filter"}
        </Button>
        
        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-l-none"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
        
        <Button onClick={onAddCustomer} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? "عميل جديد" : "Add Customer"}
        </Button>
      </div>
    </div>
  );
};
