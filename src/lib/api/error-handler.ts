// Centralized Error Handler
// Provides consistent error handling across the application

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AppError {
  id: string;
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
}

export interface ErrorHandlerConfig {
  logToConsole: boolean;
  maxErrors: number;
  onError?: (error: AppError) => void;
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logToConsole: true,
  maxErrors: 50,
};

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, { en: string; ar: string }> = {
  NETWORK_ERROR: {
    en: 'Unable to connect to the server. Please check your internet connection.',
    ar: 'غير قادر على الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  },
  TIMEOUT: {
    en: 'The request timed out. Please try again.',
    ar: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  },
  NOT_FOUND: {
    en: 'The requested resource was not found.',
    ar: 'المورد المطلوب غير موجود.',
  },
  VALIDATION_ERROR: {
    en: 'Please check your input and try again.',
    ar: 'يرجى التحقق من الإدخال والمحاولة مرة أخرى.',
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action.',
    ar: 'غير مصرح لك بتنفيذ هذا الإجراء.',
  },
  SERVER_ERROR: {
    en: 'An unexpected error occurred. Please try again later.',
    ar: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.',
  },
  UNKNOWN_ERROR: {
    en: 'An unknown error occurred.',
    ar: 'حدث خطأ غير معروف.',
  },
};

class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errors: AppError[] = [];
  private listeners: Set<(error: AppError) => void> = new Set();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Generate unique error ID
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get user-friendly message
  getUserMessage(code: string, isArabic: boolean = false): string {
    const messages = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
    return isArabic ? messages.ar : messages.en;
  }

  // Determine severity from error code/status
  private getSeverity(code: string, status?: number): ErrorSeverity {
    if (status && status >= 500) return 'critical';
    if (code === 'NETWORK_ERROR' || code === 'TIMEOUT') return 'warning';
    if (status && status >= 400) return 'error';
    return 'info';
  }

  // Handle and log error
  handle(
    code: string,
    message: string,
    context?: Record<string, unknown>,
    isArabic: boolean = false
  ): AppError {
    const error: AppError = {
      id: this.generateId(),
      code,
      message,
      userMessage: this.getUserMessage(code, isArabic),
      severity: this.getSeverity(code),
      timestamp: new Date(),
      context,
    };

    // Store error
    this.errors.unshift(error);
    if (this.errors.length > this.config.maxErrors) {
      this.errors.pop();
    }

    // Log to console
    if (this.config.logToConsole) {
      console.error(`[${error.severity.toUpperCase()}] ${error.code}:`, error.message, context);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(error));
    this.config.onError?.(error);

    return error;
  }

  // Subscribe to errors
  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get recent errors
  getErrors(): AppError[] {
    return [...this.errors];
  }

  // Clear errors
  clearErrors(): void {
    this.errors = [];
  }

  // Clear specific error
  clearError(id: string): void {
    this.errors = this.errors.filter(e => e.id !== id);
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

// Helper function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorCode: string = 'UNKNOWN_ERROR',
  context?: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const error = errorHandler.handle(errorCode, message, context);
    return { data: null, error };
  }
}
