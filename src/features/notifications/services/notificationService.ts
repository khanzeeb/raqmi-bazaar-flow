import { apiGateway } from '@/lib/api/gateway';
import { Notification, NotificationFilters, CreateNotificationRequest } from '../types';

const NOTIFICATION_SERVICE_URL = '/notifications';

// Mock data for development
const mockNotifications: Notification[] = [
  { id: '1', user_id: 'user1', type: 'success', category: 'order', title: 'Order Completed', message: 'Order #1234 has been successfully completed', read: false, priority: 'medium', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', user_id: 'user1', type: 'warning', category: 'inventory', title: 'Low Stock Alert', message: 'Product "Widget A" is running low (5 remaining)', read: false, priority: 'high', link: '/products/1', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', user_id: 'user1', type: 'info', category: 'payment', title: 'Payment Received', message: 'Payment of $500 received from Customer ABC', read: true, read_at: new Date().toISOString(), priority: 'medium', created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', user_id: 'user1', type: 'error', category: 'alert', title: 'Invoice Overdue', message: 'Invoice #5678 is 15 days overdue', read: false, priority: 'urgent', link: '/invoices/5678', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', user_id: 'user1', type: 'info', category: 'customer', title: 'New Customer', message: 'John Doe has registered as a new customer', read: true, read_at: new Date().toISOString(), priority: 'low', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString() },
];

class NotificationService {
  async getNotifications(filters?: NotificationFilters) {
    const response = await apiGateway.get<{ data: Notification[]; total: number; page: number; limit: number; totalPages: number }>(
      NOTIFICATION_SERVICE_URL,
      filters as any
    );

    if (!response.success) {
      // Return mock data for development
      const filtered = mockNotifications.filter(n => {
        if (filters?.read !== undefined && n.read !== filters.read) return false;
        if (filters?.category && n.category !== filters.category) return false;
        if (filters?.priority && n.priority !== filters.priority) return false;
        return true;
      });
      return { success: true, data: { data: filtered, total: filtered.length, page: 1, limit: 10, totalPages: 1 } };
    }

    return response;
  }

  async getUnreadCount(userId: string, organizationId?: string) {
    const response = await apiGateway.get<{ unread_count: number }>(
      `${NOTIFICATION_SERVICE_URL}/unread-count`,
      { user_id: userId, organization_id: organizationId }
    );

    if (!response.success) {
      return { success: true, data: { unread_count: mockNotifications.filter(n => !n.read).length } };
    }

    return response;
  }

  async markAsRead(id: string) {
    const response = await apiGateway.patch<Notification>(`${NOTIFICATION_SERVICE_URL}/${id}/read`);
    
    if (!response.success) {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        notification.read_at = new Date().toISOString();
      }
      return { success: true, data: notification };
    }

    return response;
  }

  async markAllAsRead(userId: string, organizationId?: string) {
    const response = await apiGateway.post<{ marked_count: number }>(
      `${NOTIFICATION_SERVICE_URL}/mark-all-read`,
      { user_id: userId, organization_id: organizationId }
    );

    if (!response.success) {
      mockNotifications.forEach(n => { n.read = true; n.read_at = new Date().toISOString(); });
      return { success: true, data: { marked_count: mockNotifications.length } };
    }

    return response;
  }

  async deleteNotification(id: string) {
    return apiGateway.delete<{ deleted: boolean }>(`${NOTIFICATION_SERVICE_URL}/${id}`);
  }

  async createNotification(data: CreateNotificationRequest) {
    return apiGateway.post<Notification>(NOTIFICATION_SERVICE_URL, data);
  }
}

export const notificationService = new NotificationService();
