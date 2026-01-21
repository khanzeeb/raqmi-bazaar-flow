// Category Repository Interface - Single Responsibility: Category data access contract

import { IBaseRepository } from './IBaseRepository';
import { ICategoryData } from '../data';
import { ICategoryFilters } from '../filters';

export interface ICategoryRepository extends IBaseRepository<ICategoryData, ICategoryFilters> {
  getTree(): Promise<ICategoryData[]>;
}
