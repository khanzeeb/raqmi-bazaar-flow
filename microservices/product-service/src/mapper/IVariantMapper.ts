// Variant Mapper Interface - Single Responsibility: Contract for variant data mapping

import { IProductVariantData } from '../data';

export interface IVariantMapper {
  /**
   * Map database entity to variant data
   */
  toVariantData(item: any): IProductVariantData;

  /**
   * Map variant data to database format for create
   */
  toDatabase(data: any): any;

  /**
   * Map variant data to database format for update
   */
  toDatabaseUpdate(data: any): any;
}
