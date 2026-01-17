import { notificationTemplateRepository, NotificationTemplateData, NotificationTemplateFilters } from '../models/NotificationTemplate';

export interface CreateTemplateDTO {
  organization_id?: string;
  name: string;
  code: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  category?: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title_template: string;
  message_template: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_active?: boolean;
}

export interface UpdateTemplateDTO {
  name?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  category?: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title_template?: string;
  message_template?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_active?: boolean;
}

class NotificationTemplateService {
  async create(data: CreateTemplateDTO): Promise<NotificationTemplateData> {
    return notificationTemplateRepository.create({
      organization_id: data.organization_id,
      name: data.name,
      code: data.code,
      type: data.type || 'info',
      category: data.category || 'system',
      title_template: data.title_template,
      message_template: data.message_template,
      priority: data.priority || 'medium',
      is_active: data.is_active !== false,
    });
  }

  async getAll(filters: NotificationTemplateFilters) {
    return notificationTemplateRepository.findAll(filters);
  }

  async getById(id: string): Promise<NotificationTemplateData | null> {
    return notificationTemplateRepository.findById(id);
  }

  async getByCode(code: string, organizationId?: string): Promise<NotificationTemplateData | null> {
    return notificationTemplateRepository.findByCode(code, organizationId);
  }

  async update(id: string, data: UpdateTemplateDTO): Promise<NotificationTemplateData | null> {
    return notificationTemplateRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return notificationTemplateRepository.delete(id);
  }
}

export default new NotificationTemplateService();
