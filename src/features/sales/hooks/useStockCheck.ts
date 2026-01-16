// useStockCheck - Stock availability checking and reservation hook for sale forms
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  inventoryGateway, 
  StockCheckItem, 
  StockCheckResult,
  StockCheckResponse,
  ReservationItem,
  ReservationResponse,
} from '../services/inventory.gateway';
import { useToast } from '@/hooks/use-toast';

interface StockStatus {
  [productId: string]: {
    available_quantity: number;
    is_available: boolean;
    requested_quantity: number;
    last_checked: string;
  };
}

interface UseStockCheckOptions {
  /** Debounce delay in ms for batch checks */
  debounceMs?: number;
  /** Show toast notifications for stock issues */
  showNotifications?: boolean;
  /** Language for messages */
  language?: 'en' | 'ar';
  /** Enable optimistic reservation */
  enableReservation?: boolean;
  /** Reservation timeout in minutes (default 15) */
  reservationTimeoutMinutes?: number;
}

interface UseStockCheckReturn {
  /** Current stock status by product ID */
  stockStatus: StockStatus;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** Whether a reservation is in progress */
  isReserving: boolean;
  /** Last error message if any */
  error: string | null;
  /** Current active reservation ID */
  reservationId: string | null;
  /** Reservation expiry time */
  reservationExpiresAt: Date | null;
  /** Check stock for multiple items at once */
  checkStock: (items: StockCheckItem[]) => Promise<StockCheckResponse | null>;
  /** Check stock for a single product */
  checkSingleProduct: (productId: string, quantity?: number) => Promise<boolean>;
  /** Reserve stock for items (optimistic reservation) */
  reserveStock: (items: ReservationItem[]) => Promise<ReservationResponse | null>;
  /** Release current reservation */
  releaseReservation: () => Promise<boolean>;
  /** Clear all stock status and release reservation */
  clearStatus: () => void;
  /** Get unavailable items from current status */
  getUnavailableItems: () => StockCheckResult[];
  /** Check if all items in current status are available */
  allItemsAvailable: boolean;
  /** Check if items are currently reserved */
  hasActiveReservation: boolean;
}

const MESSAGES = {
  en: {
    stockCheckFailed: 'Failed to check stock availability',
    insufficientStock: 'Insufficient stock for some items',
    stockAvailable: 'All items are in stock',
    reservationFailed: 'Failed to reserve stock',
    reservationSuccess: 'Stock reserved successfully',
    reservationReleased: 'Stock reservation released',
    reservationExpiring: 'Your stock reservation will expire soon',
  },
  ar: {
    stockCheckFailed: 'فشل في التحقق من توفر المخزون',
    insufficientStock: 'المخزون غير كافٍ لبعض المنتجات',
    stockAvailable: 'جميع المنتجات متوفرة',
    reservationFailed: 'فشل في حجز المخزون',
    reservationSuccess: 'تم حجز المخزون بنجاح',
    reservationReleased: 'تم إلغاء حجز المخزون',
    reservationExpiring: 'سينتهي حجز المخزون قريباً',
  },
};

export const useStockCheck = (options: UseStockCheckOptions = {}): UseStockCheckReturn => {
  const { 
    debounceMs = 300, 
    showNotifications = true,
    language = 'en',
    enableReservation = false,
    reservationTimeoutMinutes = 15,
  } = options;
  
  const { toast } = useToast();
  const [stockStatus, setStockStatus] = useState<StockStatus>({});
  const [isChecking, setIsChecking] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<Date | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryWarningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messages = MESSAGES[language];

  // Cleanup on unmount - release reservation
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (expiryWarningTimerRef.current) {
        clearTimeout(expiryWarningTimerRef.current);
      }
      // Release reservation on unmount (fire and forget)
      if (reservationId) {
        inventoryGateway.releaseReservation(reservationId).catch(() => {});
      }
    };
  }, [reservationId]);

  // Setup expiry warning timer
  useEffect(() => {
    if (expiryWarningTimerRef.current) {
      clearTimeout(expiryWarningTimerRef.current);
    }

    if (reservationExpiresAt && showNotifications) {
      const warningTime = reservationExpiresAt.getTime() - Date.now() - 2 * 60 * 1000; // 2 min before expiry
      
      if (warningTime > 0) {
        expiryWarningTimerRef.current = setTimeout(() => {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: messages.reservationExpiring,
            variant: 'default',
          });
        }, warningTime);
      }
    }

    return () => {
      if (expiryWarningTimerRef.current) {
        clearTimeout(expiryWarningTimerRef.current);
      }
    };
  }, [reservationExpiresAt, showNotifications, language, messages.reservationExpiring, toast]);

  /**
   * Check stock for multiple items
   */
  const checkStock = useCallback(async (items: StockCheckItem[]): Promise<StockCheckResponse | null> => {
    if (items.length === 0) return null;

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await inventoryGateway.checkStock(items);

      if (!response.success || !response.data) {
        const errorMsg = response.error || messages.stockCheckFailed;
        setError(errorMsg);
        
        if (showNotifications) {
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
        return null;
      }

      const { data } = response;

      // Update stock status for each item
      const newStatus: StockStatus = {};
      data.items.forEach((item) => {
        newStatus[item.product_id] = {
          available_quantity: item.available_quantity,
          is_available: item.is_available,
          requested_quantity: item.requested_quantity,
          last_checked: data.checked_at,
        };
      });

      setStockStatus((prev) => ({ ...prev, ...newStatus }));

      // Show notification if some items are unavailable
      if (showNotifications && !data.available) {
        const unavailableCount = data.items.filter((i) => !i.is_available).length;
        toast({
          title: language === 'ar' ? 'تحذير' : 'Warning',
          description: `${messages.insufficientStock} (${unavailableCount})`,
          variant: 'destructive',
        });
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : messages.stockCheckFailed;
      setError(errorMsg);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [language, messages, showNotifications, toast]);

  /**
   * Check stock for a single product
   */
  const checkSingleProduct = useCallback(async (
    productId: string, 
    quantity: number = 1
  ): Promise<boolean> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await inventoryGateway.checkSingleProductStock(productId, quantity);

      if (!response.success || !response.data) {
        setError(response.error || messages.stockCheckFailed);
        return false;
      }

      const { data } = response;

      setStockStatus((prev) => ({
        ...prev,
        [productId]: {
          available_quantity: data.available_quantity,
          is_available: data.is_available,
          requested_quantity: data.requested_quantity,
          last_checked: data.checked_at,
        },
      }));

      return data.is_available;
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.stockCheckFailed);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [messages]);

  /**
   * Reserve stock for items (optimistic reservation)
   */
  const reserveStock = useCallback(async (items: ReservationItem[]): Promise<ReservationResponse | null> => {
    if (items.length === 0) return null;

    // Release existing reservation first
    if (reservationId) {
      await inventoryGateway.releaseReservation(reservationId);
    }

    setIsReserving(true);
    setError(null);

    try {
      const response = await inventoryGateway.reserveStock(items);

      if (!response.success || !response.data) {
        const errorMsg = response.error || messages.reservationFailed;
        setError(errorMsg);
        
        if (showNotifications) {
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
        return null;
      }

      const { data } = response;

      setReservationId(data.reservation_id);
      
      // Set expiry time
      const expiresAt = data.expires_at 
        ? new Date(data.expires_at) 
        : new Date(Date.now() + reservationTimeoutMinutes * 60 * 1000);
      setReservationExpiresAt(expiresAt);

      if (showNotifications) {
        toast({
          title: language === 'ar' ? 'تم' : 'Success',
          description: messages.reservationSuccess,
        });
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : messages.reservationFailed;
      setError(errorMsg);
      return null;
    } finally {
      setIsReserving(false);
    }
  }, [reservationId, language, messages, showNotifications, reservationTimeoutMinutes, toast]);

  /**
   * Release current reservation
   */
  const releaseReservation = useCallback(async (): Promise<boolean> => {
    if (!reservationId) return true;

    try {
      const response = await inventoryGateway.releaseReservation(reservationId);

      setReservationId(null);
      setReservationExpiresAt(null);

      if (response.success && showNotifications) {
        toast({
          title: language === 'ar' ? 'تم' : 'Done',
          description: messages.reservationReleased,
        });
      }

      return response.success;
    } catch (err) {
      // Even on error, clear local state
      setReservationId(null);
      setReservationExpiresAt(null);
      return false;
    }
  }, [reservationId, language, messages.reservationReleased, showNotifications, toast]);

  /**
   * Clear all stock status and release reservation
   */
  const clearStatus = useCallback(() => {
    setStockStatus({});
    setError(null);
    
    // Release reservation if exists
    if (reservationId) {
      inventoryGateway.releaseReservation(reservationId).catch(() => {});
      setReservationId(null);
      setReservationExpiresAt(null);
    }
  }, [reservationId]);

  /**
   * Get list of unavailable items from current status
   */
  const getUnavailableItems = useCallback((): StockCheckResult[] => {
    return Object.entries(stockStatus)
      .filter(([_, status]) => !status.is_available)
      .map(([productId, status]) => ({
        product_id: productId,
        requested_quantity: status.requested_quantity,
        available_quantity: status.available_quantity,
        is_available: false,
      }));
  }, [stockStatus]);

  /**
   * Check if all items in current status are available
   */
  const allItemsAvailable = Object.keys(stockStatus).length === 0 ||
    Object.values(stockStatus).every((status) => status.is_available);

  /**
   * Check if there's an active reservation
   */
  const hasActiveReservation = reservationId !== null && 
    reservationExpiresAt !== null && 
    reservationExpiresAt.getTime() > Date.now();

  return {
    stockStatus,
    isChecking,
    isReserving,
    error,
    reservationId,
    reservationExpiresAt,
    checkStock,
    checkSingleProduct,
    reserveStock,
    releaseReservation,
    clearStatus,
    getUnavailableItems,
    allItemsAvailable,
    hasActiveReservation,
  };
};
