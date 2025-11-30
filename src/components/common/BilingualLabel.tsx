import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BilingualLabelProps {
  enLabel: string;
  arLabel: string;
  className?: string;
  showBoth?: boolean;
  primaryClassName?: string;
  secondaryClassName?: string;
}

export const BilingualLabel: React.FC<BilingualLabelProps> = ({
  enLabel,
  arLabel,
  className,
  showBoth = true,
  primaryClassName,
  secondaryClassName,
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!showBoth) {
    return <span className={className}>{isArabic ? arLabel : enLabel}</span>;
  }

  return (
    <span className={cn('inline-flex flex-col items-center gap-0.5', className)}>
      <span className={cn('font-medium', primaryClassName)}>
        {isArabic ? arLabel : enLabel}
      </span>
      <span className={cn('text-xs text-muted-foreground', secondaryClassName)}>
        {isArabic ? enLabel : arLabel}
      </span>
    </span>
  );
};

interface BilingualInlineProps {
  enLabel: string;
  arLabel: string;
  className?: string;
  separator?: string;
}

export const BilingualInline: React.FC<BilingualInlineProps> = ({
  enLabel,
  arLabel,
  className,
  separator = ' / ',
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <span className={className}>
      {isArabic ? `${arLabel}${separator}${enLabel}` : `${enLabel}${separator}${arLabel}`}
    </span>
  );
};
