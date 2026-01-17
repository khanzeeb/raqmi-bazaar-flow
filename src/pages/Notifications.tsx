import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/features/notifications/services/notificationService';
import { Notification } from '@/features/notifications/types';
import { formatDistanceToNow } from 'date-fns';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    const filters: any = {};
    if (filter === 'unread') filters.read = false;
    if (filter === 'read') filters.read = true;
    if (categoryFilter !== 'all') filters.category = categoryFilter;

    const response = await notificationService.getNotifications(filters);
    if (response.success && response.data) {
      setNotifications(response.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, categoryFilter]);

  const handleMarkAsRead = async (id: string) => {
    const response = await notificationService.markAsRead(id);
    if (response.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n));
      toast({ title: 'Notification marked as read' });
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await notificationService.markAllAsRead('current-user');
    if (response.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      toast({ title: 'All notifications marked as read' });
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      urgent: 'destructive', high: 'destructive', medium: 'default', low: 'secondary'
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">{unreadCount} unread notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4 mr-2" />Mark all read</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger><TabsTrigger value="read">Read</TabsTrigger></TabsList>
        </Tabs>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="order">Orders</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="alert">Alerts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-32"><RefreshCw className="h-6 w-6 animate-spin" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No notifications found</p></div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border transition-colors ${!notification.read ? 'bg-accent/50 border-primary/20' : 'bg-background'}`}>
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="outline">{notification.category}</Badge>
                          {!notification.read && <Badge variant="secondary">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)}><Check className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
