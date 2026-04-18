'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCheck, Trash2, FileText, Megaphone, AlertTriangle, Info, CheckCircle, Pill, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { getNotifications, markNotificationRead, markAllRead, Notification, seedCommunicationData } from '@/lib/communication';
import Link from 'next/link';

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  info: { icon: Info, color: 'bg-chart-1/10 text-chart-1' },
  success: { icon: CheckCircle, color: 'bg-chart-3/10 text-chart-3' },
  warning: { icon: AlertTriangle, color: 'bg-chart-5/10 text-chart-5' },
  error: { icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
  prescription: { icon: Pill, color: 'bg-chart-3/10 text-chart-3' },
  assignment: { icon: BookOpen, color: 'bg-chart-2/10 text-chart-2' },
  announcement: { icon: Megaphone, color: 'bg-chart-4/10 text-chart-4' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedCommunicationData();
    setNotifications(getNotifications());
  }, []);

  function refresh() { setNotifications(getNotifications()); }

  function handleRead(id: string) { markNotificationRead(id); refresh(); }
  function handleMarkAllRead() { markAllRead(); refresh(); }

  if (!mounted) return null;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">{unread} unread notifications</p>
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition text-sm font-medium">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </motion.div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-display font-medium">No notifications</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          ) : notifications.map((notif, i) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={cn('bg-card border border-border rounded-xl p-4 flex items-start gap-3 transition-all cursor-pointer hover:shadow-sm',
                  !notif.read && 'border-l-4 border-l-primary bg-primary/[0.02]'
                )}
                onClick={() => handleRead(notif.id)}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', config.color)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm', !notif.read ? 'font-bold' : 'font-medium')}>{notif.title}</p>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {notif.fromName && <span className="text-[10px] text-muted-foreground">From: {notif.fromName}</span>}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {notif.actionUrl && (
                    <Link href={notif.actionUrl} className="inline-block mt-2 text-xs text-primary hover:underline font-medium">
                      View details →
                    </Link>
                  )}
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0', config.color)}>
                  {notif.type}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
