// PaymentStats - Summary statistics cards
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, History, AlertTriangle, Users } from "lucide-react";
import { PaymentStats as Stats } from "@/types/payment.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface PaymentStatsProps {
  stats: Stats;
}

export const PaymentStats = ({ stats }: PaymentStatsProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Payments" arLabel="إجمالي المدفوعات" showBoth={false} /></p>
              <p className="text-2xl font-bold">{stats.totalPayments.toLocaleString()} {currencySymbol}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg"><CreditCard className="w-6 h-6 text-green-600" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending Payments" arLabel="دفعات معلقة" showBoth={false} /></p>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg"><History className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Outstanding" arLabel="إجمالي المستحقات" showBoth={false} /></p>
              <p className="text-2xl font-bold">{stats.totalOutstanding.toLocaleString()} {currencySymbol}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Blocked Customers" arLabel="عملاء محظورين" showBoth={false} /></p>
              <p className="text-2xl font-bold">{stats.blockedCustomers}</p>
            </div>
            <div className="p-2 bg-gray-500/10 rounded-lg"><Users className="w-6 h-6 text-gray-600" /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
