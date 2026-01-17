// Settings Gateway - API integration for settings operations
import { ApiResponse } from '@/types/api';
import { CompanyInfo, NotificationSettings, SecuritySettings } from '@/types/settings.types';

const API_BASE_URL = import.meta.env.VITE_SETTINGS_SERVICE_URL || 'http://localhost:3012';

export interface Settings {
  company: CompanyInfo;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

interface BackendCompanyInfo {
  name: string;
  name_ar?: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  cr_number: string;
  website?: string;
  logo_url?: string;
}

interface BackendNotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  browser_notifications: boolean;
  sales_alerts: boolean;
  low_stock_alerts: boolean;
  payment_reminders: boolean;
}

interface BackendSecuritySettings {
  two_factor_auth: boolean;
  session_timeout: number;
  password_expiry: number;
  login_notifications: boolean;
}

const transformCompanyInfo = (data: BackendCompanyInfo): CompanyInfo => ({
  name: data.name,
  nameAr: data.name_ar || '',
  email: data.email,
  phone: data.phone,
  address: data.address,
  taxId: data.tax_id,
  crNumber: data.cr_number,
  website: data.website
});

const transformNotifications = (data: BackendNotificationSettings): NotificationSettings => ({
  emailNotifications: data.email_notifications,
  smsNotifications: data.sms_notifications,
  browserNotifications: data.browser_notifications,
  salesAlerts: data.sales_alerts,
  lowStockAlerts: data.low_stock_alerts,
  paymentReminders: data.payment_reminders
});

const transformSecurity = (data: BackendSecuritySettings): SecuritySettings => ({
  twoFactorAuth: data.two_factor_auth,
  sessionTimeout: data.session_timeout,
  passwordExpiry: data.password_expiry,
  loginNotifications: data.login_notifications
});

const companyToBackend = (data: Partial<CompanyInfo>) => ({
  name: data.name,
  name_ar: data.nameAr,
  email: data.email,
  phone: data.phone,
  address: data.address,
  tax_id: data.taxId,
  cr_number: data.crNumber,
  website: data.website
});

const notificationsToBackend = (data: Partial<NotificationSettings>) => ({
  email_notifications: data.emailNotifications,
  sms_notifications: data.smsNotifications,
  browser_notifications: data.browserNotifications,
  sales_alerts: data.salesAlerts,
  low_stock_alerts: data.lowStockAlerts,
  payment_reminders: data.paymentReminders
});

const securityToBackend = (data: Partial<SecuritySettings>) => ({
  two_factor_auth: data.twoFactorAuth,
  session_timeout: data.sessionTimeout,
  password_expiry: data.passwordExpiry,
  login_notifications: data.loginNotifications
});

export interface ISettingsGateway {
  getAll(): Promise<ApiResponse<Settings>>;
  getCompanyInfo(): Promise<ApiResponse<CompanyInfo>>;
  updateCompanyInfo(data: Partial<CompanyInfo>): Promise<ApiResponse<CompanyInfo>>;
  getNotificationSettings(): Promise<ApiResponse<NotificationSettings>>;
  updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>>;
  getSecuritySettings(): Promise<ApiResponse<SecuritySettings>>;
  updateSecuritySettings(data: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>>;
}

export const settingsGateway: ISettingsGateway = {
  async getAll(): Promise<ApiResponse<Settings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Return default settings if API not available
        return { 
          success: true, 
          data: {
            company: {
              name: '',
              nameAr: '',
              email: '',
              phone: '',
              address: '',
              taxId: '',
              crNumber: '',
              website: ''
            },
            notifications: {
              emailNotifications: true,
              smsNotifications: false,
              browserNotifications: true,
              salesAlerts: true,
              lowStockAlerts: true,
              paymentReminders: true
            },
            security: {
              twoFactorAuth: false,
              sessionTimeout: 30,
              passwordExpiry: 90,
              loginNotifications: true
            }
          }
        };
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success !== false && result.data) {
        return { 
          success: true, 
          data: {
            company: result.data.company ? transformCompanyInfo(result.data.company) : {} as CompanyInfo,
            notifications: result.data.notifications ? transformNotifications(result.data.notifications) : {} as NotificationSettings,
            security: result.data.security ? transformSecurity(result.data.security) : {} as SecuritySettings
          }
        };
      }
      return { success: false, error: result.error || 'Failed to fetch settings' };
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch settings' };
    }
  },

  async getCompanyInfo(): Promise<ApiResponse<CompanyInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/company`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformCompanyInfo(result.data) };
      }
      return { success: false, error: result.error || 'Failed to fetch company info' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch company info' };
    }
  },

  async updateCompanyInfo(data): Promise<ApiResponse<CompanyInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformCompanyInfo(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update company info' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update company info' };
    }
  },

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/notifications`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformNotifications(result.data) };
      }
      return { success: false, error: result.error || 'Failed to fetch notification settings' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch notification settings' };
    }
  },

  async updateNotificationSettings(data): Promise<ApiResponse<NotificationSettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationsToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformNotifications(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update notification settings' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update notification settings' };
    }
  },

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/security`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformSecurity(result.data) };
      }
      return { success: false, error: result.error || 'Failed to fetch security settings' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch security settings' };
    }
  },

  async updateSecuritySettings(data): Promise<ApiResponse<SecuritySettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/security`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityToBackend(data))
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success !== false && result.data) {
        return { success: true, data: transformSecurity(result.data) };
      }
      return { success: false, error: result.error || 'Failed to update security settings' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update security settings' };
    }
  }
};
