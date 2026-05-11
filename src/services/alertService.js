import { api, USE_MOCK } from './api';

let mockAlerts = [];

const alertService = {
    getAllAlerts: async () => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                setTimeout(() => resolve([...mockAlerts]), 200);
            });
        }
        // 🔥 Les alertes viennent du stock-service
        try {
            const response = await api.get('/stock/alerts');
            const alerts = response.data.data || [];
            return alerts.map(alert => ({
                id: alert.id,
                productName: `Produit ${alert.produitId}`,
                message: `Stock critique : ${alert.quantiteDisponible} unités restantes`,
                type: 'WARNING',
                read: false,
                date: alert.dateMAJ
            }));
        } catch (error) {
            console.error('Erreur chargement alertes:', error);
            return [];
        }
    },

    checkAlerts: async (products) => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                const newAlerts = [];
                products.forEach(product => {
                    if (product.stock <= 0) {
                        newAlerts.push({
                            id: Date.now(),
                            productId: product.id,
                            productName: product.name,
                            type: 'CRITICAL',
                            message: `Rupture de stock : ${product.stock} unité`,
                            read: false
                        });
                    } else if (product.stock < (product.seuilMin || 0)) {
                        newAlerts.push({
                            id: Date.now(),
                            productId: product.id,
                            productName: product.name,
                            type: 'WARNING',
                            message: `Stock critique : ${product.stock} unités`,
                            read: false
                        });
                    }
                });
                mockAlerts = [...newAlerts, ...mockAlerts];
                setTimeout(() => resolve(newAlerts), 200);
            });
        }
        return [];
    },

    markAsRead: async (id) => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                mockAlerts = mockAlerts.map(a => 
                    a.id === id ? { ...a, read: true } : a
                );
                setTimeout(() => resolve({ success: true }), 200);
            });
        }
        return { success: true };
    },

    markAllAsRead: async () => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                mockAlerts = mockAlerts.map(a => ({ ...a, read: true }));
                setTimeout(() => resolve({ success: true }), 200);
            });
        }
        return { success: true };
    }
};

export default alertService;