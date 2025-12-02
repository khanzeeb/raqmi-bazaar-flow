// useProductsStats - Computed statistics
import { useMemo } from 'react';
import { ProductView, ProductStats } from '@/types/product.types';
import { calculateStats } from '@/lib/product/transformers';

export const useProductsStats = (products: ProductView[]): ProductStats => {
  return useMemo(() => calculateStats(products), [products]);
};
