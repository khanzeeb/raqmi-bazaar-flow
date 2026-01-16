/**
 * Inventory Data Transfer Objects
 * Single Responsibility: Define data structures for inventory operations
 */

export interface InventoryCheckItemDTO {
  product_id: string;
  quantity: number;
  product_name?: string;
}

export interface InventoryCheckResultDTO {
  product_id: string;
  requested_quantity: number;
  available_quantity: number;
  is_available: boolean;
}

export interface InventoryCheckResponseDTO {
  success: boolean;
  available: boolean;
  items: InventoryCheckResultDTO[];
  errors?: string[];
}

export interface InventoryReserveRequestDTO {
  sale_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface InventoryReserveResponseDTO {
  success: boolean;
  reservation_id?: string;
  items?: Array<{
    product_id: string;
    reserved_quantity: number;
  }>;
  errors?: string[];
}

export interface InventoryReleaseRequestDTO {
  reservation_id: string;
  sale_id?: string;
}

export interface InventoryValidationResultDTO {
  success: boolean;
  reservation_id?: string;
  items: InventoryCheckItemDTO[];
  unavailable_items?: Array<{
    product_id: string;
    product_name?: string;
    requested_quantity: number;
    available_quantity: number;
  }>;
}
