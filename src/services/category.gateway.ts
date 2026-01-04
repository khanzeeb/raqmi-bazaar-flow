// Category Gateway - API layer for product categories

import { ApiResponse, PaginatedResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:3001/api/categories';

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  parent_id?: string | null;
  parentCategory?: Category | null;
  children?: Category[];
  sort_order: number;
  status: 'active' | 'inactive';
  meta_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDTO {
  name: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  parent_id?: string | null;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id: string;
}

// Static fallback data for when API is unavailable
const STATIC_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
    descriptionAr: 'الأجهزة الإلكترونية والملحقات',
    parent_id: null,
    sort_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Laptops',
    nameAr: 'حواسيب محمولة',
    slug: 'laptops',
    description: 'Laptop computers',
    descriptionAr: 'أجهزة الكمبيوتر المحمولة',
    parent_id: '1',
    sort_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Smartphones',
    nameAr: 'هواتف ذكية',
    slug: 'smartphones',
    description: 'Mobile phones and accessories',
    descriptionAr: 'الهواتف المحمولة والملحقات',
    parent_id: '1',
    sort_order: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Furniture',
    nameAr: 'أثاث',
    slug: 'furniture',
    description: 'Home and office furniture',
    descriptionAr: 'أثاث المنزل والمكتب',
    parent_id: null,
    sort_order: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Office Chairs',
    nameAr: 'كراسي مكتبية',
    slug: 'office-chairs',
    description: 'Ergonomic office chairs',
    descriptionAr: 'كراسي مكتبية مريحة',
    parent_id: '4',
    sort_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localCategories = [...STATIC_CATEGORIES];

export interface ICategoryGateway {
  getAll(): Promise<ApiResponse<Category[]>>;
  getById(id: string): Promise<ApiResponse<Category>>;
  getTree(): Promise<ApiResponse<Category[]>>;
  create(data: CreateCategoryDTO): Promise<ApiResponse<Category>>;
  update(data: UpdateCategoryDTO): Promise<ApiResponse<Category>>;
  delete(id: string): Promise<ApiResponse<boolean>>;
}

const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const categoryGateway: ICategoryGateway = {
  async getAll() {
    try {
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('API unavailable, using local data:', error);
      return { success: true, data: localCategories };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const category = localCategories.find(c => c.id === id);
      if (category) {
        return { success: true, data: category };
      }
      return { success: false, error: 'Category not found' };
    }
  },

  async getTree() {
    try {
      const response = await fetch(`${API_BASE_URL}/tree`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      // Build tree from flat list
      const rootCategories = localCategories.filter(c => !c.parent_id);
      const tree = rootCategories.map(parent => ({
        ...parent,
        children: localCategories.filter(c => c.parent_id === parent.id),
      }));
      return { success: true, data: tree };
    }
  },

  async create(data) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result, message: 'Category created successfully' };
    } catch (error) {
      // Create locally
      const newCategory: Category = {
        id: generateId(),
        name: data.name,
        nameAr: data.nameAr,
        slug: data.slug || generateSlug(data.name),
        description: data.description,
        descriptionAr: data.descriptionAr,
        image: data.image,
        parent_id: data.parent_id || null,
        sort_order: data.sort_order || localCategories.length + 1,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localCategories.push(newCategory);
      return { success: true, data: newCategory, message: 'Category created (local)' };
    }
  },

  async update(data) {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result, message: 'Category updated successfully' };
    } catch (error) {
      // Update locally
      const index = localCategories.findIndex(c => c.id === data.id);
      if (index === -1) {
        return { success: false, error: 'Category not found' };
      }
      localCategories[index] = {
        ...localCategories[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: localCategories[index], message: 'Category updated (local)' };
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return { success: true, data: true, message: 'Category deleted successfully' };
    } catch (error) {
      // Delete locally
      const index = localCategories.findIndex(c => c.id === id);
      if (index === -1) {
        return { success: false, error: 'Category not found' };
      }
      // Also remove children
      localCategories = localCategories.filter(c => c.id !== id && c.parent_id !== id);
      return { success: true, data: true, message: 'Category deleted (local)' };
    }
  },
};
