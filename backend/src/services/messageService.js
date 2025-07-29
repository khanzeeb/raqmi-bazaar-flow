const messages = {
  en: {
    // Success messages
    'product.created': 'Product created successfully',
    'product.updated': 'Product updated successfully',
    'product.deleted': 'Product deleted successfully',
    'user.created': 'User created successfully',
    'user.updated': 'User updated successfully',
    'login.success': 'Login successful',
    'logout.success': 'Logout successful',
    
    // Error messages
    'product.not_found': 'Product not found',
    'user.not_found': 'User not found',
    'auth.invalid_credentials': 'Invalid credentials',
    'auth.token_required': 'Access token is required',
    'auth.token_invalid': 'Invalid or expired token',
    'validation.required': 'This field is required',
    'validation.email_invalid': 'Please enter a valid email address',
    'validation.password_weak': 'Password must be at least 6 characters',
    'server.error': 'Internal server error',
    'access.denied': 'Access denied',
    
    // General messages
    'data.fetched': 'Data retrieved successfully',
    'operation.successful': 'Operation completed successfully',
    'no_data': 'No data found',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
    'update': 'Update'
  },
  ar: {
    // Success messages
    'product.created': 'تم إنشاء المنتج بنجاح',
    'product.updated': 'تم تحديث المنتج بنجاح',
    'product.deleted': 'تم حذف المنتج بنجاح',
    'user.created': 'تم إنشاء المستخدم بنجاح',
    'user.updated': 'تم تحديث المستخدم بنجاح',
    'login.success': 'تم تسجيل الدخول بنجاح',
    'logout.success': 'تم تسجيل الخروج بنجاح',
    
    // Error messages
    'product.not_found': 'المنتج غير موجود',
    'user.not_found': 'المستخدم غير موجود',
    'auth.invalid_credentials': 'بيانات الاعتماد غير صحيحة',
    'auth.token_required': 'رمز الوصول مطلوب',
    'auth.token_invalid': 'رمز غير صالح أو منتهي الصلاحية',
    'validation.required': 'هذا الحقل مطلوب',
    'validation.email_invalid': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
    'validation.password_weak': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'server.error': 'خطأ في الخادم الداخلي',
    'access.denied': 'تم رفض الوصول',
    
    // General messages
    'data.fetched': 'تم استرجاع البيانات بنجاح',
    'operation.successful': 'تمت العملية بنجاح',
    'no_data': 'لا توجد بيانات',
    'loading': 'جاري التحميل...',
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'delete': 'حذف',
    'edit': 'تعديل',
    'create': 'إنشاء',
    'update': 'تحديث'
  }
};

class MessageService {
  static getMessage(key, language = 'en') {
    const lang = language === 'ar' ? 'ar' : 'en';
    return messages[lang][key] || messages['en'][key] || key;
  }

  static getMessages(language = 'en') {
    const lang = language === 'ar' ? 'ar' : 'en';
    return messages[lang];
  }

  static getAllMessages() {
    return messages;
  }

  // Helper method to get response with localized message
  static getResponse(success, messageKey, data = null, language = 'en') {
    return {
      success,
      message: this.getMessage(messageKey, language),
      data
    };
  }

  // Success response helper
  static successResponse(messageKey, data = null, language = 'en') {
    return this.getResponse(true, messageKey, data, language);
  }

  // Error response helper
  static errorResponse(messageKey, data = null, language = 'en') {
    return this.getResponse(false, messageKey, data, language);
  }
}

module.exports = MessageService;