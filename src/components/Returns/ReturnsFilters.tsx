import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";

interface ReturnsFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onNewReturn: () => void;
  isArabic: boolean;
}

export const ReturnsFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onNewReturn,
  isArabic
}: ReturnsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
        <Input
          placeholder={isArabic ? "البحث في المرتجعات..." : "Search returns..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={isArabic ? "pr-10" : "pl-10"}
        />
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={isArabic ? "حالة المرتجع" : "Return Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Statuses"}</SelectItem>
            <SelectItem value="pending">{isArabic ? "معلق" : "Pending"}</SelectItem>
            <SelectItem value="approved">{isArabic ? "موافق عليه" : "Approved"}</SelectItem>
            <SelectItem value="completed">{isArabic ? "مكتمل" : "Completed"}</SelectItem>
            <SelectItem value="rejected">{isArabic ? "مرفوض" : "Rejected"}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onNewReturn} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isArabic ? "مرتجع جديد" : "New Return"}
        </Button>
      </div>
    </div>
  );
};
