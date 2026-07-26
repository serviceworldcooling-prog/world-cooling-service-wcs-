import apiClient from './client';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'offer' | 'payment' | 'general';
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}

// GET /api/notifications
export const getNotifications = async (page = 1): Promise<{
  notifications: Notification[];
  unreadCount: number;
  total: number;
}> => {
  const { data } = await apiClient.get('/notifications', { params: { page } });
  return {
    notifications: data.notifications,
    unreadCount: data.unreadCount,
    total: data.total,
  };
};

// PUT /api/notifications/mark-all-read
export const markAllRead = async () => {
  const { data } = await apiClient.put('/notifications/mark-all-read');
  return data;
};

// PUT /api/notifications/:id/read
export const markOneRead = async (id: string) => {
  const { data } = await apiClient.put(`/notifications/${id}/read`);
  return data;
};
