import { useState } from 'react';
import { CompanyInfo, NotificationSettings, SecuritySettings } from '@/types/settings.types';

export const useSettingsData = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'RAQMI Technology Solutions',
    nameAr: 'شركة رقمي للحلول التقنية',
    email: 'info@raqmi.com',
    phone: '+966112345678',
    address: 'الرياض، المملكة العربية السعودية',
    taxId: '123456789012345',
    crNumber: '1010123456',
    website: 'www.raqmi.com'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    salesAlerts: true,
    lowStockAlerts: true,
    paymentReminders: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  });

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  return {
    companyInfo,
    notifications,
    security,
    handleCompanyInfoChange,
    handleNotificationChange,
    handleSecurityChange
  };
};
