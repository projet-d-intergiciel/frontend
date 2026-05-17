import { api, USE_MOCK } from './api';

// Données mock (fallback si backend indisponible)
let mockProducts = [
  { id: 1, name: 'Batterie Lithium-Ion 12V', description: 'Batterie haute capacité', category: 'Composants', stock: 1240, seuilMin: 200, statut: 'OK', prix: 45.99 },
  { id: 2, name: 'Capteur Ultrason Pro', description: 'Capteur de distance', category: 'Capteurs', stock: 45, seuilMin: 50, statut: 'ALERTE', prix: 32.50 },
  { id: 3, name: 'Microcontrôleur X-88', description: 'Microcontrôleur 32 bits', category: 'Composants', stock: 0, seuilMin: 25, statut: 'RUPTURE', prix: 12.90 },
  { id: 4, name: 'Câble Blindé 5m', description: 'Câble USB blindé', category: 'Accessoires', stock: 3535, seuilMin: 100, statut: 'OK', prix: 8.99 },
];

let nextId = 5;

const productService = {
  // Récupérer tous les produits
  getAllProducts: async (params = {}) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockProducts]), 300);
      });
    }
    // 🔥 Appel direct au product-service
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Récupérer un produit par ID
  getProductById: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const product = mockProducts.find(p => p.id === id);
        setTimeout(() => {
          if (product) resolve(product);
          else reject(new Error('Produit non trouvé'));
        }, 200);
      });
    }
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Créer un produit
  createProduct: async (productData) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const newProduct = {
          id: nextId++,
          ...productData,
          statut: 'OK',
          createdAt: new Date().toISOString()
        };
        mockProducts.push(newProduct);
        setTimeout(() => resolve(newProduct), 300);
      });
    }
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Mettre à jour un produit
  updateProduct: async (id, productData) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts[index] = { ...mockProducts[index], ...productData };
          setTimeout(() => resolve(mockProducts[index]), 300);
        } else {
          reject(new Error('Produit non trouvé'));
        }
      });
    }
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts.splice(index, 1);
          setTimeout(() => resolve({ success: true }), 300);
        } else {
          reject(new Error('Produit non trouvé'));
        }
      });
    }
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Rechercher des produits
  searchProducts: async (keyword) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const results = mockProducts.filter(p => 
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          p.category.toLowerCase().includes(keyword.toLowerCase())
        );
        setTimeout(() => resolve(results), 300);
      });
    }
    const response = await api.get(`/products/search?keyword=${keyword}`);
    return response.data;
  },

  // Mettre à jour le seuil minimum
  updateThreshold: async (id, seuilMin) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts[index].seuilMin = seuilMin;
          setTimeout(() => resolve(mockProducts[index]), 300);
        } else {
          reject(new Error('Produit non trouvé'));
        }
      });
    }
    const response = await api.patch(`/products/${id}/threshold`, { seuilMin });
    return response.data;
  }
};

export default productService;