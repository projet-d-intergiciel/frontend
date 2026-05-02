// src/services/authService.js (version améliorée)
import { api, USE_MOCK } from './api';

// Mocks pour différents rôles
const MOCK_USERS = {
  'admin@stock.com': {
    id: 1,
    name: 'Admin User',
    email: 'admin@stock.com',
    role: 'ADMIN',
    avatar: 'AD'
  },
  'gest@stock.com': {
    id: 2,
    name: 'Gestionnaire User',
    email: 'gest@stock.com',
    role: 'GESTIONNAIRE',
    avatar: 'GE'
  }
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

// Fonctions privées de stockage (améliorées)
const getStorage = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  return rememberMe ? localStorage : sessionStorage;
};

const saveToStorage = (key, value, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(key, value);
  if (rememberMe) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    // Nettoie l'ancien localStorage si on switch en sessionStorage
    localStorage.removeItem(key);
  }
};

const authService = {
  // Connexion améliorée (supporte les rôles et rememberMe)
  login: async (email, password, rememberMe = false) => {
    if (USE_MOCK) {
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = MOCK_USERS[email];
      const validPassword = 
        (email === 'admin@stock.com' && password === 'admin123') ||
        (email === 'gest@stock.com' && password === 'gest123');
      
      if (user && validPassword) {
        const token = `mock-jwt-${user.role}-${Date.now()}`;
        
        // Stockage selon rememberMe
        saveToStorage(TOKEN_KEY, token, rememberMe);
        saveToStorage(USER_KEY, JSON.stringify(user), rememberMe);
        
        return { token, user };
      }
      throw new Error('Email ou mot de passe incorrect');
    }
    
    // Version API réelle (pour plus tard)
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    saveToStorage(TOKEN_KEY, token, rememberMe);
    saveToStorage(USER_KEY, JSON.stringify(user), rememberMe);
    return response.data;
  },

  // Récupérer l'utilisateur connecté (version qui supporte sessionStorage)
  getCurrentUser: () => {
    if (USE_MOCK) {
      const storedUser = getStorage().getItem(USER_KEY);
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      // Pour le développement, retourne null si pas connecté
      return null;
    }
    const userStr = getStorage().getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Définir l'utilisateur connecté
  setCurrentUser: (user, rememberMe = false) => {
    saveToStorage(USER_KEY, JSON.stringify(user), rememberMe);
  },

  // Récupérer le token (amélioré)
  getToken: () => {
    return getStorage().getItem(TOKEN_KEY);
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return getStorage().getItem(TOKEN_KEY) !== null || (USE_MOCK && authService.getCurrentUser());
  },

  // NOUVEAU : Récupérer le rôle de l'utilisateur
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  // NOUVEAU : Vérifier si l'utilisateur a un rôle spécifique
  hasRole: (role) => {
    const userRole = authService.getUserRole();
    return userRole === role;
  },

  // Déconnexion améliorée (sans window.location)
  logout: () => {
    const storage = getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

export default authService;