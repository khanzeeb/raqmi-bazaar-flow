// ExpenseStats - Summary statistics cards
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseStats as Stats } from "@/types/expense.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface ExpenseStatsProps {
  stats: Stats;
}

export const ExpenseStats = ({ stats }: ExpenseStatsProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.totalExpenses.toLocaleString()} {currencySymbol}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Expenses" arLabel="إجمالي المصروفات" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending" arLabel="معلقة" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Paid" arLabel="مدفوعة" showBoth={false} /></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.withReceipts}</div>
          <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="With Receipts" arLabel="بإيصالات" showBoth={false} /></p>
        </CardContent>
      </Card>
    </div>
  );
};
