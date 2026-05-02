import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8083';

const api = axios.create({
  baseURL: `${API_BASE}/api/orders`,
});

// Injection automatique du token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const orderService = {
  // Créer une commande (BROUILLON)
  creer: (data) => api.post('/', data).then((r) => r.data),

  // Lister avec filtres
  lister: (params) => api.get('/', { params }).then((r) => r.data),

  // Détail
  getById: (id) => api.get(`/${id}`).then((r) => r.data),

  // Transitions de statut
  valider: (id) => api.patch(`/${id}/valider`).then((r) => r.data),
  recevoir: (id) => api.patch(`/${id}/recevoir`).then((r) => r.data),
  expedier: (id) => api.patch(`/${id}/expedier`).then((r) => r.data),
  cloturer: (id) => api.patch(`/${id}/cloturer`).then((r) => r.data),
  annuler: (id) => api.patch(`/${id}/annuler`).then((r) => r.data),
};

export default orderService;
