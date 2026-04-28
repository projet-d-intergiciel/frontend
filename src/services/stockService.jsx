import api from './api';

const stockService = {
  // Récupérer le stock de tous les produits
  getAllStock: async (params = {}) => {
    const response = await api.get('/stock', { params });
    return response.data;
  },

  // Récupérer le stock d'un produit spécifique
  getStockByProduct: async (productId) => {
    const response = await api.get(`/stock/product/${productId}`);
    return response.data;
  },

  // Récupérer les mouvements de stock
  getMovements: async (params = {}) => {
    const response = await api.get('/stock/movements', { params });
    return response.data;
  },

  // Créer un mouvement de stock
  createMovement: async (movementData) => {
    const response = await api.post('/stock/movements', movementData);
    return response.data;
  },

  // Récupérer les alertes de stock critique
  getAlerts: async () => {
    const response = await api.get('/stock/alerts');
    return response.data;
  },

  // Récupérer les statistiques du dashboard
  getStats: async () => {
    const response = await api.get('/stock/stats');
    return response.data;
  },

  // Récupérer les mouvements par période
  getMovementsByDateRange: async (startDate, endDate, params = {}) => {
    const response = await api.get('/stock/movements/date-range', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  },

  // Récupérer les mouvements par type
  getMovementsByType: async (type, params = {}) => {
    const response = await api.get(`/stock/movements/type/${type}`, { params });
    return response.data;
  },

  // Récupérer l'historique complet par produit
  getProductHistory: async (productId, params = {}) => {
    const response = await api.get(`/stock/history/${productId}`, { params });
    return response.data;
  },

  // Vérifier et déclencher des alertes manuellement
  checkAlerts: async () => {
    const response = await api.post('/stock/check-alerts');
    return response.data;
  }
};

export default stockService;