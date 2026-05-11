import { api, USE_MOCK } from './api';

let mockMovements = [
    { id: 1, productId: 1, productName: 'Batterie Lithium-Ion 12V', type: 'ENTRÉE', quantity: 200, motif: 'Réapprovisionnement fournisseur', date: new Date().toISOString(), author: 'Jean Dupont' },
    { id: 2, productId: 2, productName: 'Capteur Ultrason Pro', type: 'SORTIE', quantity: 15, motif: 'Projet R&D Beta', date: new Date().toISOString(), author: 'Marie Claire' },
];

let nextId = 3;

const movementService = {
    getAllMovements: async (page = 0, size = 10) => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                const start = page * size;
                const end = start + size;
                const content = [...mockMovements].sort((a, b) => new Date(b.date) - new Date(a.date));
                setTimeout(() => resolve({
                    content: content.slice(start, end),
                    totalElements: mockMovements.length,
                    totalPages: Math.ceil(mockMovements.length / size),
                    size: size,
                    number: page
                }), 300);
            });
        }
        // 🔥 Appel réel au backend
        const response = await api.get('/stock/movements');
        const movements = response.data.data || [];
        return {
            content: movements.slice(page * size, (page + 1) * size),
            totalElements: movements.length,
            totalPages: Math.ceil(movements.length / size)
        };
    },

    createMovement: async (movementData) => {
        if (USE_MOCK) {
            return new Promise((resolve) => {
                const newMovement = {
                    id: nextId++,
                    ...movementData,
                    date: new Date().toISOString(),
                    author: 'Jean Dupont'
                };
                mockMovements.unshift(newMovement);
                setTimeout(() => resolve(newMovement), 300);
            });
        }
        // 🔥 Appel réel au backend
        const payload = {
            produitId: movementData.productId,
            typeMouvement: movementData.type,
            quantite: movementData.quantity,
            motif: movementData.motif,
            utilisateurId: 1
        };
        const response = await api.post('/stock/movements', payload);
        return {
            ...response.data.data,
            productName: movementData.productName,
            author: 'Utilisateur'
        };
    }
};

export default movementService;