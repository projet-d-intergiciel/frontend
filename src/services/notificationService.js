// src/services/notificationService.js

import { api, USE_MOCK } from './api';

// Données mock (optionnel)
let mockNotifications = [];

export const notificationService = {

  /**
   * Récupérer toutes les notifications
   */
  getAll: async () => {
    if (USE_MOCK) {
      return Promise.resolve(mockNotifications);
    }

    const response = await api.get('/notifications');
    return response.data;
  },

  /**
   * Nombre de notifications non lues
   */
  getUnreadCount: async () => {
    if (USE_MOCK) {
      const count = mockNotifications.filter(n => !n.read).length;
      return Promise.resolve(count);
    }

    const response = await api.get('/notifications/unread/count');

    return typeof response.data === 'number'
      ? response.data
      : response.data.count ?? 0;
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead: async (id) => {
    if (USE_MOCK) {
      const notification = mockNotifications.find(n => n.id === id);

      if (notification) {
        notification.read = true;
      }

      return Promise.resolve(notification);
    }

    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: async () => {
    if (USE_MOCK) {
      mockNotifications = mockNotifications.map(notification => ({
        ...notification,
        read: true
      }));

      return Promise.resolve(true);
    }

    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Supprimer une notification
   */
  delete: async (id) => {
    if (USE_MOCK) {
      mockNotifications = mockNotifications.filter(
        notification => notification.id !== id
      );

      return Promise.resolve(true);
    }

    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;