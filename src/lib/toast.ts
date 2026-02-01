/**
 * Unified Toast Utility
 * 
 * This provides a consistent toast interface across the application.
 * All features should import toast from here instead of directly from hooks or sonner.
 * 
 * Usage:
 *   import { showToast } from '@/lib/toast';
 *   showToast.success('Operation completed');
 *   showToast.error('Something went wrong');
 *   showToast.info('FYI');
 */

import { toast as baseToast } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

/**
 * Unified toast API with convenient methods
 */
export const showToast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: Omit<ToastOptions, 'description'>) => {
    baseToast({
      title: options?.title || 'Success',
      description: message,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: Omit<ToastOptions, 'description'>) => {
    baseToast({
      title: options?.title || 'Error',
      description: message,
      variant: 'destructive',
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: Omit<ToastOptions, 'description'>) => {
    baseToast({
      title: options?.title || 'Info',
      description: message,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: Omit<ToastOptions, 'description'>) => {
    baseToast({
      title: options?.title || 'Warning',
      description: message,
    });
  },

  /**
   * Show a custom toast (for full control)
   */
  custom: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
    baseToast(options);
  },
};

// Re-export the raw toast and useToast for cases where full control is needed
export { toast, useToast } from '@/hooks/use-toast';
