// Stock Movement Mapper Implementation - Single Responsibility: Stock movement data transformation

import { IStockMovementData } from '../data';
import { IStockMovementMapper } from './IStockMovementMapper';

export class StockMovementMapper implements IStockMovementMapper {
  /**
   * Map database entity to stock movement data
   */
  toStockMovementData(item: any): IStockMovementData {
    return {
      id: item.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      type: item.type,
      quantity: item.quantity,
      reason: item.reason,
      reference_id: item.reference_id,
      reference_type: item.reference_type,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Map stock movement data to database format for create
   */
  toDatabase(data: any): any {
    return {
      product_id: data.product_id,
      product_variant_id: data.product_variant_id,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      reference_id: data.reference_id,
      reference_type: data.reference_type
    };
  }
}
