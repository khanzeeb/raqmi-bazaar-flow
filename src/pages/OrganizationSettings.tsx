import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Shield, CreditCard } from "lucide-react";
import { useRTL } from "@/hooks/useRTL";
import { useOrganization, PermissionGate } from "@/features/organization";
import { OrganizationProfileTab } from "@/features/organization/components/settings/OrganizationProfileTab";
import { OrganizationMembersTab } from "@/features/organization/components/settings/OrganizationMembersTab";
import { OrganizationRolesTab } from "@/features/organization/components/settings/OrganizationRolesTab";
import { OrganizationBillingTab } from "@/features/organization/components/settings/OrganizationBillingTab";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const OrganizationSettings = () => {
  const { isArabic, isRTL } = useRTL();
  const { currentOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? 'لم يتم اختيار منظمة' : 'No Organization Selected'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? 'الرجاء اختيار منظمة للمتابعة' : 'Please select an organization to continue'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGate
      minRole="admin"
      fallback={
        <div className="p-6 max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isArabic ? 'غير مصرح' : 'Access Denied'}
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                {isArabic 
                  ? 'ليس لديك صلاحية للوصول إلى إعدادات المنظمة. يرجى التواصل مع مدير المنظمة.'
                  : 'You do not have permission to access organization settings. Please contact your organization administrator.'}
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isArabic ? 'إعدادات المنظمة' : 'Organization Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? `إدارة إعدادات ${currentOrganization.name}`
              : `Manage settings for ${currentOrganization.name}`}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building2 className="w-4 h-4" />
              {isArabic ? 'الملف التعريفي' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="members" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className="w-4 h-4" />
              {isArabic ? 'الأعضاء' : 'Members'}
            </TabsTrigger>
            <TabsTrigger value="roles" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className="w-4 h-4" />
              {isArabic ? 'الأدوار' : 'Roles'}
            </TabsTrigger>
            <TabsTrigger value="billing" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="w-4 h-4" />
              {isArabic ? 'الفوترة' : 'Billing'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <OrganizationProfileTab />
          </TabsContent>

          <TabsContent value="members">
            <OrganizationMembersTab />
          </TabsContent>

          <TabsContent value="roles">
            <OrganizationRolesTab />
          </TabsContent>

          <TabsContent value="billing">
            <OrganizationBillingTab />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
};

export default OrganizationSettings;
