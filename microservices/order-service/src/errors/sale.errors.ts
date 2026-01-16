/**
 * Custom Errors for Sale Operations
 * Single Responsibility: Define domain-specific errors
 */

export class InventoryValidationError extends Error {
  public readonly unavailable_items?: Array<{
    product_id: string;
    product_name?: string;
    requested_quantity: number;
    available_quantity: number;
  }>;

  constructor(message: string, unavailableItems?: InventoryValidationError['unavailable_items']) {
    super(message);
    this.name = 'InventoryValidationError';
    this.unavailable_items = unavailableItems;
    Object.setPrototypeOf(this, InventoryValidationError.prototype);
  }
}

export class SaleNotFoundError extends Error {
  constructor(saleId: string) {
    super(`Sale not found: ${saleId}`);
    this.name = 'SaleNotFoundError';
    Object.setPrototypeOf(this, SaleNotFoundError.prototype);
  }
}

export class SaleStatusError extends Error {
  constructor(message: string, public readonly currentStatus: string) {
    super(message);
    this.name = 'SaleStatusError';
    Object.setPrototypeOf(this, SaleStatusError.prototype);
  }
}

export class PaymentError extends Error {
  constructor(message: string, public readonly saleId: string) {
    super(message);
    this.name = 'PaymentError';
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}
