// src/services/authService.js
import apiClient from '../api/axiosConfig';

const USE_MOCK = true; // ← Passer à false quand backend prêt

// Mocks pour différents rôles (avec mots de passe)
const MOCK_USERS = {
  'admin@stock.com': {
    id: 1,
    name: 'Admin User',
    email: 'admin@stock.com',
    role: 'ADMIN',
    avatar: 'AD',
    password: 'admin123'
  },
  'gest@stock.com': {
    id: 2,
    name: 'Gestionnaire User',
    email: 'gest@stock.com',
    role: 'GESTIONNAIRE',
    avatar: 'GE',
    password: 'gest123'
  },
  'j.dupont@stockmanager.io': {
    id: 3,
    name: 'Jean Dupont',
    email: 'j.dupont@stockmanager.io',
    role: 'ADMIN',
    avatar: 'JD',
    password: 'admin123'
  },
  'm.laurent@stockmanager.io': {
    id: 4,
    name: 'Marie Laurent',
    email: 'm.laurent@stockmanager.io',
    role: 'GESTIONNAIRE',
    avatar: 'ML',
    password: 'gest123'
  }
};

// Stockage des mots de passe modifiés (simulation)
let passwordChanges = {};

// Clés de stockage
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

// Récupérer le bon storage
const getStorage = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  return rememberMe ? localStorage : sessionStorage;
};

// Sauvegarder dans le storage
const saveToStorage = (key, value, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(key, value);
  if (rememberMe) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(key);
  }
};

const authService = {
  // Connexion
  async login(email, password, rememberMe = false) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = MOCK_USERS[email];
      const storedPassword = passwordChanges[email];
      const validPassword = storedPassword 
        ? password === storedPassword 
        : user && password === user.password;
      
      if (!user || !validPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      const token = `mock-jwt-${user.role}-${user.id}-${Date.now()}`;
      const userInfo = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
      
      saveToStorage(TOKEN_KEY, token, rememberMe);
      saveToStorage(USER_KEY, JSON.stringify(userInfo), rememberMe);
      
      return { token, user: userInfo };
    }
    
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    saveToStorage(TOKEN_KEY, token, rememberMe);
    saveToStorage(USER_KEY, JSON.stringify(user), rememberMe);
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUser = MOCK_USERS[currentUser.email];
      const storedPassword = passwordChanges[currentUser.email];
      const isValidCurrentPassword = storedPassword 
        ? currentPassword === storedPassword
        : mockUser && currentPassword === mockUser.password;
      
      if (!isValidCurrentPassword) {
        throw new Error('Mot de passe actuel incorrect');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      if (currentPassword === newPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }
      
      passwordChanges[currentUser.email] = newPassword;
      
      console.log('🔐 Mot de passe changé avec succès !');
      console.log(`   Utilisateur: ${currentUser.email}`);
      console.log(`   Nouveau mot de passe: ${newPassword}`);
      
      return { success: true };
    }
    
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return { success: true };
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser() {
    const userStr = getStorage().getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Définir l'utilisateur connecté
  setCurrentUser(user, rememberMe = false) {
    saveToStorage(USER_KEY, JSON.stringify(user), rememberMe);
  },

  // Récupérer le token
  getToken() {
    return getStorage().getItem(TOKEN_KEY);
  },

  // Vérifier si connecté
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  // Récupérer le rôle
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  // Vérifier si a un rôle spécifique
  hasRole(role) {
    return this.getUserRole() === role;
  },

  // Déconnexion
  logout() {
    const storage = getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

export default authService;