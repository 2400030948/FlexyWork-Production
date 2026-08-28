'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShieldAlert, Sparkles, Calendar, Users, Briefcase } from 'lucide-react';
import { Notification, User } from '../../types';
import EmptyState from '../../components/ui/EmptyState';
import { getMe } from '../../services/auth';
import { getNotifications, markNotificationRead } from '../../services/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = await getMe();
      setCurrentUser(user);
      if (!user) {
        router.push('/login');
        return;
      }
      setNotifications(await getNotifications());
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const markAllRead = () => {
    const unread = notifications.filter((notification) => !notification.read);
    Promise.all(unread.map((notification) => markNotificationRead(notification.id))).then(() => {
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    });
  };

  const getNotifIcon = (type: 'booking' | 'gig' | 'system' | 'community') => {
    switch (type) {
      case 'booking':
        return <Calendar className="text-brand-500" size={16} />;
      case 'gig':
        return <Briefcase className="text-indigo-500" size={16} />;
      case 'community':
        return <Users className="text-emerald-500" size={16} />;
      default:
        return <Bell className="text-stone-500" size={16} />;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Notification Center</h1>
          <p className="text-xs text-ink-muted mt-0.5">Stay up to date with matching progress, collectives, and ratings.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllRead}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Your inbox is clear"
          description="New notifications regarding service updates, matching alerts, and cooperative bids will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`flex items-start gap-4 p-4 border rounded-2xl transition-all ${
                n.read 
                  ? 'border-surface-border bg-white' 
                  : 'border-brand-100 bg-brand-50/15 ring-1 ring-brand-500/5'
              }`}
            >
              <span className={`p-2.5 rounded-xl border shrink-0 bg-stone-50 border-stone-150`}>
                {getNotifIcon(n.type)}
              </span>
              <div className="space-y-0.5 flex-grow">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-xs font-bold text-ink leading-tight">{n.title}</h4>
                  <span className="text-[10px] text-ink-subtle font-medium shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
