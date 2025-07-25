import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
  variants?: string[];
  barcode?: string;
}

interface ProductCardProps {
  product: Product;
  isArabic?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, isArabic = false, onEdit, onDelete }: ProductCardProps) {
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">{isArabic ? "نفد المخزون" : "Out of Stock"}</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">{isArabic ? "مخزون منخفض" : "Low Stock"}</Badge>;
    }
    return <Badge variant="secondary" className="bg-success/10 text-success">{isArabic ? "متوفر" : "In Stock"}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Image Placeholder */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {product.image ? (
              <img 
                src={product.image} 
                alt={isArabic ? product.nameAr : product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">
                {isArabic ? product.nameAr : product.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{product.category}</span>
              {getStockBadge(product.stock)}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">
                  {isArabic ? `${product.price} ر.س` : `SAR ${product.price}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? `المخزون: ${product.stock}` : `Stock: ${product.stock}`}
                </p>
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.variants.slice(0, 3).map((variant, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {variant}
                  </Badge>
                ))}
                {product.variants.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.variants.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}