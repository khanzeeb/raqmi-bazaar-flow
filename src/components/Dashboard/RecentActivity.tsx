import { 
  ShoppingCart, 
  FileText, 
  Users, 
  Package,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: "sale" | "quote" | "customer" | "product";
  title: string;
  subtitle: string;
  time: string;
  amount?: string;
  status?: "completed" | "pending" | "draft";
}

interface RecentActivityProps {
  isArabic?: boolean;
}

export function RecentActivity({ isArabic = false }: RecentActivityProps) {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "sale",
      title: isArabic ? "بيع جديد - أحمد محمد" : "New Sale - Ahmad Mohammed",
      subtitle: isArabic ? "كمبيوتر محمول Dell" : "Dell Laptop",
      time: isArabic ? "منذ 5 دقائق" : "5 min ago",
      amount: "SAR 3,200",
      status: "completed"
    },
    {
      id: "2", 
      type: "quote",
      title: isArabic ? "عرض سعر جديد - شركة النور" : "New Quote - Al Noor Company",
      subtitle: isArabic ? "معدات مكتبية متنوعة" : "Various office equipment",
      time: isArabic ? "منذ 15 دقيقة" : "15 min ago",
      amount: "SAR 12,500",
      status: "pending"
    },
    {
      id: "3",
      type: "customer",
      title: isArabic ? "عميل جديد - سارة أحمد" : "New Customer - Sara Ahmed", 
      subtitle: isArabic ? "عميل تجزئة" : "Retail customer",
      time: isArabic ? "منذ 25 دقيقة" : "25 min ago",
      status: "completed"
    },
    {
      id: "4",
      type: "product",
      title: isArabic ? "منتج جديد - iPhone 15" : "New Product - iPhone 15",
      subtitle: isArabic ? "هواتف ذكية" : "Smartphones",
      time: isArabic ? "منذ ساعة" : "1 hour ago",
      status: "draft"
    },
    {
      id: "5",
      type: "sale",
      title: isArabic ? "بيع جديد - مها الزهراني" : "New Sale - Maha Al-Zahrani",
      subtitle: isArabic ? "طابعة HP LaserJet" : "HP LaserJet Printer",
      time: isArabic ? "منذ ساعتين" : "2 hours ago", 
      amount: "SAR 850",
      status: "completed"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4 icon-green" />;
      case "quote":
        return <FileText className="h-4 w-4 icon-blue" />;
      case "customer":
        return <Users className="h-4 w-4 icon-purple" />;
      case "product":
        return <Package className="h-4 w-4 icon-orange" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success text-xs">
            {isArabic ? "مكتمل" : "Completed"}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">
            {isArabic ? "قيد الانتظار" : "Pending"}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
            {isArabic ? "مسودة" : "Draft"}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 icon-blue" />
        <h3 className="text-lg font-semibold text-foreground">
          {isArabic ? "النشاطات الأخيرة" : "Recent Activity"}
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-lg bg-muted/50">
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.subtitle}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {activity.amount && (
                    <span className="text-sm font-semibold text-foreground">
                      {activity.amount}
                    </span>
                  )}
                  {getStatusBadge(activity.status)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          {isArabic ? "عرض كل النشاطات" : "View all activities"}
        </button>
      </div>
    </div>
  );
}