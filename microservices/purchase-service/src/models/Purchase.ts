export interface PurchaseData {
  id: string;
  purchase_number: string;
  supplier_id: string;
  purchase_date: Date;
  expected_delivery_date?: Date;
  received_date?: Date;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  terms_conditions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseDTO {
  id: string;
  purchase_number: string;
  supplier_id: string;
  purchase_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  notes?: string;
  terms_conditions?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseFilter {
  status?: string;
  payment_status?: string;
  supplier_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
