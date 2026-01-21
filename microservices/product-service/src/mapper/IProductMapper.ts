// Product Mapper Interface - Single Responsibility: Contract for product data mapping

import { IProductData, IProductVariantData } from '../data';

export interface IProductMapper {
  /**
   * Map database entity to product data
   */
  toProductData(item: any): IProductData;

  /**
   * Map database entity to variant data
   */
  toVariantData(item: any): IProductVariantData;

  /**
   * Map product data to database format for create
   */
  toDatabase(data: any): any;

  /**
   * Map product data to database format for update
   */
  toDatabaseUpdate(data: any): any;
}
