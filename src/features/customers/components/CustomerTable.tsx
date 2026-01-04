import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Customer } from "@/types/customer.types";

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  isArabic: boolean;
}

export const CustomerTable = ({ customers, onView, onEdit, onDelete, isArabic }: CustomerTableProps) => {
  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-700">{isArabic ? `رصيد ${balance} ر.س` : `Credit SAR ${balance}`}</Badge>;
    } else if (balance < 0) {
      return <Badge variant="secondary" className="bg-red-500/10 text-red-700">{isArabic ? `مستحق ${Math.abs(balance)} ر.س` : `Due SAR ${Math.abs(balance)}`}</Badge>;
    }
    return <Badge variant="secondary">{isArabic ? "متوازن" : "Balanced"}</Badge>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{isArabic ? "العميل" : "Customer"}</TableHead>
          <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
          <TableHead>{isArabic ? "الاتصال" : "Contact"}</TableHead>
          <TableHead>{isArabic ? "الرصيد" : "Balance"}</TableHead>
          <TableHead>{isArabic ? "إجمالي الطلبات" : "Total Orders"}</TableHead>
          <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">
              <div>
                <p>{isArabic ? customer.nameAr : customer.name}</p>
                <div className="flex gap-1 mt-1">
                  {customer.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {customer.customerType === 'business' ? (isArabic ? "شركة" : "Business") : (isArabic ? "فرد" : "Individual")}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{customer.email}</div>
                <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{customer.phone}</div>
              </div>
            </TableCell>
            <TableCell>{getBalanceBadge(customer.balance)}</TableCell>
            <TableCell>{customer.totalOrders}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
