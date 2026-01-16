import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRTL } from "@/hooks/useRTL";
import { AppRole, Permission, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../types';
import { Shield, Check, X, Crown, UserCog, Briefcase, User, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_INFO: Record<AppRole, { 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: { en: string; ar: string };
  description: { en: string; ar: string };
}> = {
  owner: {
    icon: Crown,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    label: { en: 'Owner', ar: 'المالك' },
    description: { 
      en: 'Full access to all features, billing, and organization management',
      ar: 'وصول كامل لجميع الميزات والفواتير وإدارة المنظمة'
    },
  },
  admin: {
    icon: UserCog,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    label: { en: 'Administrator', ar: 'مدير النظام' },
    description: { 
      en: 'Full access except billing and organization deletion',
      ar: 'وصول كامل ما عدا الفواتير وحذف المنظمة'
    },
  },
  manager: {
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    label: { en: 'Manager', ar: 'مشرف' },
    description: { 
      en: 'Can manage day-to-day operations and team members',
      ar: 'يمكنه إدارة العمليات اليومية وأعضاء الفريق'
    },
  },
  member: {
    icon: User,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    label: { en: 'Member', ar: 'عضو' },
    description: { 
      en: 'Can create and edit records, limited management access',
      ar: 'يمكنه إنشاء وتعديل السجلات، وصول محدود للإدارة'
    },
  },
  viewer: {
    icon: Eye,
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    label: { en: 'Viewer', ar: 'مشاهد' },
    description: { 
      en: 'Read-only access to view data without modifications',
      ar: 'وصول للقراءة فقط لعرض البيانات بدون تعديل'
    },
  },
};

const PERMISSION_GROUPS: {
  name: { en: string; ar: string };
  permissions: { key: Permission; label: { en: string; ar: string } }[];
}[] = [
  {
    name: { en: 'Organization', ar: 'المنظمة' },
    permissions: [
      { key: 'org:manage', label: { en: 'Manage Organization', ar: 'إدارة المنظمة' } },
      { key: 'org:billing', label: { en: 'Manage Billing', ar: 'إدارة الفواتير' } },
    ],
  },
  {
    name: { en: 'Users', ar: 'المستخدمين' },
    permissions: [
      { key: 'users:manage', label: { en: 'Manage Users', ar: 'إدارة المستخدمين' } },
      { key: 'users:invite', label: { en: 'Invite Users', ar: 'دعوة المستخدمين' } },
      { key: 'users:view', label: { en: 'View Users', ar: 'عرض المستخدمين' } },
    ],
  },
  {
    name: { en: 'Products', ar: 'المنتجات' },
    permissions: [
      { key: 'products:create', label: { en: 'Create', ar: 'إنشاء' } },
      { key: 'products:edit', label: { en: 'Edit', ar: 'تعديل' } },
      { key: 'products:delete', label: { en: 'Delete', ar: 'حذف' } },
      { key: 'products:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Sales', ar: 'المبيعات' },
    permissions: [
      { key: 'sales:create', label: { en: 'Create', ar: 'إنشاء' } },
      { key: 'sales:edit', label: { en: 'Edit', ar: 'تعديل' } },
      { key: 'sales:delete', label: { en: 'Delete', ar: 'حذف' } },
      { key: 'sales:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Customers', ar: 'العملاء' },
    permissions: [
      { key: 'customers:create', label: { en: 'Create', ar: 'إنشاء' } },
      { key: 'customers:edit', label: { en: 'Edit', ar: 'تعديل' } },
      { key: 'customers:delete', label: { en: 'Delete', ar: 'حذف' } },
      { key: 'customers:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Invoices', ar: 'الفواتير' },
    permissions: [
      { key: 'invoices:create', label: { en: 'Create', ar: 'إنشاء' } },
      { key: 'invoices:edit', label: { en: 'Edit', ar: 'تعديل' } },
      { key: 'invoices:delete', label: { en: 'Delete', ar: 'حذف' } },
      { key: 'invoices:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Expenses', ar: 'المصروفات' },
    permissions: [
      { key: 'expenses:create', label: { en: 'Create', ar: 'إنشاء' } },
      { key: 'expenses:edit', label: { en: 'Edit', ar: 'تعديل' } },
      { key: 'expenses:delete', label: { en: 'Delete', ar: 'حذف' } },
      { key: 'expenses:approve', label: { en: 'Approve', ar: 'موافقة' } },
      { key: 'expenses:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Inventory', ar: 'المخزون' },
    permissions: [
      { key: 'inventory:manage', label: { en: 'Manage', ar: 'إدارة' } },
      { key: 'inventory:view', label: { en: 'View', ar: 'عرض' } },
    ],
  },
  {
    name: { en: 'Reports', ar: 'التقارير' },
    permissions: [
      { key: 'reports:view', label: { en: 'View Reports', ar: 'عرض التقارير' } },
      { key: 'reports:export', label: { en: 'Export Reports', ar: 'تصدير التقارير' } },
    ],
  },
  {
    name: { en: 'Settings', ar: 'الإعدادات' },
    permissions: [
      { key: 'settings:manage', label: { en: 'Manage Settings', ar: 'إدارة الإعدادات' } },
      { key: 'settings:view', label: { en: 'View Settings', ar: 'عرض الإعدادات' } },
    ],
  },
];

const ROLES_ORDER: AppRole[] = ['owner', 'admin', 'manager', 'member', 'viewer'];

export function OrganizationRolesTab() {
  const { isArabic } = useRTL();

  const hasPermission = (role: AppRole, permission: Permission): boolean => {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  return (
    <div className="space-y-6">
      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {ROLES_ORDER.map((role) => {
          const info = ROLE_INFO[role];
          const Icon = info.icon;
          const permissionCount = ROLE_PERMISSIONS[role]?.length || 0;
          
          return (
            <Card key={role} className="relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 right-0 h-1", info.color.replace('bg-', 'bg-').split(' ')[0])} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", info.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">
                    {isArabic ? info.label.ar : info.label.en}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {isArabic ? info.description.ar : info.description.en}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {permissionCount} {isArabic ? 'صلاحية' : 'permissions'}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isArabic ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'عرض تفصيلي للصلاحيات المتاحة لكل دور'
              : 'Detailed view of permissions available for each role'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b bg-muted/50 font-medium">
                    {isArabic ? 'الصلاحية' : 'Permission'}
                  </th>
                  {ROLES_ORDER.map((role) => (
                    <th key={role} className="p-3 border-b bg-muted/50 text-center min-w-[100px]">
                      <Badge variant="outline" className={cn("font-medium", ROLE_INFO[role].color)}>
                        {isArabic ? ROLE_INFO[role].label.ar : ROLE_INFO[role].label.en}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <>
                    <tr key={`group-${group.name.en}`}>
                      <td 
                        colSpan={ROLES_ORDER.length + 1} 
                        className="p-3 bg-muted/30 font-semibold border-b"
                      >
                        {isArabic ? group.name.ar : group.name.en}
                      </td>
                    </tr>
                    {group.permissions.map((permission) => (
                      <tr key={permission.key} className="hover:bg-muted/20">
                        <td className="p-3 border-b text-sm">
                          {isArabic ? permission.label.ar : permission.label.en}
                        </td>
                        {ROLES_ORDER.map((role) => (
                          <td key={`${permission.key}-${role}`} className="p-3 border-b text-center">
                            {hasPermission(role, permission.key) ? (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
