// orderService.js
import { api, USE_MOCK } from './api';  // ← Même import que productService

// Données mock (optionnel)
let mockOrders = [];

export const orderService = {
  // Créer une commande
  creer: async (data) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const newOrder = {
          id: Date.now(),
          ...data,
          status: 'BROUILLON',
          createdAt: new Date().toISOString()
        };
        mockOrders.push(newOrder);
        setTimeout(() => resolve(newOrder), 300);
      });
    }
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Lister les commandes
  lister: async (params = {}) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          content: mockOrders,
          totalElements: mockOrders.length,
          totalPages: 1,
          size: params.size || 10,
          number: params.page || 0
        }), 300);
      });
    }
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Détail d'une commande
  getById: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const order = mockOrders.find(o => o.id === id);
        setTimeout(() => {
          if (order) resolve(order);
          else reject(new Error('Commande non trouvée'));
        }, 200);
      });
    }
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Valider une commande
  valider: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const order = mockOrders.find(o => o.id === id);
        if (order) {
          order.status = 'VALIDEE';
          setTimeout(() => resolve(order), 200);
        } else {
          reject(new Error('Commande non trouvée'));
        }
      });
    }
    const response = await api.patch(`/orders/${id}/valider`);
    return response.data;
  },

  // Recevoir une commande
  recevoir: async (id) => {
    const response = await api.patch(`/orders/${id}/recevoir`);
    return response.data;
  },

  // Expédier une commande
  expedier: async (id) => {
    const response = await api.patch(`/orders/${id}/expedier`);
    return response.data;
  },

  // Clôturer une commande
  cloturer: async (id) => {
    const response = await api.patch(`/orders/${id}/cloturer`);
    return response.data;
  },

  // Annuler une commande
  annuler: async (id) => {
    const response = await api.patch(`/orders/${id}/annuler`);
    return response.data;
  }
};

export default orderService;