# Frontend Architecture Guide

This document describes the modular architecture and best practices for the frontend codebase.

## Directory Structure

```
src/
├── features/           # Feature modules (primary organization)
│   └── {feature}/
│       ├── components/ # Feature-specific UI components
│       ├── hooks/      # Feature-specific hooks
│       ├── services/   # API gateways and external services
│       ├── types/      # Feature-specific types
│       └── index.ts    # Barrel export
├── components/         # Shared/legacy components (re-exports to features)
│   ├── ui/            # shadcn/ui components
│   ├── common/        # Shared reusable components
│   └── Layout/        # Layout components
├── hooks/             # Shared hooks and legacy re-exports
├── lib/               # Shared utilities
│   ├── api/          # API utilities (base-gateway, error-handler)
│   ├── hooks/        # Reusable hook utilities
│   └── toast.ts      # Unified toast system
├── services/          # Legacy services (re-exports to features)
├── types/             # Shared type definitions
└── pages/             # Page components
```

## Feature Module Pattern

Each feature follows a consistent structure:

### 1. Barrel Export (`index.ts`)
```typescript
// Feature Module - Barrel Export
export { Component } from './components/Component';
export { useFeatureData } from './hooks/useFeatureData';
export { featureGateway } from './services/feature.gateway';
export type { FeatureType } from './types';
```

### 2. Hook Pattern
Features use a standardized hook pattern:
- `use{Entity}Data` - Data fetching and state management
- `use{Entity}Actions` - CRUD operations
- `use{Entity}Filtering` - Search and filter logic
- `use{Entity}Stats` - Computed statistics

### 3. Gateway Pattern
API gateways implement consistent interfaces using base utilities:
```typescript
import { ICRUDGateway, createCRUDGateway } from '@/lib/api/base-gateway';

export const featureGateway: ICRUDGateway<Entity, CreateDTO, UpdateDTO, Filters> = {
  // Standard CRUD methods
};
```

## Shared Utilities

### Hook Utilities (`src/lib/hooks/`)
- `useAsyncAction` - Handle async operations with loading/error states
- `usePaginatedData` - Paginated data fetching with search/filters
- `useEntityCRUD` - Generic CRUD operations
- `useFiltering` - Local filtering and search

### API Utilities (`src/lib/api/`)
- `base-gateway` - Gateway factory and utilities
- `error-handler` - Centralized error handling

### Toast (`src/lib/toast.ts`)
Unified toast notifications:
```typescript
import { showToast } from '@/lib/toast';

showToast.success('Operation completed');
showToast.error('Something went wrong');
showToast.info('FYI message');
```

## Best Practices

### 1. Imports
- Import from feature barrel exports: `import { ProductCard } from '@/features/products'`
- Use shared utilities: `import { showToast } from '@/lib/toast'`
- Avoid importing directly from deep paths when barrel exports exist

### 2. State Management
- Use hooks for local component state
- Use context for app-wide state (auth, organization, settings)
- Use the standardized hook patterns for data fetching

### 3. Error Handling
- Use `showToast.error()` for user-facing errors
- Use `errorHandler` for logging and tracking
- Handle errors at the hook level, not in components

### 4. Types
- Feature-specific types go in `features/{feature}/types/`
- Shared types go in `src/types/`
- Export types from barrel files

## Migration Guide

When adding new features:
1. Create feature folder: `src/features/{feature-name}/`
2. Add standard subfolders: `components/`, `hooks/`, `services/`, `types/`
3. Create barrel export `index.ts`
4. Implement hooks using base utilities from `@/lib/hooks/`
5. Add gateway using patterns from `@/lib/api/base-gateway`
