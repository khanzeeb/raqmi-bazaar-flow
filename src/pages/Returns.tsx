import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Plus
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReturnDetailsDialog } from "@/components/Returns/ReturnDetailsDialog";

// Mock data for returns
const mockReturns = [
  {
    id: 1,
    return_number: "RET-202501-0001",
    sale_number: "SALE-202501-0015",
    customer_name: "Ahmed Hassan",
    return_date: "2025-01-03",
    return_type: "partial",
    reason: "defective",
    total_amount: 150.00,
    refund_amount: 150.00,
    status: "completed",
    refund_status: "processed"
  },
  {
    id: 2,
    return_number: "RET-202501-0002",
    sale_number: "SALE-202501-0012",
    customer_name: "Sara Mohamed",
    return_date: "2025-01-02",
    return_type: "full",
    reason: "not_needed",
    total_amount: 320.00,
    refund_amount: 320.00,
    status: "pending",
    refund_status: "pending"
  },
  {
    id: 3,
    return_number: "RET-202501-0003",
    sale_number: "SALE-202501-0008",
    customer_name: "Omar Ali",
    return_date: "2025-01-01",
    return_type: "partial",
    reason: "wrong_item",
    total_amount: 75.00,
    refund_amount: 0.00,
    status: "rejected",
    refund_status: "cancelled"
  }
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800", 
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

const refundStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const typeColors = {
  full: "bg-purple-100 text-purple-800",
  partial: "bg-orange-100 text-orange-800"
};

const reasonLabels = {
  defective: "Defective",
  wrong_item: "Wrong Item",
  not_needed: "Not Needed", 
  damaged: "Damaged",
  other: "Other"
};

export default function Returns() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const filteredReturns = mockReturns.filter(returnItem => {
    const matchesSearch = returnItem.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.sale_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isArabic ? "المرتجعات" : "Returns"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? "إدارة مرتجعات الطلبات" : "Manage order returns and refunds"}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isArabic ? "مرتجع جديد" : "New Return"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={isArabic ? "البحث في المرتجعات..." : "Search returns..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {isArabic ? "قائمة المرتجعات" : "Returns List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? "رقم المرتجع" : "Return #"}</TableHead>
                <TableHead>{isArabic ? "رقم الطلب" : "Order #"}</TableHead>
                <TableHead>{isArabic ? "العميل" : "Customer"}</TableHead>
                <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                <TableHead>{isArabic ? "السبب" : "Reason"}</TableHead>
                <TableHead className="text-right">{isArabic ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">
                    {returnItem.return_number}
                  </TableCell>
                  <TableCell>{returnItem.sale_number}</TableCell>
                  <TableCell>{returnItem.customer_name}</TableCell>
                  <TableCell>{returnItem.return_date}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[returnItem.return_type]}>
                      {isArabic ? 
                        (returnItem.return_type === 'full' ? 'كامل' : 'جزئي') :
                        (returnItem.return_type === 'full' ? 'Full' : 'Partial')
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isArabic ? reasonLabels[returnItem.reason] : reasonLabels[returnItem.reason]}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${returnItem.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[returnItem.status]}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(returnItem.status)}
                        {isArabic ? 
                          (returnItem.status === 'completed' ? 'مكتمل' : 
                           returnItem.status === 'pending' ? 'معلق' : 
                           returnItem.status === 'rejected' ? 'مرفوض' : 'موافق عليه') :
                          returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)
                        }
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReturnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        returnData={selectedReturn}
      />
    </div>
  );
}