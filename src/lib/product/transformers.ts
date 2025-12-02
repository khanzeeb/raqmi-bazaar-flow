// Product Transformers - Convert between API and UI formats (DRY)

import { Product, ProductView, CreateProductDTO, UpdateProductDTO, ProductStats } from '@/types/product.types';

// API Product → UI Product View
export const toProductView = (product: Product): ProductView => ({
  id: product.id,
  name: product.name,
  nameAr: product.nameAr || product.name,
  sku: product.sku,
  category: product.category,
  price: product.price,
  stock: product.stock,
  status: product.status === 'discontinued' ? 'inactive' : product.status,
  image: product.image,
  variants: product.variants?.map(v => v.name) || [],
  barcode: product.barcode,
});

// UI Product View → API Create DTO
export const toCreateDTO = (product: Partial<ProductView>, defaults?: Partial<CreateProductDTO>): CreateProductDTO => ({
  name: product.name || '',
  sku: product.sku || '',
  category: product.category || '',
  price: product.price || 0,
  cost: product.price ? product.price * 0.7 : 0, // Default 30% margin
  stock: product.stock || 0,
  min_stock: defaults?.min_stock ?? 5,
  max_stock: defaults?.max_stock ?? 100,
  image: product.image,
  barcode: product.barcode,
  variants: product.variants?.map((name, index) => ({
    name: name || `Option ${index + 1}`,
    price: product.price || 0,
    cost: (product.price || 0) * 0.7,
    stock: product.stock || 0,
  })) || [],
});

// UI Product View → API Update DTO
export const toUpdateDTO = (id: string, product: Partial<ProductView>): UpdateProductDTO => ({
  id,
  ...toCreateDTO(product),
});

// Calculate product stats from list
export const calculateStats = (products: ProductView[]): ProductStats => ({
  total: products.length,
  inStock: products.filter(p => p.stock > 10).length,
  lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
  outOfStock: products.filter(p => p.stock === 0).length,
});

// Transform API products to views (batch)
export const toProductViews = (products: Product[]): ProductView[] => 
  products.map(toProductView);
