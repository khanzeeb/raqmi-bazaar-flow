import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  position: 'before' | 'after';
}

export const CURRENCIES: Currency[] = [
  { code: 'SAR', symbol: 'ر.س', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', position: 'after' },
  { code: 'USD', symbol: '$', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', position: 'before' },
  { code: 'EUR', symbol: '€', nameEn: 'Euro', nameAr: 'يورو', position: 'before' },
  { code: 'GBP', symbol: '£', nameEn: 'British Pound', nameAr: 'جنيه استرليني', position: 'before' },
  { code: 'AED', symbol: 'د.إ', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', position: 'after' },
  { code: 'KWD', symbol: 'د.ك', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', position: 'after' },
  { code: 'QAR', symbol: 'ر.ق', nameEn: 'Qatari Riyal', nameAr: 'ريال قطري', position: 'after' },
  { code: 'BHD', symbol: 'د.ب', nameEn: 'Bahraini Dinar', nameAr: 'دينار بحريني', position: 'after' },
  { code: 'OMR', symbol: 'ر.ع', nameEn: 'Omani Rial', nameAr: 'ريال عماني', position: 'after' },
  { code: 'EGP', symbol: 'ج.م', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', position: 'after' },
];

export interface UserSettings {
  currency: Currency;
  preferredLanguage: 'en' | 'ar';
  dateFormat: string;
  taxRate: number;
  companyName: string;
  companyNameAr: string;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  formatCurrency: (amount: number) => string;
  formatCurrencyWithCode: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const defaultSettings: UserSettings = {
  currency: CURRENCIES[0], // SAR
  preferredLanguage: 'ar',
  dateFormat: 'YYYY-MM-DD',
  taxRate: 15,
  companyName: 'My Company',
  companyNameAr: 'شركتي',
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

interface UserSettingsProviderProps {
  children: React.ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure currency object is properly restored
        if (parsed.currency?.code) {
          const currency = CURRENCIES.find(c => c.code === parsed.currency.code);
          if (currency) {
            parsed.currency = currency;
          }
        }
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatCurrency = (amount: number): string => {
    const { currency } = settings;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    if (currency.position === 'before') {
      return `${currency.symbol}${formattedAmount}`;
    }
    return `${formattedAmount} ${currency.symbol}`;
  };

  const formatCurrencyWithCode = (amount: number): string => {
    const { currency } = settings;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currency.code} ${formattedAmount}`;
  };

  const getCurrencySymbol = (): string => {
    return settings.currency.symbol;
  };

  return (
    <UserSettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      formatCurrency, 
      formatCurrencyWithCode,
      getCurrencySymbol 
    }}>
      {children}
    </UserSettingsContext.Provider>
  );
};
