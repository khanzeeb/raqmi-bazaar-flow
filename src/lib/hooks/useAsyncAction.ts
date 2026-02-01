/**
 * useAsyncAction - Reusable hook for handling async operations with loading state and error handling
 * Eliminates boilerplate in CRUD operations across all features
 */

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/api';

interface AsyncActionOptions<T> {
  /** Success message to display */
  successMessage?: string;
  /** Error message prefix */
  errorMessage?: string;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Whether to show toast notifications */
  showToast?: boolean;
}

interface AsyncActionState {
  loading: boolean;
  error: string | null;
}

interface AsyncActionReturn<TInput, TOutput> extends AsyncActionState {
  execute: (input: TInput) => Promise<TOutput | null>;
  reset: () => void;
}

/**
 * Generic async action hook for handling API calls with consistent patterns
 */
export function useAsyncAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ApiResponse<TOutput>>,
  options: AsyncActionOptions<TOutput> = {}
): AsyncActionReturn<TInput, TOutput> {
  const {
    successMessage,
    errorMessage = 'Operation failed',
    onSuccess,
    onError,
    showToast = true,
  } = options;

  const [state, setState] = useState<AsyncActionState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setState({ loading: true, error: null });

    try {
      const response = await action(input);

      if (response.success && response.data) {
        if (showToast && successMessage) {
          toast({ title: 'Success', description: successMessage });
        }
        onSuccess?.(response.data);
        setState({ loading: false, error: null });
        return response.data;
      } else {
        const error = response.error || errorMessage;
        if (showToast) {
          toast({ title: 'Error', description: error, variant: 'destructive' });
        }
        onError?.(error);
        setState({ loading: false, error });
        return null;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : errorMessage;
      if (showToast) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      }
      onError?.(error);
      setState({ loading: false, error });
      return null;
    }
  }, [action, successMessage, errorMessage, onSuccess, onError, showToast]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Simplified hook for boolean success/failure actions (like delete)
 */
export function useAsyncBoolAction(
  action: (id: string) => Promise<ApiResponse<boolean>>,
  options: Omit<AsyncActionOptions<boolean>, 'onSuccess'> & { onSuccess?: () => void } = {}
): {
  loading: boolean;
  error: string | null;
  execute: (id: string) => Promise<boolean>;
} {
  const { execute, ...state } = useAsyncAction(action, {
    ...options,
    onSuccess: options.onSuccess ? () => options.onSuccess?.() : undefined,
  });

  const wrappedExecute = useCallback(async (id: string): Promise<boolean> => {
    const result = await execute(id);
    return result === true;
  }, [execute]);

  return {
    ...state,
    execute: wrappedExecute,
  };
}
