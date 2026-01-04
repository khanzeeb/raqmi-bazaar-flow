# Quotation Service - Modular Feature Structure

This service has been restructured to use a modular feature-based architecture for better maintainability and scalability.

## Directory Structure

```
src/
├── modules/                    # Feature modules
│   ├── index.ts               # Central barrel export
│   ├── quotation/             # Quotation feature module
│   │   ├── index.ts           # Feature barrel export
│   │   ├── quotation.controller.ts
│   │   ├── quotation.service.ts
│   │   ├── quotation.repository.ts
│   │   ├── quotation.routes.ts
│   │   ├── quotation.validator.ts
│   │   ├── quotation.mapper.ts
│   │   └── quotation.types.ts
│   └── quotation-item/        # Quotation Item feature module
│       ├── index.ts
│       ├── quotation-item.repository.ts
│       ├── quotation-item.mapper.ts
│       └── quotation-item.types.ts
├── common/                     # Shared base classes
│   ├── BaseController.ts
│   ├── BaseService.ts
│   └── BaseRepository.ts
├── config/                     # Configuration
├── interfaces/                 # Shared interfaces
├── middleware/                 # Express middleware
├── validators/                 # Base validators
├── migrations/                 # Database migrations
└── server.ts                   # Application entry point
```

## Module Structure

Each feature module follows a consistent structure:

- **types**: Type definitions and DTOs
- **controller**: HTTP request handlers
- **service**: Business logic
- **repository**: Data access layer
- **validator**: Request validation
- **mapper**: Data transformation
- **routes**: Express routes

## Usage

Import from the centralized module exports:

```typescript
// Import everything from a module
import { QuotationService, QuotationRepository, QuotationData } from './modules/quotation';

// Or import from the central barrel
import { QuotationService, QuotationItemMapper } from './modules';
```

## Benefits

1. **Encapsulation**: Each feature is self-contained
2. **Maintainability**: Easy to find and modify related code
3. **Scalability**: New features follow the same pattern
4. **Testing**: Easier to test individual modules
5. **Separation of Concerns**: Clear boundaries between features
