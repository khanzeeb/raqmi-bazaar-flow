// Category Mapper Interface - Single Responsibility: Contract for category data mapping

import { ICategoryData } from '../data';

export interface ICategoryMapper {
  /**
   * Map database entity to category data
   */
  toCategoryData(item: any): ICategoryData;

  /**
   * Map category data to database format for create
   */
  toDatabase(data: any): any;

  /**
   * Map category data to database format for update
   */
  toDatabaseUpdate(data: any): any;
}
