// useProductsStats - Computed statistics
import { useMemo } from 'react';
import { ProductView, ProductStats, Product } from '../types';

// Helper to calculate stats from products
const calculateStats = (products: (ProductView | Product)[]): ProductStats => {
  // For ProductView, we don't have min_stock, so use simple stock > 0 logic
  const hasMinStock = products.length > 0 && 'min_stock' in products[0];
  
  return {
    total: products.length,
    inStock: hasMinStock 
      ? products.filter(p => (p as Product).stock > (p as Product).min_stock).length
      : products.filter(p => p.stock > 0).length,
    lowStock: hasMinStock
      ? products.filter(p => (p as Product).stock > 0 && (p as Product).stock <= (p as Product).min_stock).length
      : products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };
};

export const useProductsStats = (products: ProductView[] | Product[]): ProductStats => {
  return useMemo(() => calculateStats(products), [products]);
};

export default useProductsStats;
