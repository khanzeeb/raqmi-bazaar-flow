import { 
  BarChart3, 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Truck, 
  CreditCard, 
  PieChart, 
  Tag, 
  Receipt, 
  Warehouse, 
  Settings,
  Home,
  RotateCcw
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

// Navigation items with colorful icons
const navigationItems = [
  { 
    title: "Dashboard", 
    titleAr: "لوحة التحكم",
    url: "/", 
    icon: Home,
    iconColor: "icon-blue"
  },
  { 
    title: "Products", 
    titleAr: "المنتجات",
    url: "/products", 
    icon: Package,
    iconColor: "icon-green"
  },
  { 
    title: "Quotations", 
    titleAr: "عروض الأسعار",
    url: "/quotations", 
    icon: FileText,
    iconColor: "icon-orange"
  },
  { 
    title: "Sales Orders", 
    titleAr: "أوامر البيع",
    url: "/sales-orders", 
    icon: ShoppingCart,
    iconColor: "icon-purple"
  },
  { 
    title: "Customers", 
    titleAr: "العملاء",
    url: "/customers", 
    icon: Users,
    iconColor: "icon-cyan"
  },
  { 
    title: "Purchases", 
    titleAr: "المشتريات",
    url: "/purchases", 
    icon: Truck,
    iconColor: "icon-red"
  },
  { 
    title: "Expenses", 
    titleAr: "المصروفات",
    url: "/expenses", 
    icon: CreditCard,
    iconColor: "icon-yellow"
  },
  { 
    title: "Reports", 
    titleAr: "التقارير",
    url: "/reports", 
    icon: BarChart3,
    iconColor: "icon-pink"
  },
  { 
    title: "Pricing", 
    titleAr: "التسعير",
    url: "/pricing", 
    icon: Tag,
    iconColor: "icon-green"
  },
  { 
    title: "Invoices", 
    titleAr: "الفواتير",
    url: "/invoices", 
    icon: Receipt,
    iconColor: "icon-blue"
  },
  { 
    title: "Returns", 
    titleAr: "المرتجعات",
    url: "/returns", 
    icon: RotateCcw,
    iconColor: "icon-red"
  },
  { 
    title: "Inventory", 
    titleAr: "المخزون",
    url: "/inventory", 
    icon: Warehouse,
    iconColor: "icon-orange"
  },
  { 
    title: "Settings", 
    titleAr: "الإعدادات",
    url: "/settings", 
    icon: Settings,
    iconColor: "icon-red"
  },
];

interface AppSidebarProps {
  isArabic?: boolean;
}

export function AppSidebar({ isArabic = false }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`;
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`;
    }
    return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border`}>
      <SidebarHeader className="border-b border-border p-4">
        <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          {!collapsed && (
            <div className={`flex flex-col ${isArabic ? 'items-end' : 'items-start'}`}>
              <h1 className="font-bold text-foreground">
                {isArabic ? "متجر رقمي" : "RaqmiStore"}
              </h1>
              <span className="text-xs text-muted-foreground">
                {isArabic ? "نظام إدارة المتاجر" : "Retail Management"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground text-xs font-medium px-3 py-2 ${isArabic ? 'text-right' : 'text-left'}`}>
            {isArabic ? "القائمة الرئيسية" : "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${item.iconColor}`} />
                      {!collapsed && (
                        <span className="font-medium flex-1">
                          {isArabic ? item.titleAr : item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}