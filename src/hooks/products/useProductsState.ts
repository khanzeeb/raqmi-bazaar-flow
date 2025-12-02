// useProductsState - Computed state flags
import { useMemo } from 'react';
import { ProductView } from '@/types/product.types';

interface ProductsStateResult {
  hasProducts: boolean;
  isEmpty: boolean;
}

export const useProductsState = (
  products: ProductView[],
  loading: boolean = false
): ProductsStateResult => {
  return useMemo(() => ({
    hasProducts: products.length > 0,
    isEmpty: !loading && products.length === 0,
  }), [products, loading]);
};
