// Customers Feature Module - Barrel Export
// Provides a single entry point for all customer-related functionality

// Components
export { CustomerCard } from './components/CustomerCard';
export { CustomerDialog } from './components/CustomerDialog';
export { CustomerFilters as CustomerFiltersComponent } from './components/CustomerFilters';
export { CustomerStats as CustomerStatsComponent } from './components/CustomerStats';
export { CustomerTable } from './components/CustomerTable';

// Hooks
export { useCustomersData } from './hooks/useCustomersData';
export { useCustomersActions } from './hooks/useCustomersActions';
export { useCustomersFiltering } from './hooks/useCustomersFiltering';
export { useCustomersStats } from './hooks/useCustomersStats';

// Types
export type {
  Customer,
  CustomerFilters,
  CustomerStats,
  CreateCustomerDTO,
  UpdateCustomerDTO
} from './types';
