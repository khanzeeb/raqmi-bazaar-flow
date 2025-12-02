import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RotateCcw, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Return } from "@/types/return.types";

interface ReturnsTableViewProps {
  returns: Return[];
  isArabic: boolean;
  onViewDetails: (returnItem: Return) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800", 
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

const typeColors: Record<string, string> = {
  full: "bg-purple-100 text-purple-800",
  partial: "bg-orange-100 text-orange-800"
};

const reasonLabels: Record<string, { en: string; ar: string }> = {
  defective: { en: "Defective", ar: "معيب" },
  wrong_item: { en: "Wrong Item", ar: "منتج خاطئ" },
  not_needed: { en: "Not Needed", ar: "غير مطلوب" },
  damaged: { en: "Damaged", ar: "تالف" },
  other: { en: "Other", ar: "أخرى" }
};

const statusLabels: Record<string, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "معلق" },
  approved: { en: "Approved", ar: "موافق عليه" },
  completed: { en: "Completed", ar: "مكتمل" },
  rejected: { en: "Rejected", ar: "مرفوض" }
};

export const ReturnsTableView = ({ returns, isArabic, onViewDetails }: ReturnsTableViewProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
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
            {returns.map((returnItem) => (
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
                  {isArabic ? reasonLabels[returnItem.reason]?.ar : reasonLabels[returnItem.reason]?.en}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${returnItem.total_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[returnItem.status]}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(returnItem.status)}
                      {isArabic ? statusLabels[returnItem.status]?.ar : statusLabels[returnItem.status]?.en}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(returnItem)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {returns.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  {isArabic ? "لا توجد مرتجعات" : "No returns found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
