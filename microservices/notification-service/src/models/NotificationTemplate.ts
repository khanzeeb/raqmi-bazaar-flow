import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';

export interface NotificationTemplateData {
  id?: string;
  organization_id?: string;
  name: string;
  code: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title_template: string;
  message_template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotificationTemplateFilters {
  organization_id?: string;
  type?: string;
  category?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class NotificationTemplateRepository extends BaseRepository<NotificationTemplateData, NotificationTemplateFilters> {
  protected tableName = 'notification_templates';

  protected buildFindAllQuery(filters: NotificationTemplateFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    if (filters.organization_id) {
      query.where(function(this: Knex.QueryBuilder) {
        this.where('organization_id', filters.organization_id).orWhereNull('organization_id');
      });
    }
    
    if (filters.type) {
      query.where('type', filters.type);
    }
    
    if (filters.category) {
      query.where('category', filters.category);
    }
    
    if (filters.is_active !== undefined) {
      query.where('is_active', filters.is_active);
    }
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'code', 'title_template']);
    }
    
    this.applySorting(query, filters.sortBy, filters.sortOrder);
    return query;
  }

  protected buildCountQuery(filters: NotificationTemplateFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    if (filters.organization_id) {
      query.where(function(this: Knex.QueryBuilder) {
        this.where('organization_id', filters.organization_id).orWhereNull('organization_id');
      });
    }
    
    if (filters.type) {
      query.where('type', filters.type);
    }
    
    if (filters.category) {
      query.where('category', filters.category);
    }
    
    if (filters.is_active !== undefined) {
      query.where('is_active', filters.is_active);
    }
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['name', 'code', 'title_template']);
    }
    
    return query;
  }

  async findByCode(code: string, organizationId?: string): Promise<NotificationTemplateData | null> {
    let query = this.db(this.tableName).where({ code, is_active: true });
    
    if (organizationId) {
      query.where(function(this: Knex.QueryBuilder) {
        this.where('organization_id', organizationId).orWhereNull('organization_id');
      });
    }
    
    const result = await query.orderBy('organization_id', 'desc').first();
    return result || null;
  }
}

export const notificationTemplateRepository = new NotificationTemplateRepository();
