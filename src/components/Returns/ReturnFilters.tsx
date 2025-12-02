import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";

interface ReturnFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onNewReturn: () => void;
  isArabic: boolean;
}

export const ReturnFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onNewReturn,
  isArabic
}: ReturnFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isArabic ? "البحث في المرتجعات..." : "Search returns..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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
        </div>
      </CardContent>
    </Card>
  );
};
