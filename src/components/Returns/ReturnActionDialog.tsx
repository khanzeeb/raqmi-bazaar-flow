import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Return } from "@/types/return.types";

interface ReturnActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnItem: Return | null;
  action: 'approve' | 'reject' | 'complete';
  onConfirm: () => void;
  isArabic: boolean;
}

const actionConfig = {
  approve: {
    title: { en: "Approve Return", ar: "الموافقة على المرتجع" },
    description: { 
      en: "Are you sure you want to approve this return? The customer will be notified.", 
      ar: "هل أنت متأكد من الموافقة على هذا المرتجع؟ سيتم إخطار العميل."
    },
    confirm: { en: "Approve", ar: "موافقة" },
    variant: "default" as const
  },
  reject: {
    title: { en: "Reject Return", ar: "رفض المرتجع" },
    description: { 
      en: "Are you sure you want to reject this return? This action cannot be undone.", 
      ar: "هل أنت متأكد من رفض هذا المرتجع؟ لا يمكن التراجع عن هذا الإجراء."
    },
    confirm: { en: "Reject", ar: "رفض" },
    variant: "destructive" as const
  },
  complete: {
    title: { en: "Complete Return", ar: "إتمام المرتجع" },
    description: { 
      en: "Are you sure you want to mark this return as complete? The refund will be processed.", 
      ar: "هل أنت متأكد من إتمام هذا المرتجع؟ سيتم معالجة الاسترداد."
    },
    confirm: { en: "Complete", ar: "إتمام" },
    variant: "default" as const
  }
};

export const ReturnActionDialog = ({
  open,
  onOpenChange,
  returnItem,
  action,
  onConfirm,
  isArabic
}: ReturnActionDialogProps) => {
  const config = actionConfig[action];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArabic ? config.title.ar : config.title.en}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {returnItem && (
              <span className="block mb-2 font-medium">
                {returnItem.return_number} - {returnItem.customer_name}
              </span>
            )}
            {isArabic ? config.description.ar : config.description.en}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {isArabic ? "إلغاء" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={action === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isArabic ? config.confirm.ar : config.confirm.en}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
