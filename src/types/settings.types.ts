export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
  salesAlerts: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
}

export interface CompanyInfo {
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  crNumber: string;
  website?: string;
}
