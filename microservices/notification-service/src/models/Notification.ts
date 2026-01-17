import { Knex } from 'knex';
import { BaseRepository } from '../common/BaseRepository';

export interface NotificationData {
  id?: string;
  user_id: string;
  organization_id?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: Date;
  link?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotificationFilters {
  user_id?: string;
  organization_id?: string;
  type?: string;
  category?: string;
  read?: boolean;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class NotificationRepository extends BaseRepository<NotificationData, NotificationFilters> {
  protected tableName = 'notifications';

  protected buildFindAllQuery(filters: NotificationFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName);
    
    if (filters.user_id) {
      query.where('user_id', filters.user_id);
    }
    
    if (filters.organization_id) {
      query.where('organization_id', filters.organization_id);
    }
    
    if (filters.type) {
      query.where('type', filters.type);
    }
    
    if (filters.category) {
      query.where('category', filters.category);
    }
    
    if (filters.read !== undefined) {
      query.where('read', filters.read);
    }
    
    if (filters.priority) {
      query.where('priority', filters.priority);
    }
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['title', 'message']);
    }
    
    // Filter out expired notifications
    query.where(function(this: Knex.QueryBuilder) {
      this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
    });
    
    this.applySorting(query, filters.sortBy, filters.sortOrder);
    return query;
  }

  protected buildCountQuery(filters: NotificationFilters): Knex.QueryBuilder {
    let query = this.db(this.tableName).count('* as count');
    
    if (filters.user_id) {
      query.where('user_id', filters.user_id);
    }
    
    if (filters.organization_id) {
      query.where('organization_id', filters.organization_id);
    }
    
    if (filters.type) {
      query.where('type', filters.type);
    }
    
    if (filters.category) {
      query.where('category', filters.category);
    }
    
    if (filters.read !== undefined) {
      query.where('read', filters.read);
    }
    
    if (filters.priority) {
      query.where('priority', filters.priority);
    }
    
    if (filters.search) {
      this.applySearchFilter(query, filters.search, ['title', 'message']);
    }
    
    query.where(function(this: Knex.QueryBuilder) {
      this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
    });
    
    return query;
  }

  async markAsRead(id: string): Promise<NotificationData | null> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update({
        read: true,
        read_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return result || null;
  }

  async markAllAsRead(userId: string, organizationId?: string): Promise<number> {
    let query = this.db(this.tableName)
      .where({ user_id: userId, read: false });
    
    if (organizationId) {
      query.where('organization_id', organizationId);
    }
    
    return await query.update({
      read: true,
      read_at: new Date(),
      updated_at: new Date()
    });
  }

  async getUnreadCount(userId: string, organizationId?: string): Promise<number> {
    let query = this.db(this.tableName)
      .where({ user_id: userId, read: false })
      .count('* as count');
    
    if (organizationId) {
      query.where('organization_id', organizationId);
    }
    
    query.where(function(this: Knex.QueryBuilder) {
      this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
    });
    
    const result = await query.first();
    return parseInt(result?.count as string) || 0;
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return await this.db(this.tableName)
      .where('created_at', '<', cutoffDate)
      .where('read', true)
      .del();
  }
}

export const notificationRepository = new NotificationRepository();
