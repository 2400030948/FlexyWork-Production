import { Notification } from '../types';
import { apiCall } from './api';

export async function getNotifications(): Promise<Notification[]> {
  const data = await apiCall<{ notifications: Notification[] }>('/api/notifications');
  return data.notifications;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const data = await apiCall<{ notification: Notification }>(`/api/notifications/${id}/read`, {
    method: 'PATCH'
  });
  return data.notification;
}
