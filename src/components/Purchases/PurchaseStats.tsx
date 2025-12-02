// PurchaseStats - Summary statistics cards
import { Card, CardContent } from "@/components/ui/card";
import { PurchaseStats as Stats } from "@/types/purchase.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface PurchaseStatsProps {
  stats: Stats;
}

export const PurchaseStats = ({ stats }: PurchaseStatsProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Orders" arLabel="إجمالي الطلبات" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending" arLabel="قيد الانتظار" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Value" arLabel="القيمة الإجمالية" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.unpaidValue.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Unpaid" arLabel="غير مدفوع" showBoth={false} /></p>
        </CardContent>
      </Card>
    </div>
  );
};
