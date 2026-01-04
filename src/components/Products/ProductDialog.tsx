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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, ChevronDown, Check } from "lucide-react";
import { ProductView } from "@/types/product.types";
import { categoryGateway, Category } from "@/services/category.gateway";
import { useToast } from "@/hooks/use-toast";

// Form data type for dialog
interface ProductFormData {
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  category_id?: string;
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
  product: ProductView | null;
  onSave: (product: Partial<ProductView>) => void;
  isArabic?: boolean;
}

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
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    nameAr: '',
    sku: '',
    category: '',
    category_id: '',
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
  
  // Quick add category state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickCategoryNameAr, setQuickCategoryNameAr] = useState('');
  const [quickCategoryParent, setQuickCategoryParent] = useState<string>('');
  const [savingCategory, setSavingCategory] = useState(false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const response = await categoryGateway.getAll();
    if (response.success && response.data) {
      setCategories(response.data);
    }
    setLoadingCategories(false);
  };

  const handleQuickAddCategory = async () => {
    if (!quickCategoryName.trim()) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "اسم الفئة مطلوب" : "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setSavingCategory(true);
    const response = await categoryGateway.create({
      name: quickCategoryName.trim(),
      nameAr: quickCategoryNameAr.trim() || undefined,
      parent_id: quickCategoryParent || undefined,
      status: 'active'
    });

    if (response.success && response.data) {
      await fetchCategories();
      // Auto-select the newly created category
      setFormData({
        ...formData,
        category_id: response.data.id,
        category: response.data.name
      });
      // Reset quick add form
      setQuickCategoryName('');
      setQuickCategoryNameAr('');
      setQuickCategoryParent('');
      setShowQuickAdd(false);
      toast({
        title: isArabic ? "تم" : "Success",
        description: isArabic ? "تم إضافة الفئة بنجاح" : "Category added successfully"
      });
    } else {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إضافة الفئة" : "Failed to add category",
        variant: "destructive"
      });
    }
    setSavingCategory(false);
  };

  // Build flat list with hierarchy indication for display
  const getCategoryOptions = () => {
    const rootCategories = categories.filter(c => !c.parent_id);
    const options: { id: string; name: string; nameAr?: string; level: number }[] = [];
    
    const addCategory = (category: Category, level: number) => {
      options.push({ 
        id: category.id, 
        name: category.name, 
        nameAr: category.nameAr,
        level 
      });
      const children = categories.filter(c => c.parent_id === category.id);
      children.forEach(child => addCategory(child, level + 1));
    };
    
    rootCategories.forEach(cat => addCategory(cat, 0));
    return options;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        status: product.status === 'discontinued' ? 'inactive' : product.status,
      });
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

            <div className="space-y-2">
              <Label htmlFor="category">
                {isArabic ? "الفئة" : "Category"}
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.category_id || formData.category}
                  onValueChange={(value) => {
                    const selectedCategory = categories.find(c => c.id === value);
                    setFormData({ 
                      ...formData, 
                      category_id: value,
                      category: selectedCategory?.name || value 
                    });
                  }}
                  disabled={loadingCategories}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={loadingCategories ? (isArabic ? "جاري التحميل..." : "Loading...") : (isArabic ? "اختر الفئة" : "Select category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions().map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <span style={{ paddingLeft: `${option.level * 16}px` }}>
                          {option.level > 0 && "└ "}
                          {isArabic && option.nameAr ? option.nameAr : option.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  title={isArabic ? "إضافة فئة جديدة" : "Add new category"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Add Category Form */}
              <Collapsible open={showQuickAdd} onOpenChange={setShowQuickAdd}>
                <CollapsibleContent className="space-y-3 pt-2 border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {isArabic ? "إضافة فئة سريعة" : "Quick Add Category"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickAdd(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={isArabic ? "اسم الفئة (إنجليزي)" : "Category Name (EN)"}
                      value={quickCategoryName}
                      onChange={(e) => setQuickCategoryName(e.target.value)}
                    />
                    <Input
                      placeholder={isArabic ? "اسم الفئة (عربي)" : "Category Name (AR)"}
                      value={quickCategoryNameAr}
                      onChange={(e) => setQuickCategoryNameAr(e.target.value)}
                    />
                  </div>
                  <Select
                    value={quickCategoryParent}
                    onValueChange={setQuickCategoryParent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "فئة رئيسية (اختياري)" : "Parent Category (Optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {isArabic ? "بدون فئة رئيسية" : "No Parent (Main Category)"}
                      </SelectItem>
                      {categories.filter(c => !c.parent_id).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {isArabic && cat.nameAr ? cat.nameAr : cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={handleQuickAddCategory}
                    disabled={savingCategory || !quickCategoryName.trim()}
                  >
                    {savingCategory ? (
                      isArabic ? "جاري الإضافة..." : "Adding..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {isArabic ? "إضافة الفئة" : "Add Category"}
                      </>
                    )}
                  </Button>
                </CollapsibleContent>
              </Collapsible>
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