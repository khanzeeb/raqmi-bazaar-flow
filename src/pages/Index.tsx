import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  DollarSign,
  Target,
  Activity
} from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";

const Dashboard = () => {
  const [isArabic, setIsArabic] = useState(false);

  // Check if Arabic is selected from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    setIsArabic(savedLanguage === "ar");
  }, []);

  const statsData = [
    {
      title: isArabic ? "إجمالي المبيعات" : "Total Sales",
      value: isArabic ? "ر.س 127,540" : "SAR 127,540",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign,
      iconColor: "icon-green"
    },
    {
      title: isArabic ? "عدد الطلبات" : "Total Orders",
      value: "342",
      change: "+8.2%", 
      changeType: "increase" as const,
      icon: ShoppingCart,
      iconColor: "icon-blue"
    },
    {
      title: isArabic ? "العملاء الجدد" : "New Customers",
      value: "28",
      change: "+15.3%",
      changeType: "increase" as const,
      icon: Users,
      iconColor: "icon-purple"
    },
    {
      title: isArabic ? "المنتجات النشطة" : "Active Products", 
      value: "1,247",
      change: "+3.1%",
      changeType: "increase" as const,
      icon: Package,
      iconColor: "icon-orange"
    },
    {
      title: isArabic ? "متوسط قيمة الطلب" : "Average Order Value",
      value: isArabic ? "ر.س 373" : "SAR 373",
      change: "-2.4%",
      changeType: "decrease" as const,
      icon: Target,
      iconColor: "icon-cyan"
    },
    {
      title: isArabic ? "معدل التحويل" : "Conversion Rate",
      value: "3.2%",
      change: "+0.8%",
      changeType: "increase" as const,
      icon: TrendingUp,
      iconColor: "icon-pink"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isArabic ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic ? "نظرة عامة على أداء متجرك" : "Overview of your store performance"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {isArabic ? "آخر تحديث:" : "Last updated:"}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-foreground">
            <Activity className="h-4 w-4 icon-green" />
            {isArabic ? "الآن" : "Now"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={stat.iconColor}
            isArabic={isArabic}
          />
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 icon-yellow" />
          <div>
            <h3 className="font-semibold text-foreground">
              {isArabic ? "تنبيه مخزون منخفض" : "Low Stock Alert"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isArabic 
                ? "5 منتجات تحتاج إلى إعادة تعبئة المخزون" 
                : "5 products need restocking"}
            </p>
          </div>
          <button className="ml-auto text-sm font-medium text-warning hover:text-warning/80 transition-colors">
            {isArabic ? "عرض التفاصيل" : "View Details"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions isArabic={isArabic} />
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity isArabic={isArabic} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
