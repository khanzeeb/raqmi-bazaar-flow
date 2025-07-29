import { z } from 'zod';

// Input sanitization utilities
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Sanitize user input for safe display
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>&'"]/g, (char) => {
        const entityMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          "'": '&#x27;',
          '"': '&quot;'
        };
        return entityMap[char] || char;
      })
      .trim();
  }

  /**
   * Validate and sanitize URLs
   */
  static sanitizeUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }
      return parsedUrl.toString();
    } catch {
      return null;
    }
  }

  /**
   * Generate a secure random ID
   */
  static generateSecureId(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check for double extensions
    if ((file.name.match(/\./g) || []).length > 1) {
      return { valid: false, error: 'Multiple file extensions not allowed' };
    }

    return { valid: true };
  }
}

// Enhanced validation schemas
export const SecuritySchemas = {
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .refine((email) => !email.includes('<script>'), 'Invalid characters in email'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),

  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .max(20, 'Phone number too long'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),

  currency: z.number()
    .min(0, 'Amount cannot be negative')
    .max(999999999.99, 'Amount too large')
    .refine((val) => Number.isFinite(val), 'Invalid number'),

  text: z.string()
    .max(1000, 'Text too long')
    .refine((text) => !/<script|javascript:|on\w+=/i.test(text), 'Invalid content detected'),

  url: z.string()
    .url('Invalid URL format')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, 'Only HTTP and HTTPS URLs are allowed')
};

// Rate limiting utility (client-side)
export class RateLimiter {
  private static requests = new Map<string, number[]>();

  static isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  static reset(key: string): void {
    this.requests.delete(key);
  }
}