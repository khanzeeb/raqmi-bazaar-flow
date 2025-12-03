import React from 'react';
import { useRTL } from '@/hooks/useRTL';
import { cn } from '@/lib/utils';

interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function RTLWrapper({ children, className }: RTLWrapperProps) {
  const { isRTL, textAlign } = useRTL();
  
  return (
    <div className={cn(textAlign, className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}

interface RTLFlexProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
}

export function RTLFlex({ children, className, reverse = true }: RTLFlexProps) {
  const { isRTL } = useRTL();
  const shouldReverse = reverse && isRTL;
  
  return (
    <div className={cn('flex items-center', shouldReverse && 'flex-row-reverse', className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, titleAr, description, descriptionAr, icon, actions }: PageHeaderProps) {
  const { isArabic, isRTL } = useRTL();
  
  return (
    <div className={cn('flex items-center justify-between mb-6', isRTL && 'flex-row-reverse')}>
      <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
        {icon && (
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isArabic ? titleAr : title}
          </h1>
          {(description || descriptionAr) && (
            <p className="text-muted-foreground mt-1">
              {isArabic ? descriptionAr : description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          {actions}
        </div>
      )}
    </div>
  );
}
