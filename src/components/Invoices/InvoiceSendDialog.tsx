import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Mail, Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/types/invoice.types";

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoiceSendDialog: React.FC<InvoiceSendDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [emailData, setEmailData] = useState({
    to: invoice?.customer.email || '',
    cc: '',
    bcc: '',
    subject: '',
    message: '',
    attachPDF: true,
    sendCopy: false
  });

  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  React.useEffect(() => {
    if (invoice) {
      setEmailData(prev => ({
        ...prev,
        to: invoice.customer.email || '',
        subject: isArabic 
          ? `فاتورة رقم ${invoice.invoiceNumber} من ${invoice.customer.name}`
          : `Invoice ${invoice.invoiceNumber} from ${invoice.customer.name}`,
        message: isArabic
          ? `عزيزي ${invoice.customer.name},\n\nنتشرف بإرسال فاتورتكم رقم ${invoice.invoiceNumber} بتاريخ ${invoice.issueDate}.\n\nالمبلغ المستحق: ${invoice.total.toLocaleString()} ر.س\nتاريخ الاستحقاق: ${invoice.dueDate}\n\nنشكركم لثقتكم بنا.\n\nمع أطيب التحيات`
          : `Dear ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoiceNumber} dated ${invoice.issueDate}.\n\nAmount Due: ${invoice.total.toLocaleString()} SAR\nDue Date: ${invoice.dueDate}\n\nThank you for your business.\n\nBest regards`
      }));
    }
  }, [invoice, isArabic]);

  if (!invoice) return null;

  const addEmail = () => {
    if (newEmail && !additionalEmails.includes(newEmail)) {
      setAdditionalEmails([...additionalEmails, newEmail]);
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setAdditionalEmails(additionalEmails.filter(e => e !== email));
  };

  const handleSend = () => {
    if (!emailData.to) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يرجى إدخال عنوان بريد إلكتروني" : "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isArabic ? "تم إرسال الفاتورة" : "Invoice Sent",
      description: isArabic 
        ? `تم إرسال الفاتورة ${invoice.invoiceNumber} إلى ${emailData.to}` 
        : `Invoice ${invoice.invoiceNumber} sent to ${emailData.to}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {isArabic ? 'إرسال الفاتورة' : 'Send Invoice'}: {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'إرسال الفاتورة عبر البريد الإلكتروني' : 'Send invoice via email'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Recipients */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Label className="text-base font-medium">{isArabic ? 'المستلمون' : 'Recipients'}</Label>
              
              <div>
                <Label htmlFor="to">{isArabic ? 'إلى' : 'To'} *</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder={isArabic ? "البريد الإلكتروني للعميل" : "Customer email address"}
                />
              </div>

              <div>
                <Label htmlFor="cc">{isArabic ? 'نسخة' : 'CC'}</Label>
                <Input
                  id="cc"
                  type="email"
                  value={emailData.cc}
                  onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder={isArabic ? "نسخة إضافية (اختياري)" : "Additional copy (optional)"}
                />
              </div>

              <div>
                <Label htmlFor="bcc">{isArabic ? 'نسخة مخفية' : 'BCC'}</Label>
                <Input
                  id="bcc"
                  type="email"
                  value={emailData.bcc}
                  onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder={isArabic ? "نسخة مخفية (اختياري)" : "Blind carbon copy (optional)"}
                />
              </div>

              {/* Additional Emails */}
              <div>
                <Label>{isArabic ? 'بريد إضافي' : 'Additional Emails'}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={isArabic ? "إضافة بريد إلكتروني آخر" : "Add another email"}
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                  />
                  <Button type="button" size="sm" onClick={addEmail}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {additionalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {additionalEmails.map((email) => (
                      <div key={email} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                        {email}
                        <button onClick={() => removeEmail(email)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Label className="text-base font-medium">{isArabic ? 'محتوى الرسالة' : 'Email Content'}</Label>
              
              <div>
                <Label htmlFor="subject">{isArabic ? 'موضوع الرسالة' : 'Subject'} *</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={isArabic ? "موضوع الرسالة" : "Email subject"}
                />
              </div>

              <div>
                <Label htmlFor="message">{isArabic ? 'نص الرسالة' : 'Message'}</Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={isArabic ? "اكتب رسالتك هنا..." : "Write your message here..."}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Label className="text-base font-medium">{isArabic ? 'خيارات الإرسال' : 'Send Options'}</Label>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isArabic ? 'إرفاق ملف PDF' : 'Attach PDF'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'إرفاق الفاتورة بصيغة PDF' : 'Attach invoice as PDF file'}
                  </p>
                </div>
                <Switch
                  checked={emailData.attachPDF}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, attachPDF: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isArabic ? 'إرسال نسخة لي' : 'Send me a copy'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'إرسال نسخة من الرسالة إلى بريدي' : 'Send a copy to my email'}
                  </p>
                </div>
                <Switch
                  checked={emailData.sendCopy}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, sendCopy: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-base font-medium">{isArabic ? 'معاينة الإرسال' : 'Send Preview'}</Label>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>• {isArabic ? 'إلى:' : 'To:'} {emailData.to}</p>
                {emailData.cc && <p>• {isArabic ? 'نسخة:' : 'CC:'} {emailData.cc}</p>}
                {additionalEmails.length > 0 && <p>• {isArabic ? 'إضافي:' : 'Additional:'} {additionalEmails.join(', ')}</p>}
                <p>• {isArabic ? 'المرفقات:' : 'Attachments:'} {emailData.attachPDF ? 'PDF' : (isArabic ? 'لا يوجد' : 'None')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSend} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {isArabic ? 'إرسال الفاتورة' : 'Send Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};