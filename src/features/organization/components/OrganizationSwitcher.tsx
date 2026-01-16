import React, { useState } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useRoleInfo } from '../hooks/usePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Check, ChevronDown, Plus, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const {
    currentOrganization,
    organizations,
    isLoading,
    switchOrganization,
    hasPermission,
  } = useOrganization();
  const { label: roleLabel, color: roleColor, role } = useRoleInfo();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrganization?.id) return;
    
    try {
      setSwitching(true);
      await switchOrganization(orgId);
    } finally {
      setSwitching(false);
    }
  };

  if (isLoading && !currentOrganization) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg" />
        <div className="hidden md:block">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded mt-1" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 h-auto py-2",
            switching && "opacity-50 pointer-events-none"
          )}
          disabled={switching}
        >
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            {currentOrganization?.logo ? (
              <img
                src={currentOrganization.logo}
                alt={currentOrganization.name}
                className="w-6 h-6 rounded"
              />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium truncate max-w-[140px]">
              {currentOrganization?.name || (isArabic ? 'اختر المنظمة' : 'Select Organization')}
            </span>
            {role && roleLabel && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", roleColor)}>
                {isArabic ? roleLabel.ar : roleLabel.en}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">
            {isArabic ? 'المنظمات' : 'Organizations'}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map((org) => {
          const isSelected = org.id === currentOrganization?.id;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className={cn(
                "flex items-center gap-3 py-2.5 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                {org.logo ? (
                  <img src={org.logo} alt={org.name} className="w-6 h-6 rounded" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{org.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {org.industry || org.slug}
                </p>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        
        {organizations.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {isArabic ? 'لا توجد منظمات' : 'No organizations'}
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        {hasPermission('users:manage') && (
          <DropdownMenuItem className="gap-2">
            <Users className="h-4 w-4" />
            {isArabic ? 'إدارة الأعضاء' : 'Manage Members'}
          </DropdownMenuItem>
        )}
        
        {hasPermission('settings:manage') && (
          <DropdownMenuItem className="gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? 'إعدادات المنظمة' : 'Organization Settings'}
          </DropdownMenuItem>
        )}
        
        {hasPermission('org:manage') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Plus className="h-4 w-4" />
              {isArabic ? 'إنشاء منظمة جديدة' : 'Create New Organization'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
