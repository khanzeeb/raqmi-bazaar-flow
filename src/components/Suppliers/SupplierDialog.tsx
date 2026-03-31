import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Supplier } from "@/types/supplier.types";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSave: (supplier: Partial<Supplier>) => void;
  isArabic?: boolean;
}

const countries = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "United States",
  "China",
  "India",
];

export function SupplierDialog({ open, onOpenChange, supplier, onSave, isArabic = false }: SupplierDialogProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: 'active',
    creditLimit: 0,
    address: { street: '', city: '', state: '', postalCode: '', country: 'Saudi Arabia' },
    taxId: '',
    notes: '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        status: 'active',
        creditLimit: 0,
        address: { street: '', city: '', state: '', postalCode: '', country: 'Saudi Arabia' },
        taxId: '',
        notes: '',
      });
    }
  }, [supplier]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const updateAddress = (field: string, value: string) => {
    setFormData({
      ...formData,
      address: { ...formData.address!, [field]: value },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier
              ? (isArabic ? "تحرير المورد" : "Edit Supplier")
              : (isArabic ? "إضافة مورد جديد" : "Add New Supplier")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              {isArabic ? "المعلومات الأساسية" : "Basic Info"}
            </TabsTrigger>
            <TabsTrigger value="address">
              {isArabic ? "العنوان" : "Address"}
            </TabsTrigger>
            <TabsTrigger value="additional">
              {isArabic ? "معلومات إضافية" : "Additional"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{isArabic ? "اسم المورد" : "Supplier Name"}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isArabic ? "أدخل اسم المورد" : "Enter supplier name"}
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">{isArabic ? "جهة الاتصال" : "Contact Person"}</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder={isArabic ? "أدخل اسم جهة الاتصال" : "Enter contact person"}
                />
              </div>
              <div>
                <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isArabic ? "أدخل البريد الإلكتروني" : "Enter email"}
                />
              </div>
              <div>
                <Label htmlFor="phone">{isArabic ? "رقم الهاتف" : "Phone"}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={isArabic ? "أدخل رقم الهاتف" : "Enter phone number"}
                />
              </div>
              <div>
                <Label htmlFor="creditLimit">{isArabic ? "حد الائتمان" : "Credit Limit"}</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="taxId">{isArabic ? "الرقم الضريبي" : "Tax ID"}</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder={isArabic ? "أدخل الرقم الضريبي" : "Enter tax ID"}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">{isArabic ? "الشارع" : "Street Address"}</Label>
                <Input
                  id="street"
                  value={formData.address?.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  placeholder={isArabic ? "أدخل عنوان الشارع" : "Enter street address"}
                />
              </div>
              <div>
                <Label htmlFor="city">{isArabic ? "المدينة" : "City"}</Label>
                <Input
                  id="city"
                  value={formData.address?.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder={isArabic ? "أدخل المدينة" : "Enter city"}
                />
              </div>
              <div>
                <Label htmlFor="state">{isArabic ? "المنطقة" : "State/Region"}</Label>
                <Input
                  id="state"
                  value={formData.address?.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  placeholder={isArabic ? "أدخل المنطقة" : "Enter state"}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">{isArabic ? "الرمز البريدي" : "Postal Code"}</Label>
                <Input
                  id="postalCode"
                  value={formData.address?.postalCode}
                  onChange={(e) => updateAddress('postalCode', e.target.value)}
                  placeholder={isArabic ? "أدخل الرمز البريدي" : "Enter postal code"}
                />
              </div>
              <div>
                <Label htmlFor="country">{isArabic ? "البلد" : "Country"}</Label>
                <Select
                  value={formData.address?.country}
                  onValueChange={(value) => updateAddress('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div>
              <Label htmlFor="notes">{isArabic ? "ملاحظات" : "Notes"}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={isArabic ? "أدخل ملاحظات" : "Enter notes"}
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            {supplier
              ? (isArabic ? "تحديث" : "Update")
              : (isArabic ? "إضافة" : "Add Supplier")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
