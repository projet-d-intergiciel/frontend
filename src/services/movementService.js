import { api, USE_MOCK } from './api';

// Données mock avec dates valides
let mockMovements = [
  { 
    id: 1, 
    productId: 1, 
    productName: 'Batterie Lithium-Ion 12V', 
    type: 'ENTRÉE', 
    quantity: 200, 
    motif: 'Réapprovisionnement fournisseur', 
    date: new Date().toISOString(), 
    author: 'Jean Dupont' 
  },
  { 
    id: 2, 
    productId: 2, 
    productName: 'Capteur Ultrason Pro', 
    type: 'SORTIE', 
    quantity: 15, 
    motif: 'Projet R&D Beta', 
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    author: 'Marie Claire' 
  },
  { 
    id: 3, 
    productId: 4, 
    productName: 'Câble Blindé 5m', 
    type: 'AJUSTEMENT', 
    quantity: 5, 
    motif: 'Correction inventaire annuel', 
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    author: 'Admin System' 
  },
  { 
    id: 4, 
    productId: 3, 
    productName: 'Microcontrôleur X-88', 
    type: 'SORTIE', 
    quantity: 10, 
    motif: 'Maintenance site alpha', 
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
    author: 'Jean Dupont' 
  }
];

let nextId = 5;

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
    const response = await api.get('/movements', { params: { page, size } });
    return response.data;
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
    const response = await api.post('/movements', movementData);
    return response.data;
  }
};

export default movementService;