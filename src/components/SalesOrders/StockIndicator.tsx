import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockIndicatorProps {
  isChecking: boolean;
  isAvailable: boolean | null;
  availableQuantity?: number;
  requestedQuantity?: number;
  language?: 'en' | 'ar';
}

const MESSAGES = {
  en: {
    checking: 'Checking stock...',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    available: 'Available',
    requested: 'Requested',
  },
  ar: {
    checking: 'جاري التحقق...',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    available: 'المتاح',
    requested: 'المطلوب',
  },
};

export const StockIndicator: React.FC<StockIndicatorProps> = ({
  isChecking,
  isAvailable,
  availableQuantity,
  requestedQuantity,
  language = 'en',
}) => {
  const messages = MESSAGES[language];

  if (isChecking) {
    return (
      <Badge variant="secondary" className="gap-1 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        {messages.checking}
      </Badge>
    );
  }

  if (isAvailable === null) {
    return null;
  }

  if (isAvailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              {messages.inStock}
            </Badge>
          </TooltipTrigger>
          {availableQuantity !== undefined && (
            <TooltipContent>
              <p>{messages.available}: {availableQuantity}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertCircle className="w-3 h-3" />
            {messages.outOfStock}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.requested}: {requestedQuantity}</p>
          <p>{messages.available}: {availableQuantity}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
