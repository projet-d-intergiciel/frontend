import { api, USE_MOCK } from './api';

// Données mock - initialisées une seule fois
let mockAlerts = [
  { id: 1, productId: 2, productName: 'Capteur Ultrason Pro', type: 'WARNING', message: 'Stock critique : 45 unités (seuil: 50)', severity: 'critical', date: new Date().toISOString(), read: false },
  { id: 2, productId: 3, productName: 'Microcontrôleur X-88', type: 'CRITICAL', message: 'Rupture de stock : 0 unité', severity: 'critical', date: new Date().toISOString(), read: false },
];

let nextAlertId = 3;

// Fonction pour obtenir les alertes par défaut (sans doublon)
const getDefaultAlerts = () => {
  return [
    { id: 1, productName: 'RAM DDR5 - Stock Critique', message: 'Seulement 2 unités restantes en Rayon A-4.', type: 'CRITICAL', read: true },
    { id: 2, productName: 'GPU RTX 4080 - Rupture', message: 'Dépassement du seuil minimal (0/15).', type: 'CRITICAL', read: true },
    { id: 3, productName: 'SSD 1TB - Réapprovisionnement', message: 'Commande fournisseur non confirmée.', type: 'WARNING', read: true }
  ];
};

const alertService = {
  // Récupérer toutes les alertes
  getAllAlerts: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        // Retourner les alertes mock + alertes par défaut (marquées comme lues)
        const defaultAlerts = getDefaultAlerts();
        const allAlerts = [...defaultAlerts, ...mockAlerts];
        setTimeout(() => resolve(allAlerts), 200);
      });
    }
    const response = await api.get('/alerts');
    return response.data;
  },

  // Récupérer les alertes non lues uniquement
  getUnreadAlerts: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const unread = mockAlerts.filter(a => !a.read);
        setTimeout(() => resolve(unread), 200);
      });
    }
    const response = await api.get('/alerts/unread');
    return response.data;
  },

  // Obtenir le compteur non lu
  getUnreadCount: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const count = mockAlerts.filter(a => !a.read).length;
        setTimeout(() => resolve(count), 100);
      });
    }
    const response = await api.get('/alerts/unread/count');
    return response.data;
  },

  // Marquer comme lue
  markAsRead: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        mockAlerts = mockAlerts.map(a => 
          a.id === id ? { ...a, read: true } : a
        );
        setTimeout(() => resolve({ success: true }), 200);
      });
    }
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },

  // Marquer toutes comme lues
  markAllAsRead: async () => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        mockAlerts = mockAlerts.map(a => ({ ...a, read: true }));
        setTimeout(() => resolve({ success: true }), 200);
      });
    }
    const response = await api.patch('/alerts/read-all');
    return response.data;
  },

  // Vérifier et créer des alertes (appelé après un mouvement)
  checkAlerts: async (products) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const newAlerts = [];
        products.forEach(product => {
          // Ne créer une alerte que si le produit a un seuil minimum
          if (product.seuilMin && product.seuilMin > 0) {
            if (product.stock <= 0) {
              // Vérifier si une alerte existe déjà pour ce produit
              const existingAlert = mockAlerts.find(a => a.productId === product.id && !a.read);
              if (!existingAlert) {
                const newAlert = {
                  id: nextAlertId++,
                  productId: product.id,
                  productName: product.name,
                  type: 'CRITICAL',
                  message: `Rupture de stock : ${product.stock} unité (seuil: ${product.seuilMin})`,
                  severity: 'critical',
                  date: new Date().toISOString(),
                  read: false
                };
                newAlerts.push(newAlert);
                mockAlerts.unshift(newAlert);
              }
            } else if (product.stock < product.seuilMin) {
              // Vérifier si une alerte existe déjà pour ce produit
              const existingAlert = mockAlerts.find(a => a.productId === product.id && !a.read && a.type !== 'CRITICAL');
              if (!existingAlert) {
                const newAlert = {
                  id: nextAlertId++,
                  productId: product.id,
                  productName: product.name,
                  type: 'WARNING',
                  message: `Stock critique : ${product.stock} unités (seuil: ${product.seuilMin})`,
                  severity: 'warning',
                  date: new Date().toISOString(),
                  read: false
                };
                newAlerts.push(newAlert);
                mockAlerts.unshift(newAlert);
              }
            }
          }
        });
        setTimeout(() => resolve(newAlerts), 200);
      });
    }
    const response = await api.post('/alerts/check', { products });
    return response.data;
  },

  // Supprimer une alerte
  deleteAlert: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        mockAlerts = mockAlerts.filter(a => a.id !== id);
        setTimeout(() => resolve({ success: true }), 200);
      });
    }
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  // Réinitialiser les alertes (pour le développement)
  resetAlerts: async () => {
    if (USE_MOCK) {
      mockAlerts = [];
      nextAlertId = 1;
      return { success: true };
    }
    return { success: false };
  }
};

export default alertService;