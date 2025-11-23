export interface PurchaseItemData {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  received_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseItemDTO {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  received_quantity: number;
  created_at: string;
  updated_at: string;
}
