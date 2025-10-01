import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  TrendingUp,
  Settings,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.is_read) return false;
    if (categoryFilter && n.category !== categoryFilter) return false;
    return true;
  });

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'alert':
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'info':
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'alert':
        return 'border-destructive/50 bg-destructive/5';
      case 'warning':
        return 'border-warning/50 bg-warning/5';
      case 'success':
        return 'border-success/50 bg-success/5';
      case 'info':
      default:
        return 'border-primary/50 bg-primary/5';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-destructive text-destructive-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-blue-500 text-white',
      low: 'bg-muted text-muted-foreground'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    } else if (notification.related_section) {
      window.location.hash = notification.related_section;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You are all caught up!'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              All Categories
            </Button>
            {['metric_threshold', 'system', 'insight', 'report'].map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="capitalize"
              >
                {category.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading notifications...</div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No notifications found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter === 'unread'
                      ? 'All caught up! No unread notifications.'
                      : 'Check back later for updates.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      getNotificationColor(notification),
                      !notification.is_read && 'border-l-4'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            notification.type === 'alert' && 'bg-destructive/10 text-destructive',
                            notification.type === 'warning' && 'bg-warning/10 text-warning',
                            notification.type === 'success' && 'bg-success/10 text-success',
                            notification.type === 'info' && 'bg-primary/10 text-primary'
                          )}
                        >
                          {getNotificationIcon(notification)}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              'text-sm font-semibold',
                              !notification.is_read && 'text-primary'
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className={cn('text-xs', getPriorityBadge(notification.priority))}
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {notification.category.replace('_', ' ')}
                              </Badge>
                              <span>
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(notification.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
