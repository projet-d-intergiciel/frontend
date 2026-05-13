// src/services/notificationService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const notificationService = {
  /**
   * Récupérer toutes les notifications de l'utilisateur connecté
   */
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Récupérer uniquement le nombre de notifications non lues
   */
  getUnreadCount: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/notifications/unread/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Accepter { count: N } ou directement N
    return typeof response.data === 'number' ? response.data : response.data.count ?? 0;
  },

  /**
   * Marquer une notification spécifique comme lue
   */
  markAsRead: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Supprimer une notification
   */
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default notificationService;