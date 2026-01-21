// Stock Movement Mapper Interface - Single Responsibility: Contract for stock movement data mapping

import { IStockMovementData } from '../data';

export interface IStockMovementMapper {
  /**
   * Map database entity to stock movement data
   */
  toStockMovementData(item: any): IStockMovementData;

  /**
   * Map stock movement data to database format for create
   */
  toDatabase(data: any): any;
}
