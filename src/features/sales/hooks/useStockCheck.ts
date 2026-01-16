// useStockCheck - Stock availability checking hook for sale forms
import { useState, useCallback, useRef } from 'react';
import { 
  inventoryGateway, 
  StockCheckItem, 
  StockCheckResult,
  StockCheckResponse 
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
}

interface UseStockCheckReturn {
  /** Current stock status by product ID */
  stockStatus: StockStatus;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** Last error message if any */
  error: string | null;
  /** Check stock for multiple items at once */
  checkStock: (items: StockCheckItem[]) => Promise<StockCheckResponse | null>;
  /** Check stock for a single product */
  checkSingleProduct: (productId: string, quantity?: number) => Promise<boolean>;
  /** Clear all stock status */
  clearStatus: () => void;
  /** Get unavailable items from current status */
  getUnavailableItems: () => StockCheckResult[];
  /** Check if all items in current status are available */
  allItemsAvailable: boolean;
}

const MESSAGES = {
  en: {
    stockCheckFailed: 'Failed to check stock availability',
    insufficientStock: 'Insufficient stock for some items',
    stockAvailable: 'All items are in stock',
  },
  ar: {
    stockCheckFailed: 'فشل في التحقق من توفر المخزون',
    insufficientStock: 'المخزون غير كافٍ لبعض المنتجات',
    stockAvailable: 'جميع المنتجات متوفرة',
  },
};

export const useStockCheck = (options: UseStockCheckOptions = {}): UseStockCheckReturn => {
  const { 
    debounceMs = 300, 
    showNotifications = true,
    language = 'en' 
  } = options;
  
  const { toast } = useToast();
  const [stockStatus, setStockStatus] = useState<StockStatus>({});
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messages = MESSAGES[language];

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
   * Clear all stock status
   */
  const clearStatus = useCallback(() => {
    setStockStatus({});
    setError(null);
  }, []);

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

  return {
    stockStatus,
    isChecking,
    error,
    checkStock,
    checkSingleProduct,
    clearStatus,
    getUnavailableItems,
    allItemsAvailable,
  };
};
