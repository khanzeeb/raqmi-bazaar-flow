import { 
  Plus, 
  ShoppingCart, 
  FileText, 
  Users, 
  Package, 
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  isArabic?: boolean;
}

export function QuickActions({ isArabic = false }: QuickActionsProps) {
  const actions = [
    {
      title: isArabic ? "بيع جديد" : "New Sale",
      icon: ShoppingCart,
      color: "icon-green",
      bgColor: "bg-icon-green/10",
      action: () => console.log("New Sale")
    },
    {
      title: isArabic ? "عرض سعر" : "New Quote", 
      icon: FileText,
      color: "icon-blue",
      bgColor: "bg-icon-blue/10",
      action: () => console.log("New Quote")
    },
    {
      title: isArabic ? "عميل جديد" : "Add Customer",
      icon: Users,
      color: "icon-purple",
      bgColor: "bg-icon-purple/10", 
      action: () => console.log("Add Customer")
    },
    {
      title: isArabic ? "منتج جديد" : "Add Product",
      icon: Package,
      color: "icon-orange",
      bgColor: "bg-icon-orange/10",
      action: () => console.log("Add Product")
    },
    {
      title: isArabic ? "فاتورة جديدة" : "New Invoice",
      icon: Receipt,
      color: "icon-cyan",
      bgColor: "bg-icon-cyan/10",
      action: () => console.log("New Invoice")
    }
  ];

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5 icon-blue" />
        <h3 className="text-lg font-semibold text-foreground">
          {isArabic ? "إجراءات سريعة" : "Quick Actions"}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex items-center gap-3 p-4 h-auto justify-start hover:${action.bgColor} transition-all duration-200`}
            onClick={action.action}
          >
            <div className={`p-2 rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-4 w-4 ${action.color}`} />
            </div>
            <span className="font-medium">{action.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}