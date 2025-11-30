import { 
  Plus, 
  ShoppingCart, 
  FileText, 
  Users, 
  Package, 
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BilingualLabel } from "@/components/common/BilingualLabel";

interface QuickActionsProps {
  isArabic?: boolean;
}

export function QuickActions({ isArabic = false }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      titleEn: "New Sale",
      titleAr: "بيع جديد",
      icon: ShoppingCart,
      color: "icon-green",
      bgColor: "bg-icon-green/10",
      action: () => navigate("/sales-orders")
    },
    {
      titleEn: "New Quotation",
      titleAr: "عرض سعر جديد",
      icon: FileText,
      color: "icon-blue",
      bgColor: "bg-icon-blue/10",
      action: () => navigate("/quotations")
    },
    {
      titleEn: "Add Customer",
      titleAr: "إضافة عميل",
      icon: Users,
      color: "icon-purple",
      bgColor: "bg-icon-purple/10", 
      action: () => navigate("/customers")
    },
    {
      titleEn: "Add Product",
      titleAr: "إضافة منتج",
      icon: Package,
      color: "icon-orange",
      bgColor: "bg-icon-orange/10",
      action: () => navigate("/products")
    },
    {
      titleEn: "New Invoice",
      titleAr: "فاتورة جديدة",
      icon: Receipt,
      color: "icon-cyan",
      bgColor: "bg-icon-cyan/10",
      action: () => navigate("/invoices")
    }
  ];

  return (
    <div className={`card-elegant p-6 ${isArabic ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-2 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
        <Plus className="h-5 w-5 icon-blue" />
        <h3 className="text-lg font-semibold text-foreground">
          <BilingualLabel 
            enLabel="Quick Actions" 
            arLabel="إجراءات سريعة"
            showBoth={false}
          />
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex items-center gap-3 p-4 h-auto ${isArabic ? 'flex-row-reverse justify-end' : 'justify-start'} hover:${action.bgColor} transition-all duration-200`}
            onClick={action.action}
          >
            <div className={`p-2 rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-4 w-4 ${action.color}`} />
            </div>
            <BilingualLabel 
              enLabel={action.titleEn}
              arLabel={action.titleAr}
              className="font-medium"
              showBoth={true}
              primaryClassName="text-sm"
              secondaryClassName="text-[10px]"
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
