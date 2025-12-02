import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Return } from "@/types/return.types";

interface ReturnsTableProps {
  returns: Return[];
  onView: (returnItem: Return) => void;
  isArabic: boolean;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
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

export const ReturnsTable = ({ returns, onView, isArabic }: ReturnsTableProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
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
            <TableCell className="font-medium">{returnItem.return_number}</TableCell>
            <TableCell>{returnItem.sale_number}</TableCell>
            <TableCell>{returnItem.customer_name}</TableCell>
            <TableCell>{returnItem.return_date}</TableCell>
            <TableCell>
              <Badge className={typeColors[returnItem.return_type]}>
                {isArabic ? (returnItem.return_type === 'full' ? 'كامل' : 'جزئي') : (returnItem.return_type === 'full' ? 'Full' : 'Partial')}
              </Badge>
            </TableCell>
            <TableCell>{reasonLabels[returnItem.reason]}</TableCell>
            <TableCell className="text-right font-medium">${returnItem.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge className={statusColors[returnItem.status]}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(returnItem.status)}
                  {isArabic ? (returnItem.status === 'completed' ? 'مكتمل' : returnItem.status === 'pending' ? 'معلق' : returnItem.status === 'rejected' ? 'مرفوض' : 'موافق عليه') : returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                </div>
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => onView(returnItem)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
