import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Truck, Phone, Mail, MapPin } from "lucide-react";
import { Supplier } from "@/types/supplier.types";

interface SupplierCardProps {
  supplier: Supplier;
  isArabic?: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierCard({ supplier, isArabic = false, onEdit, onDelete }: SupplierCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm line-clamp-1">{supplier.name}</h3>
                {supplier.contactPerson && (
                  <p className="text-xs text-muted-foreground">{supplier.contactPerson}</p>
                )}
              </div>
            </div>
            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
              {supplier.status === 'active'
                ? (isArabic ? "نشط" : "Active")
                : (isArabic ? "غير نشط" : "Inactive")}
            </Badge>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            {supplier.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{supplier.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {supplier.address.city ? `${supplier.address.city}, ` : ''}{supplier.address.country}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">{supplier.totalPurchases}</p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "المشتريات" : "Purchases"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {isArabic ? `${supplier.creditLimit} ر.س` : `SAR ${supplier.creditLimit}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "حد الائتمان" : "Credit Limit"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(supplier)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(supplier.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
