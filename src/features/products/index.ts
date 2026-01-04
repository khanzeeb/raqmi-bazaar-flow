// Products Feature Module - Barrel Export
// Provides a single entry point for all product-related functionality

// Components
export { ProductCard } from './components/ProductCard';
export { ProductDeleteDialog } from './components/ProductDeleteDialog';
export { ProductDialog } from './components/ProductDialog';
export { ProductEmptyState } from './components/ProductEmptyState';
export { ProductFilters as ProductFiltersComponent, type ViewMode } from './components/ProductFilters';
export { ProductGrid } from './components/ProductGrid';
export { ProductHeader } from './components/ProductHeader';
export { ProductStatsCards } from './components/ProductStats';
export { ProductTable } from './components/ProductTable';
export { ProductViewDialog } from './components/ProductViewDialog';

// Hooks
export { useProductsData } from './hooks/useProductsData';
export { useProductsActions } from './hooks/useProductsActions';
export { useProductsStats } from './hooks/useProductsStats';
export { useProductsState } from './hooks/useProductsState';

// Services
export { productGateway } from './services/product.gateway';

// Types
export type {
  Product,
  ProductStatus,
  StockStatus,
  ProductDimensions,
  ProductVariant,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  ProductStats,
  ProductView
} from './types';
