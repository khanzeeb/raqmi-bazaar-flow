import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, User, Building, Phone, Mail, MapPin, Plus } from "lucide-react";
import { Customer } from "@/types/customer.types";

interface CustomerCardProps {
  customer: Customer;
  isArabic?: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onNewPayment?: (customer: Customer) => void;
}

export function CustomerCard({ customer, isArabic = false, onEdit, onDelete, onNewPayment }: CustomerCardProps) {
  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="secondary" className="bg-success/10 text-success">{isArabic ? `رصيد ${balance} ر.س` : `Credit SAR ${balance}`}</Badge>;
    } else if (balance < 0) {
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive">{isArabic ? `مستحق ${Math.abs(balance)} ر.س` : `Due SAR ${Math.abs(balance)}`}</Badge>;
    }
    return <Badge variant="secondary">{isArabic ? "متوازن" : "Balanced"}</Badge>;
  };

  const getCustomerTypeIcon = (type: string) => {
    return type === 'business' ? Building : User;
  };

  const CustomerTypeIcon = getCustomerTypeIcon(customer.customerType);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Customer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <CustomerTypeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm line-clamp-1">
                  {isArabic ? customer.nameAr : customer.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {customer.customerType === 'business' 
                    ? (isArabic ? "شركة" : "Business")
                    : (isArabic ? "فرد" : "Individual")
                  }
                </Badge>
              </div>
            </div>
            {getBalanceBadge(customer.balance)}
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {customer.billingAddress.city}, {customer.billingAddress.country}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">{customer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "الطلبات" : "Orders"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {isArabic ? `${customer.lifetimeValue} ر.س` : `SAR ${customer.lifetimeValue}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "القيمة الإجمالية" : "Lifetime Value"}
              </p>
            </div>
          </div>

          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {customer.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {customer.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Last Order */}
          {customer.lastOrderDate && (
            <div className="text-xs text-muted-foreground">
              <span>
                {isArabic ? "آخر طلب: " : "Last order: "}
                {new Date(customer.lastOrderDate).toLocaleDateString(
                  isArabic ? 'ar-SA' : 'en-US'
                )}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}>
              <Edit className="h-4 w-4" />
            </Button>
            {onNewPayment && (
              <Button variant="ghost" size="sm" onClick={() => onNewPayment(customer)}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDelete(customer.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}