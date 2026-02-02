// Product Filters - Client-side filtering logic

import { ProductView, StockStatus } from '../types';

export const getStockStatus = (stock: number, threshold: number = 10): StockStatus => {
  if (stock === 0) return 'out-of-stock';
  if (stock <= threshold) return 'low-stock';
  return 'in-stock';
};

export const filterByStatus = (products: ProductView[], status: string): ProductView[] => {
  if (status === 'all') return products;
  return products.filter(p => p.status === status);
};

export const filterByStock = (products: ProductView[], stockStatus: string, threshold: number = 10): ProductView[] => {
  if (stockStatus === 'all') return products;
  
  return products.filter(product => {
    const status = getStockStatus(product.stock, threshold);
    return status === stockStatus;
  });
};

export const filterProducts = (
  products: ProductView[], 
  filters: { status?: string; stockStatus?: string }
): ProductView[] => {
  let result = products;
  
  if (filters.status && filters.status !== 'all') {
    result = filterByStatus(result, filters.status);
  }
  
  if (filters.stockStatus && filters.stockStatus !== 'all') {
    result = filterByStock(result, filters.stockStatus);
  }
  
  return result;
};
