import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SecurityUtils, RateLimiter } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface SecureFormOptions<T extends z.ZodType> extends UseFormProps {
  schema: T;
  rateLimitKey?: string;
  maxSubmissions?: number;
  windowMs?: number;
}

export function useSecureForm<T extends z.ZodType>(
  options: SecureFormOptions<T>
) {
  const { schema, rateLimitKey, maxSubmissions = 5, windowMs = 60000, ...formOptions } = options;
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  const secureSubmit = async (
    onSubmit: (data: z.infer<T>) => Promise<void> | void,
    onError?: (error: Error) => void
  ) => {
    return form.handleSubmit(async (data) => {
      try {
        // Rate limiting check
        if (rateLimitKey && !RateLimiter.isAllowed(rateLimitKey, maxSubmissions, windowMs)) {
          toast({
            title: "Too many attempts",
            description: "Please wait before trying again.",
            variant: "destructive",
          });
          return;
        }

        // Sanitize string inputs
        const sanitizedData = sanitizeFormData(data);
        
        await onSubmit(sanitizedData);
      } catch (error) {
        console.error('Form submission error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        
        toast({
          title: "Submission failed",
          description: errorMessage,
          variant: "destructive",
        });

        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    });
  };

  return {
    ...form,
    secureSubmit,
  };
}

function sanitizeFormData(data: any): any {
  if (typeof data === 'string') {
    return SecurityUtils.sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeFormData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeFormData(value);
    }
    return sanitized;
  }
  
  return data;
}