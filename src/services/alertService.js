import { api, USE_MOCK } from './api';
import productService from './productService';

let mockAlerts = [];

const alertService = {
    getAllAlerts: async () => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                setTimeout(() => resolve([...mockAlerts]), 200);
            });
        }
        
        try {
            // 1. Récupérer tous les produits (pour avoir les noms et seuils)
            const productsResponse = await productService.getAllProducts();
            const products = productsResponse.content || productsResponse.data || productsResponse || [];
            
            // 2. Récupérer tous les stocks (pour connaître les quantités)
            let allStocks = [];
            try {
                const stocksResponse = await api.get('/stock');
                allStocks = stocksResponse.data.data || [];
            } catch (err) {
                console.error('Erreur chargement stocks:', err);
            }
            
            // 3. Créer un map produitId -> produit
            const productMap = new Map();
            products.forEach(product => {
                productMap.set(product.id, product);
                productMap.set(Number(product.id), product);
            });
            
            // 4. Générer les alertes pour TOUS les produits problématiques
            const allAlerts = [];
            
            allStocks.forEach(stock => {
                const product = productMap.get(stock.produitId);
                const seuil = product?.seuilMin || product?.seuil || 10;
                const stockQuantity = stock.quantiteDisponible;
                const productName = product?.name || product?.nom || `Produit ${stock.produitId}`;
                
                // CAS 1 : RUPTURE (stock = 0)
                if (stockQuantity === 0) {
                    allAlerts.push({
                        id: `rupture-${stock.produitId}`,
                        productId: stock.produitId,
                        productName: productName,
                        type: 'CRITICAL',
                        message: `🔴 RUPTURE DE STOCK : Plus aucune unité disponible (seuil: ${seuil})`,
                        read: false,
                        date: stock.dateMAJ || new Date().toISOString(),
                        quantiteDisponible: 0
                    });
                }
                // CAS 2 : Stock CRITIQUE (0 < stock < seuil)
                else if (stockQuantity < seuil) {
                    allAlerts.push({
                        id: `critique-${stock.produitId}`,
                        productId: stock.produitId,
                        productName: productName,
                        type: 'WARNING',
                        message: `⚠️ Stock critique : ${stockQuantity} unités restantes (seuil: ${seuil})`,
                        read: false,
                        date: stock.dateMAJ || new Date().toISOString(),
                        quantiteDisponible: stockQuantity
                    });
                }
            });
            
            // 5. Récupérer aussi les alertes du backend (au cas où)
            try {
                const response = await api.get('/stock/alerts');
                const backendAlerts = response.data.data || [];
                
                // Ajouter les alertes backend qui ne sont pas déjà dans notre liste
                backendAlerts.forEach(alert => {
                    const exists = allAlerts.some(a => a.productId === alert.produitId);
                    if (!exists && alert.quantiteDisponible > 0) {
                        const product = productMap.get(alert.produitId);
                        allAlerts.push({
                            id: alert.id,
                            productId: alert.produitId,
                            productName: product?.name || product?.nom || `Produit ${alert.produitId}`,
                            type: 'WARNING',
                            message: alert.message || `⚠️ Stock critique : ${alert.quantiteDisponible} unités restantes`,
                            read: false,
                            date: alert.dateMAJ || new Date().toISOString(),
                            quantiteDisponible: alert.quantiteDisponible
                        });
                    }
                });
            } catch (err) {
                console.error('Erreur récupération alertes backend:', err);
            }
            
            console.log('📊 Alertes générées:', {
                total: allAlerts.length,
                alertes: allAlerts.map(a => ({ name: a.productName, type: a.type, stock: a.quantiteDisponible }))
            });
            
            return allAlerts;
            
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
                    const stock = product.stock || product.quantite || 0;
                    const seuilMin = product.seuilMin || product.seuil || 5;
                    
                    if (stock === 0) {
                        newAlerts.push({
                            id: Date.now(),
                            productId: product.id,
                            productName: product.name,
                            type: 'CRITICAL',
                            message: `🔴 RUPTURE DE STOCK : Plus aucune unité disponible`,
                            read: false,
                            date: new Date().toISOString()
                        });
                    } else if (stock < seuilMin) {
                        newAlerts.push({
                            id: Date.now(),
                            productId: product.id,
                            productName: product.name,
                            type: 'WARNING',
                            message: `⚠️ Stock critique : ${stock} unités restantes (seuil: ${seuilMin})`,
                            read: false,
                            date: new Date().toISOString()
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
        
        try {
            // Si c'est une alerte générée localement (commence par "rupture-" ou "critique-")
            if (id.toString().startsWith('rupture-') || id.toString().startsWith('critique-')) {
                return { success: true };
            }
            await api.patch(`/stock/alerts/${id}/read`);
            return { success: true };
        } catch (error) {
            console.error('Erreur marquage alerte:', error);
            return { success: false };
        }
    },

    markAllAsRead: async () => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                mockAlerts = mockAlerts.map(a => ({ ...a, read: true }));
                setTimeout(() => resolve({ success: true }), 200);
            });
        }
        
        try {
            await api.patch('/stock/alerts/read-all');
            return { success: true };
        } catch (error) {
            console.error('Erreur marquage toutes alertes:', error);
            return { success: false };
        }
    }
};

export default alertService;