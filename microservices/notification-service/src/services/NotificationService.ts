import { notificationRepository, NotificationData, NotificationFilters } from '../models/Notification';
import { notificationTemplateRepository } from '../models/NotificationTemplate';
import { notificationEventService } from '../events';

export interface CreateNotificationDTO {
  user_id: string;
  organization_id?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  category?: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: Date;
}

export interface CreateFromTemplateDTO {
  user_id: string;
  organization_id?: string;
  template_code: string;
  variables: Record<string, string>;
  data?: Record<string, any>;
  link?: string;
  expires_at?: Date;
}

export interface BulkNotificationDTO {
  user_ids: string[];
  organization_id?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  category?: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: Date;
}

class NotificationService {
  async create(data: CreateNotificationDTO): Promise<NotificationData> {
    const notification = await notificationRepository.create({
      user_id: data.user_id,
      organization_id: data.organization_id,
      type: data.type || 'info',
      category: data.category || 'system',
      title: data.title,
      message: data.message,
      data: data.data,
      link: data.link,
      priority: data.priority || 'medium',
      expires_at: data.expires_at,
      read: false,
    });

    // Emit notification created event
    notificationEventService.emitNotificationCreated({
      notification_id: notification.id!,
      user_id: notification.user_id,
      type: notification.type,
      category: notification.category,
      title: notification.title,
      priority: notification.priority,
    });

    return notification;
  }

  async createFromTemplate(data: CreateFromTemplateDTO): Promise<NotificationData | null> {
    const template = await notificationTemplateRepository.findByCode(data.template_code, data.organization_id);
    
    if (!template) {
      return null;
    }

    // Replace variables in template
    let title = template.title_template;
    let message = template.message_template;
    
    Object.entries(data.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return this.create({
      user_id: data.user_id,
      organization_id: data.organization_id,
      type: template.type,
      category: template.category,
      title,
      message,
      data: data.data,
      link: data.link,
      priority: template.priority,
      expires_at: data.expires_at,
    });
  }

  async createBulk(data: BulkNotificationDTO): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    for (const userId of data.user_ids) {
      const notification = await this.create({
        user_id: userId,
        organization_id: data.organization_id,
        type: data.type,
        category: data.category,
        title: data.title,
        message: data.message,
        data: data.data,
        link: data.link,
        priority: data.priority,
        expires_at: data.expires_at,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  async getAll(filters: NotificationFilters) {
    return notificationRepository.findAll(filters);
  }

  async getById(id: string): Promise<NotificationData | null> {
    return notificationRepository.findById(id);
  }

  async markAsRead(id: string): Promise<NotificationData | null> {
    const notification = await notificationRepository.markAsRead(id);
    
    if (notification) {
      notificationEventService.emitNotificationRead({
        notification_id: notification.id!,
        user_id: notification.user_id,
      });
    }

    return notification;
  }

  async markAllAsRead(userId: string, organizationId?: string): Promise<number> {
    return notificationRepository.markAllAsRead(userId, organizationId);
  }

  async getUnreadCount(userId: string, organizationId?: string): Promise<number> {
    return notificationRepository.getUnreadCount(userId, organizationId);
  }

  async delete(id: string): Promise<boolean> {
    return notificationRepository.delete(id);
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    return notificationRepository.deleteOldNotifications(daysOld);
  }
}

export default new NotificationService();
