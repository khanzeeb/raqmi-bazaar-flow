import React, { createContext, useContext, useState } from 'react';
import { Button } from "@/components/ui/button";

interface LanguageContextType {
  language: 'en' | 'ar';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Dashboard
    'dashboard': 'Dashboard',
    'stats': 'Statistics',
    'recent_activity': 'Recent Activity',
    'quick_actions': 'Quick Actions',
    
    // Products
    'products': 'Products',
    'product_management': 'Product Management',
    'add_product': 'Add Product',
    'edit_product': 'Edit Product',
    'product_name': 'Product Name',
    'price': 'Price',
    'stock': 'Stock',
    'category': 'Category',
    
    // Sales Orders
    'sales_orders': 'Sales Orders',
    'sales_orders_management': 'Sales Orders Management',
    'new_order': 'New Order',
    'order_number': 'Order Number',
    'customer_info': 'Customer Information',
    'select_customer': 'Select Customer',
    'customer_name': 'Customer Name',
    'phone': 'Phone',
    'total': 'Total',
    'payment_method': 'Payment Method',
    'payment_status': 'Payment Status',
    'order_status': 'Order Status',
    'paid_amount': 'Paid Amount',
    'date': 'Date',
    'items': 'Items',
    'subtotal': 'Subtotal',
    'discount': 'Discount',
    'tax_rate': 'Tax Rate',
    'tax': 'Tax',
    'grand_total': 'Grand Total',
    'payment_details': 'Payment Details',
    'notes': 'Notes',
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'credit': 'Credit',
    'pending': 'Pending',
    'partial': 'Partial',
    'paid': 'Paid',
    'completed': 'Completed',
    'returned': 'Returned',
    'unpaid': 'Unpaid',
    'partially_paid': 'Partially Paid',
    'fully_paid': 'Fully Paid',
    'view': 'View',
    'print': 'Print',
    'download': 'Download',
    'save_order': 'Save Order',
    'update_order': 'Update Order',
    'cancel': 'Cancel',
    'add_product_to_order': 'Add Product',
    'search_product': 'Search Product...',
    'quantity': 'Quantity',
    'search': 'Search',
    'all_statuses': 'All Statuses',
    
    // Customers
    'customers': 'Customers',
    'customer_management': 'Customer Management',
    'add_customer': 'Add Customer',
    'edit_customer': 'Edit Customer',
    
    // Common
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'search_placeholder': 'Search...',
    'no_results': 'No results found',
    'loading': 'Loading...',
    'actions': 'Actions',
    'status': 'Status',
    'created_at': 'Created At',
    'updated_at': 'Updated At'
  },
  ar: {
    // Dashboard
    'dashboard': 'لوحة التحكم',
    'stats': 'الإحصائيات',
    'recent_activity': 'النشاط الحديث',
    'quick_actions': 'الإجراءات السريعة',
    
    // Products
    'products': 'المنتجات',
    'product_management': 'إدارة المنتجات',
    'add_product': 'إضافة منتج',
    'edit_product': 'تعديل منتج',
    'product_name': 'اسم المنتج',
    'price': 'السعر',
    'stock': 'المخزون',
    'category': 'الفئة',
    
    // Sales Orders
    'sales_orders': 'أوامر البيع',
    'sales_orders_management': 'إدارة أوامر البيع والمدفوعات',
    'new_order': 'طلب جديد',
    'order_number': 'رقم الطلب',
    'customer_info': 'معلومات العميل',
    'select_customer': 'اختيار العميل',
    'customer_name': 'اسم العميل',
    'phone': 'الهاتف',
    'total': 'المجموع',
    'payment_method': 'طريقة الدفع',
    'payment_status': 'حالة الدفع',
    'order_status': 'حالة الطلب',
    'paid_amount': 'المبلغ المدفوع',
    'date': 'التاريخ',
    'items': 'العناصر',
    'subtotal': 'المجموع الفرعي',
    'discount': 'الخصم',
    'tax_rate': 'معدل الضريبة',
    'tax': 'الضريبة',
    'grand_total': 'المجموع الكلي',
    'payment_details': 'تفاصيل الدفع',
    'notes': 'ملاحظات',
    'cash': 'نقدي',
    'bank_transfer': 'تحويل بنكي',
    'credit': 'آجل',
    'pending': 'معلق',
    'partial': 'جزئي',
    'paid': 'مدفوع',
    'completed': 'مكتمل',
    'returned': 'مرتجع',
    'unpaid': 'غير مدفوع',
    'partially_paid': 'مدفوع جزئياً',
    'fully_paid': 'مدفوع بالكامل',
    'view': 'عرض',
    'print': 'طباعة',
    'download': 'تحميل',
    'save_order': 'حفظ الطلب',
    'update_order': 'تحديث الطلب',
    'cancel': 'إلغاء',
    'add_product_to_order': 'إضافة منتج',
    'search_product': 'البحث عن منتج...',
    'quantity': 'الكمية',
    'search': 'بحث',
    'all_statuses': 'جميع الحالات',
    
    // Customers
    'customers': 'العملاء',
    'customer_management': 'إدارة العملاء',
    'add_customer': 'إضافة عميل',
    'edit_customer': 'تعديل عميل',
    
    // Common
    'save': 'حفظ',
    'edit': 'تعديل',
    'delete': 'حذف',
    'search_placeholder': 'البحث...',
    'no_results': 'لا توجد نتائج',
    'loading': 'جاري التحميل...',
    'actions': 'الإجراءات',
    'status': 'الحالة',
    'created_at': 'تاريخ الإنشاء',
    'updated_at': 'تاريخ التحديث'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="min-w-[60px]"
    >
      {language === 'en' ? 'عربي' : 'English'}
    </Button>
  );
};