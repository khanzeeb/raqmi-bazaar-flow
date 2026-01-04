import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, FolderTree, ChevronRight, ChevronDown, Save } from "lucide-react";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/hooks/use-toast";
import { categoryGateway, Category, CreateCategoryDTO } from "@/services/category.gateway";

interface CategoryFormData {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  parent_id: string | null;
  status: 'active' | 'inactive';
}

const emptyForm: CategoryFormData = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  parent_id: null,
  status: 'active',
};

export const CategoryManagement = () => {
  const { isArabic, isRTL } = useRTL();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const response = await categoryGateway.getAll();
    if (response.success && response.data) {
      setCategories(response.data);
    }
    setLoading(false);
  };

  const getRootCategories = () => categories.filter(c => !c.parent_id);
  const getChildCategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const openAddDialog = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({ ...emptyForm, parent_id: parentId || null });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameAr: category.nameAr || '',
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      parent_id: category.parent_id || null,
      status: category.status,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: isArabic ? 'خطأ' : 'Error', description: isArabic ? 'اسم الفئة مطلوب' : 'Category name is required', variant: 'destructive' });
      return;
    }

    const data: CreateCategoryDTO = {
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      parent_id: formData.parent_id,
      status: formData.status,
    };

    if (editingCategory) {
      const response = await categoryGateway.update({ id: editingCategory.id, ...data });
      if (response.success) {
        toast({ title: isArabic ? 'تم التحديث' : 'Updated', description: isArabic ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully' });
        fetchCategories();
      }
    } else {
      const response = await categoryGateway.create(data);
      if (response.success) {
        toast({ title: isArabic ? 'تمت الإضافة' : 'Added', description: isArabic ? 'تمت إضافة الفئة بنجاح' : 'Category added successfully' });
        fetchCategories();
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    const response = await categoryGateway.delete(deletingCategory.id);
    if (response.success) {
      toast({ title: isArabic ? 'تم الحذف' : 'Deleted', description: isArabic ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully' });
      fetchCategories();
    }
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center justify-between p-3 border-b hover:bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ paddingLeft: isRTL ? undefined : `${level * 24 + 12}px`, paddingRight: isRTL ? `${level * 24 + 12}px` : undefined }}
        >
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {hasChildren ? (
              <button onClick={() => toggleExpand(category.id)} className="p-1 hover:bg-muted rounded">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <FolderTree className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{isArabic && category.nameAr ? category.nameAr : category.name}</span>
            <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
              {category.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="ghost" size="sm" onClick={() => openAddDialog(category.id)}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(category)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        {isExpanded && children.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className={`flex flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FolderTree className="w-5 h-5" />
            {isArabic ? 'إدارة الفئات' : 'Category Management'}
          </CardTitle>
          <Button onClick={() => openAddDialog()} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Plus className="w-4 h-4" />
            {isArabic ? 'إضافة فئة رئيسية' : 'Add Main Category'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'لا توجد فئات. أضف فئة جديدة للبدء.' : 'No categories. Add a new category to get started.'}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {getRootCategories().map(category => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory 
                ? (isArabic ? 'تعديل الفئة' : 'Edit Category')
                : formData.parent_id 
                  ? (isArabic ? 'إضافة فئة فرعية' : 'Add Subcategory')
                  : (isArabic ? 'إضافة فئة رئيسية' : 'Add Main Category')
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isArabic ? 'الاسم (انجليزي)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Electronics"
                />
              </div>
              <div>
                <Label>{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="إلكترونيات"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div>
              <Label>{isArabic ? 'الوصف (انجليزي)' : 'Description (English)'}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Input
                value={formData.descriptionAr}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                dir="rtl"
              />
            </div>

            {!formData.parent_id && editingCategory && (
              <div>
                <Label>{isArabic ? 'الفئة الرئيسية' : 'Parent Category'}</Label>
                <Select
                  value={formData.parent_id || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === 'none' ? null : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? 'اختر الفئة الرئيسية' : 'Select parent category'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isArabic ? 'فئة رئيسية' : 'Root Category'}</SelectItem>
                    {getRootCategories().filter(c => c.id !== editingCategory?.id).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {isArabic && cat.nameAr ? cat.nameAr : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-muted-foreground">{isArabic ? 'غير نشط' : 'Inactive'}</span>
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                />
                <span className="text-sm text-muted-foreground">{isArabic ? 'نشط' : 'Active'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Save className="w-4 h-4" />
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {isArabic 
              ? `هل أنت متأكد من حذف الفئة "${deletingCategory?.nameAr || deletingCategory?.name}"؟ سيتم حذف جميع الفئات الفرعية أيضًا.`
              : `Are you sure you want to delete "${deletingCategory?.name}"? All subcategories will also be deleted.`
            }
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
