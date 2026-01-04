// Quotation Item Module Types

export interface QuotationItemData {
  id: string;
  quotation_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  current_product_name?: string;
  current_product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItemFilters {
  quotation_id?: string;
  product_id?: string;
}

export interface CreateQuotationItemDTO {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  description?: string;
}

export interface UpdateQuotationItemDTO {
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  description?: string;
}
