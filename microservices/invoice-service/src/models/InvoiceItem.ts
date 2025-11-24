export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
  created_at: Date;
  updated_at: Date;
}
