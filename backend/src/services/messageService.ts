interface Messages {
  en: Record<string, string>;
  ar: Record<string, string>;
}

const messages: Messages = {
  en: {
    // Success messages
    'success.created': 'Created successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'success.login': 'Login successful',
    'success.logout': 'Logout successful',
    'success.registered': 'Registration successful',
    'success.sent': 'Sent successfully',
    'success.uploaded': 'Uploaded successfully',
    
    // Error messages
    'error.not_found': 'Resource not found',
    'error.unauthorized': 'Unauthorized access',
    'error.forbidden': 'Access forbidden',
    'error.invalid_credentials': 'Invalid credentials',
    'error.validation': 'Validation failed',
    'error.duplicate': 'Resource already exists',
    'error.server': 'Internal server error',
    'error.network': 'Network error',
    'error.timeout': 'Request timeout',
    
    // General messages
    'general.welcome': 'Welcome',
    'general.goodbye': 'Goodbye',
    'general.loading': 'Loading...',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.view': 'View',
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.sort': 'Sort',
    'general.export': 'Export',
    'general.import': 'Import',
    'general.print': 'Print',
    'general.email': 'Email',
    'general.phone': 'Phone',
    'general.address': 'Address',
    'general.date': 'Date',
    'general.time': 'Time',
    'general.status': 'Status',
    'general.total': 'Total',
    'general.subtotal': 'Subtotal',
    'general.tax': 'Tax',
    'general.discount': 'Discount',
    'general.quantity': 'Quantity',
    'general.price': 'Price',
    'general.amount': 'Amount'
  },
  ar: {
    // Success messages
    'success.created': 'تم الإنشاء بنجاح',
    'success.updated': 'تم التحديث بنجاح',
    'success.deleted': 'تم الحذف بنجاح',
    'success.login': 'تم تسجيل الدخول بنجاح',
    'success.logout': 'تم تسجيل الخروج بنجاح',
    'success.registered': 'تم التسجيل بنجاح',
    'success.sent': 'تم الإرسال بنجاح',
    'success.uploaded': 'تم الرفع بنجاح',
    
    // Error messages
    'error.not_found': 'المورد غير موجود',
    'error.unauthorized': 'وصول غير مخول',
    'error.forbidden': 'الوصول محظور',
    'error.invalid_credentials': 'بيانات اعتماد غير صحيحة',
    'error.validation': 'فشل في التحقق',
    'error.duplicate': 'المورد موجود بالفعل',
    'error.server': 'خطأ داخلي في الخادم',
    'error.network': 'خطأ في الشبكة',
    'error.timeout': 'انتهت مهلة الطلب',
    
    // General messages
    'general.welcome': 'مرحباً',
    'general.goodbye': 'وداعاً',
    'general.loading': 'جاري التحميل...',
    'general.save': 'حفظ',
    'general.cancel': 'إلغاء',
    'general.delete': 'حذف',
    'general.edit': 'تعديل',
    'general.view': 'عرض',
    'general.search': 'بحث',
    'general.filter': 'تصفية',
    'general.sort': 'ترتيب',
    'general.export': 'تصدير',
    'general.import': 'استيراد',
    'general.print': 'طباعة',
    'general.email': 'البريد الإلكتروني',
    'general.phone': 'الهاتف',
    'general.address': 'العنوان',
    'general.date': 'التاريخ',
    'general.time': 'الوقت',
    'general.status': 'الحالة',
    'general.total': 'الإجمالي',
    'general.subtotal': 'المجموع الفرعي',
    'general.tax': 'الضريبة',
    'general.discount': 'الخصم',
    'general.quantity': 'الكمية',
    'general.price': 'السعر',
    'general.amount': 'المبلغ'
  }
};

class MessageService {
  static getMessage(key: string, language: string = 'en'): string {
    // Default to English if Arabic is not available or language is not 'ar'
    const lang = language === 'ar' ? 'ar' : 'en';
    return messages[lang][key] || messages.en[key] || key;
  }

  static getMessages(language: string = 'en'): Record<string, string> {
    const lang = language === 'ar' ? 'ar' : 'en';
    return messages[lang] || messages.en;
  }

  static getAllMessages(): Messages {
    return messages;
  }

  static getResponse(success: boolean, messageKey: string, data: any = null, language: string = 'en'): object {
    return {
      success,
      message: this.getMessage(messageKey, language),
      ...(data && { data })
    };
  }

  static successResponse(messageKey: string, data: any = null, language: string = 'en'): object {
    return this.getResponse(true, messageKey, data, language);
  }

  static errorResponse(messageKey: string, data: any = null, language: string = 'en'): object {
    return this.getResponse(false, messageKey, data, language);
  }
}

export default MessageService;