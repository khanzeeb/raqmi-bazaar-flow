import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRTL } from "@/hooks/useRTL";
import { useOrganization, PermissionGate } from '@/features/organization';
import { AppRole, OrganizationMember, ROLE_HIERARCHY } from '../../types';
import { 
  Users, UserPlus, Search, MoreHorizontal, Mail, 
  Shield, Trash2, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - replace with API calls
const MOCK_MEMBERS: OrganizationMember[] = [
  {
    id: 'mem-1',
    userId: 'user-1',
    organizationId: 'org-1',
    role: 'owner',
    email: 'ahmed@raqmi.com',
    name: 'Ahmed Al-Rashid',
    isActive: true,
    joinedAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'mem-2',
    userId: 'user-2',
    organizationId: 'org-1',
    role: 'admin',
    email: 'sara@raqmi.com',
    name: 'Sara Ahmed',
    isActive: true,
    joinedAt: '2024-01-05T00:00:00Z',
    lastActiveAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'mem-3',
    userId: 'user-3',
    organizationId: 'org-1',
    role: 'manager',
    email: 'mohammed@raqmi.com',
    name: 'Mohammed Hassan',
    isActive: true,
    joinedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'mem-4',
    userId: 'user-4',
    organizationId: 'org-1',
    role: 'member',
    email: 'fatima@raqmi.com',
    name: 'Fatima Ali',
    isActive: false,
    joinedAt: '2024-01-12T00:00:00Z',
  },
];

const MOCK_INVITES = [
  { id: 'inv-1', email: 'newuser@example.com', role: 'member' as AppRole, expiresAt: '2024-02-01', status: 'pending' as const },
];

const ROLE_LABELS: Record<AppRole, { en: string; ar: string }> = {
  owner: { en: 'Owner', ar: 'المالك' },
  admin: { en: 'Admin', ar: 'مدير' },
  manager: { en: 'Manager', ar: 'مشرف' },
  member: { en: 'Member', ar: 'عضو' },
  viewer: { en: 'Viewer', ar: 'مشاهد' },
};

const ROLE_COLORS: Record<AppRole, string> = {
  owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  manager: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  member: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  viewer: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function OrganizationMembersTab() {
  const { isArabic } = useRTL();
  const { toast } = useToast();
  const { currentMembership, hasMinRole } = useOrganization();
  
  const [members] = useState<OrganizationMember[]>(MOCK_MEMBERS);
  const [pendingInvites] = useState(MOCK_INVITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    try {
      setIsInviting(true);
      // TODO: Call API to send invite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isArabic ? 'تم إرسال الدعوة' : 'Invitation Sent',
        description: isArabic 
          ? `تم إرسال دعوة إلى ${inviteEmail}`
          : `Invitation sent to ${inviteEmail}`,
      });
      
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في إرسال الدعوة' : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: AppRole) => {
    // TODO: Call API to update role
    toast({
      title: isArabic ? 'تم تحديث الدور' : 'Role Updated',
      description: isArabic ? 'تم تحديث دور العضو بنجاح' : 'Member role updated successfully',
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    // TODO: Call API to remove member
    toast({
      title: isArabic ? 'تمت الإزالة' : 'Removed',
      description: isArabic ? 'تم إزالة العضو من المنظمة' : 'Member removed from organization',
    });
  };

  const canManageRole = (targetRole: AppRole): boolean => {
    if (!currentMembership) return false;
    // Can only manage roles lower than your own
    return ROLE_HIERARCHY[currentMembership.role] > ROLE_HIERARCHY[targetRole];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with search and invite */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isArabic ? 'البحث عن عضو...' : 'Search members...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <PermissionGate permission="users:invite">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                {isArabic ? 'دعوة عضو' : 'Invite Member'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isArabic ? 'دعوة عضو جديد' : 'Invite New Member'}</DialogTitle>
                <DialogDescription>
                  {isArabic 
                    ? 'أرسل دعوة عبر البريد الإلكتروني للانضمام إلى المنظمة'
                    : 'Send an email invitation to join the organization'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الدور' : 'Role'}</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS)
                        .filter(([role]) => canManageRole(role as AppRole))
                        .map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {isArabic ? label.ar : label.en}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isInviting 
                    ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
                    : (isArabic ? 'إرسال الدعوة' : 'Send Invitation')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isArabic ? 'الأعضاء' : 'Members'}
            <Badge variant="secondary" className="ml-2">{members.length}</Badge>
          </CardTitle>
          <CardDescription>
            {isArabic ? 'إدارة أعضاء المنظمة وأدوارهم' : 'Manage organization members and their roles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'العضو' : 'Member'}</TableHead>
                <TableHead>{isArabic ? 'الدور' : 'Role'}</TableHead>
                <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isArabic ? 'تاريخ الانضمام' : 'Joined'}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                      {isArabic ? ROLE_LABELS[member.role].ar : ROLE_LABELS[member.role].en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {isArabic ? 'نشط' : 'Active'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        {isArabic ? 'غير نشط' : 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.joinedAt)}
                  </TableCell>
                  <TableCell>
                    {member.role !== 'owner' && canManageRole(member.role) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" />
                            {isArabic ? 'تغيير الدور' : 'Change Role'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {isArabic ? 'إزالة' : 'Remove'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {isArabic ? 'الدعوات المعلقة' : 'Pending Invitations'}
              <Badge variant="secondary">{pendingInvites.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'تنتهي في' : 'Expires'} {formatDate(invite.expiresAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={ROLE_COLORS[invite.role]}>
                      {isArabic ? ROLE_LABELS[invite.role].ar : ROLE_LABELS[invite.role].en}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
