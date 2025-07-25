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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
  variants?: string[];
  barcode?: string;
  description?: string;
  descriptionAr?: string;
  unitOfMeasure?: string;
  minStock?: number;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  isArabic?: boolean;
}

const categories = [
  "Smartphones",
  "Audio",
  "Computers",
  "Gaming",
  "Accessories",
  "Home & Garden",
  "Fashion",
  "Sports"
];

const unitsOfMeasure = [
  "piece",
  "kg",
  "gram",
  "liter",
  "meter",
  "box",
  "pack"
];

export function ProductDialog({ open, onOpenChange, product, onSave, isArabic = false }: ProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameAr: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
    variants: [],
    description: '',
    descriptionAr: '',
    unitOfMeasure: 'piece',
    minStock: 5
  });
  const [newVariant, setNewVariant] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        nameAr: '',
        sku: '',
        category: '',
        price: 0,
        stock: 0,
        status: 'active',
        variants: [],
        description: '',
        descriptionAr: '',
        unitOfMeasure: 'piece',
        minStock: 5
      });
    }
  }, [product]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const addVariant = () => {
    if (newVariant.trim()) {
      setFormData({
        ...formData,
        variants: [...(formData.variants || []), newVariant.trim()]
      });
      setNewVariant('');
    }
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants?.filter((_, i) => i !== index) || []
    });
  };

  const generateSKU = () => {
    const prefix = formData.name?.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    setFormData({
      ...formData,
      sku: `${prefix}-${timestamp}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product 
              ? (isArabic ? "تحرير المنتج" : "Edit Product")
              : (isArabic ? "إضافة منتج جديد" : "Add New Product")
            }
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                {isArabic ? "اسم المنتج (إنجليزي)" : "Product Name (English)"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isArabic ? "أدخل اسم المنتج" : "Enter product name"}
              />
            </div>

            <div>
              <Label htmlFor="nameAr">
                {isArabic ? "اسم المنتج (عربي)" : "Product Name (Arabic)"}
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder={isArabic ? "أدخل اسم المنتج بالعربية" : "Enter product name in Arabic"}
              />
            </div>

            <div>
              <Label htmlFor="sku">
                {isArabic ? "رمز المنتج (SKU)" : "SKU"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder={isArabic ? "أدخل رمز المنتج" : "Enter SKU"}
                />
                <Button variant="outline" size="sm" onClick={generateSKU}>
                  {isArabic ? "توليد" : "Generate"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="category">
                {isArabic ? "الفئة" : "Category"}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unitOfMeasure">
                {isArabic ? "وحدة القياس" : "Unit of Measure"}
              </Label>
              <Select
                value={formData.unitOfMeasure}
                onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitsOfMeasure.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">
                {isArabic ? "السعر (ر.س)" : "Price (SAR)"}
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="stock">
                {isArabic ? "المخزون الحالي" : "Current Stock"}
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="minStock">
                {isArabic ? "الحد الأدنى للمخزون" : "Minimum Stock Level"}
              </Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                placeholder="5"
              />
            </div>

            <div>
              <Label htmlFor="barcode">
                {isArabic ? "الباركود" : "Barcode"}
              </Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder={isArabic ? "أدخل الباركود" : "Enter barcode"}
              />
            </div>

            <div>
              <Label>
                {isArabic ? "صورة المنتج" : "Product Image"}
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "اسحب الصورة هنا أو انقر للرفع" : "Drag image here or click to upload"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="space-y-4">
          <div>
            <Label>
              {isArabic ? "متغيرات المنتج" : "Product Variants"}
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value)}
                placeholder={isArabic ? "مثل: 128GB، أحمر، كبير" : "e.g. 128GB, Red, Large"}
                onKeyPress={(e) => e.key === 'Enter' && addVariant()}
              />
              <Button variant="outline" onClick={addVariant}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.variants?.map((variant, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {variant}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeVariant(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">
              {isArabic ? "الوصف (إنجليزي)" : "Description (English)"}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isArabic ? "أدخل وصف المنتج" : "Enter product description"}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="descriptionAr">
              {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
            </Label>
            <Textarea
              id="descriptionAr"
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder={isArabic ? "أدخل وصف المنتج بالعربية" : "Enter product description in Arabic"}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            {isArabic ? "حفظ المنتج" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}