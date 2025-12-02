// Product Grid Component (Single Responsibility)

import { ProductCard } from './ProductCard';
import { ProductView } from '@/types/product.types';

interface ProductGridProps {
  products: ProductView[];
  isArabic?: boolean;
  onView: (id: string) => void;
  onEdit: (product: ProductView) => void;
  onDelete: (id: string) => void;
}

// ProductCard expects ProductView which is compatible

export const ProductGrid = ({
  products,
  isArabic = false,
  onView,
  onEdit,
  onDelete,
}: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isArabic={isArabic}
          onView={() => onView(product.id)}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product.id)}
        />
      ))}
    </div>
  );
};
