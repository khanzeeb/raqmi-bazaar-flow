import { useLanguage } from '@/contexts/LanguageContext';

export function useRTL() {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';

  // RTL-aware class helpers
  const rtlClass = (ltrClass: string, rtlClass: string) => isRTL ? rtlClass : ltrClass;
  
  const flexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const marginStart = (size: string) => isRTL ? `mr-${size}` : `ml-${size}`;
  const marginEnd = (size: string) => isRTL ? `ml-${size}` : `mr-${size}`;
  const paddingStart = (size: string) => isRTL ? `pr-${size}` : `pl-${size}`;
  const paddingEnd = (size: string) => isRTL ? `pl-${size}` : `pr-${size}`;
  const borderStart = isRTL ? 'border-r' : 'border-l';
  const borderEnd = isRTL ? 'border-l' : 'border-r';
  const roundedStart = (size: string) => isRTL ? `rounded-r-${size}` : `rounded-l-${size}`;
  const roundedEnd = (size: string) => isRTL ? `rounded-l-${size}` : `rounded-r-${size}`;
  const start = isRTL ? 'right' : 'left';
  const end = isRTL ? 'left' : 'right';

  // Common RTL classes for layouts
  const pageClass = `${textAlign}`;
  const headerClass = `flex items-center justify-between ${flexDirection}`;
  const iconButtonClass = (position: 'start' | 'end') => 
    position === 'start' ? marginEnd('2') : marginStart('2');

  return {
    isRTL,
    isArabic,
    language,
    // Class helpers
    rtlClass,
    flexDirection,
    textAlign,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
    borderStart,
    borderEnd,
    roundedStart,
    roundedEnd,
    start,
    end,
    // Layout helpers
    pageClass,
    headerClass,
    iconButtonClass,
  };
}
