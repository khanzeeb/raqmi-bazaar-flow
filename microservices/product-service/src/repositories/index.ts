// Repository Barrel Export - Single source of truth for repositories

// Interfaces
export * from './IBaseRepository';
export * from './IProductRepository';
export * from './ICategoryRepository';
export * from './IVariantRepository';
export * from './IStockMovementRepository';

// Base
export { BaseRepository, IPaginatedResponse, IBaseFilters } from './BaseRepository';

// Implementations
export { ProductRepository, default as productRepository } from './ProductRepository';
export { CategoryRepository, default as categoryRepository } from './CategoryRepository';
export { VariantRepository, default as variantRepository } from './VariantRepository';
export { StockMovementRepository, default as stockMovementRepository } from './StockMovementRepository';
