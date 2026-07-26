import api from './client';

export interface TechNotification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'offer' | 'payment' | 'general';
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}

// GET /api/v1/notifications
export const getNotifications = async (): Promise<{
  notifications: TechNotification[];
  unreadCount: number;
}> => {
  const { data } = await api.get('/notifications');
  return { notifications: data.notifications, unreadCount: data.unreadCount };
};

// PUT /api/v1/notifications/mark-all-read
export const markAllRead = async () => {
  const { data } = await api.put('/notifications/mark-all-read');
  return data;
};

// PUT /api/v1/notifications/:id/read
export const markOneRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};
