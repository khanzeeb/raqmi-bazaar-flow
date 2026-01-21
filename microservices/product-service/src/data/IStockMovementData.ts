// Stock Movement Data Interface - Single Responsibility: Stock movement entity types only

import { MovementType } from '@prisma/client';

export interface IStockMovementData {
  id: string;
  product_id?: string | null;
  product_variant_id?: string | null;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IMovementSummary {
  type: MovementType;
  total: number;
}
