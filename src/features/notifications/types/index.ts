export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: string;
  link?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  updated_at: string;
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
}

export interface CreateNotificationRequest {
  user_id: string;
  organization_id?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  category?: 'order' | 'payment' | 'inventory' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
}
