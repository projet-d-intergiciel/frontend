import { api, USE_MOCK } from './api';

// Données mock pour les notifications
let mockNotifications = [
  { id: 1, type: 'STOCK', title: 'Stock critique', message: 'Capteur Ultrason Pro atteint son seuil minimum', date: new Date().toISOString(), read: false },
  { id: 2, type: 'ORDER', title: 'Commande expédiée', message: 'La commande #ORD-2891 a été expédiée', date: new Date().toISOString(), read: false },
  { id: 3, type: 'SYSTEM', title: 'Mise à jour système', message: 'Nouvelle version disponible', date: new Date().toISOString(), read: true },
];

const notificationService = {
  // Récupérer toutes les notifications
  getAllNotifications: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockNotifications]), 300);
      });
    }
    const response = await api.get('/notifications');
    return response.data;
  },

  // Récupérer le nombre de notifications non lues (TOUS TYPES)
  getUnreadCount: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const count = mockNotifications.filter(n => !n.read).length;
        setTimeout(() => resolve(count), 100);
      });
    }
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Récupérer les notifications non lues
  getUnreadNotifications: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const unread = mockNotifications.filter(n => !n.read);
        setTimeout(() => resolve(unread), 300);
      });
    }
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // Marquer comme lue
  markAsRead: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        mockNotifications = mockNotifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        setTimeout(() => resolve({ success: true }), 200);
      });
    }
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Marquer toutes comme lues
  markAllAsRead: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        mockNotifications = mockNotifications.map(n => ({ ...n, read: true }));
        setTimeout(() => resolve({ success: true }), 200);
      });
    }
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Ajouter une notification
  addNotification: async (notification) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const newNotification = {
          id: mockNotifications.length + 1,
          ...notification,
          date: new Date().toISOString(),
          read: false
        };
        mockNotifications.unshift(newNotification);
        
        // Déclencher un événement personnalisé pour mettre à jour le compteur
        window.dispatchEvent(new Event('new-notification'));
        
        setTimeout(() => resolve(newNotification), 200);
      });
    }
    const response = await api.post('/notifications', notification);
    return response.data;
  }
};

export default notificationService;