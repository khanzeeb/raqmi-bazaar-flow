// InvoiceStats - Summary statistics cards
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceStats as Stats } from "@/types/invoice.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface InvoiceStatsProps {
  stats: Stats;
}

export const InvoiceStats = ({ stats }: InvoiceStatsProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAmount.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Invoices" arLabel="إجمالي الفواتير" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.paidAmount.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Paid" arLabel="المدفوع" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdueAmount.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Overdue" arLabel="متأخر" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.count}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Invoice Count" arLabel="عدد الفواتير" showBoth={false} /></p>
        </CardContent>
      </Card>
    </div>
  );
};
