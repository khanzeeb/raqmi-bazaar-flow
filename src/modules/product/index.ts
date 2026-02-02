// Product Module - Barrel Export
// Provides a single entry point for all product-related functionality

// Page
export { ProductsPage } from './pages';

// Components
export {
  ProductCard,
  ProductDeleteDialog,
  ProductDialog,
  ProductEmptyState,
  ProductLoadingState,
  ProductErrorState,
  ProductFilters,
  ProductGrid,
  ProductHeader,
  ProductStatsCards,
  ProductTable,
  ProductViewDialog,
  type ViewMode,
} from './components';

// Hooks
export {
  useProductsData,
  useProductsActions,
  useProductsStats,
  useProductsState,
} from './hooks';

// Services
export {
  productGateway,
  type Category,
  type UpdateStockRequest,
  type IProductGateway,
} from './services';

// Utils
export {
  exportToCSV,
  downloadFile,
  getStockStatus,
  filterByStatus,
  filterByStock,
  filterProducts,
  toProductView,
  toCreateDTO,
  toUpdateDTO,
  calculateStats,
  toProductViews,
} from './utils';

// Types
export type {
  Product,
  ProductStatus,
  StockStatus,
  ProductDimensions,
  ProductVariant,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters as ProductFiltersType,
  ProductStats,
  ProductView,
} from './types';
