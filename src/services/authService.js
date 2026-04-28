import { api, USE_MOCK } from './api';

// Utilisateur mock pour le développement
let mockUser = {
  id: 1,
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  role: 'ADMIN',
  avatar: 'JD'
};

const authService = {
  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    if (USE_MOCK) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return mockUser;
    }
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Définir l'utilisateur connecté
  setCurrentUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null || USE_MOCK;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export default authService;