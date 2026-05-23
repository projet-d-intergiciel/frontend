// src/services/userService.js
import { api, USE_MOCK } from './api';

// Données mock initiales
let MOCK_USERS = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'j.dupont@stockmanager.io',
    role: 'ADMIN',
    status: 'ACTIF',
    createdAt: '2024-01-15T10:00:00Z',
    avatar: 'JD'
  },
  {
    id: 2,
    name: 'Marie Laurent',
    email: 'm.laurent@stockmanager.io',
    role: 'GESTIONNAIRE',
    status: 'ACTIF',
    createdAt: '2024-02-20T14:30:00Z',
    avatar: 'ML'
  },
  {
    id: 3,
    name: 'Pierre Bernard',
    email: 'p.bernard@stockmanager.io',
    role: 'GESTIONNAIRE',
    status: 'INACTIF',
    createdAt: '2024-03-10T09:15:00Z',
    avatar: 'PB'
  },
  {
    id: 4,
    name: 'Sophie Comte',
    email: 's.comte@stockmanager.io',
    role: 'GESTIONNAIRE',
    status: 'ACTIF',
    createdAt: '2024-04-05T16:45:00Z',
    avatar: 'SC'
  }
];

// Générer un mot de passe temporaire aléatoire
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Simuler l'envoi d'email
const sendEmailCredentials = async (email, name, temporaryPassword) => {
  if (USE_MOCK) {
    console.log('📧 SIMULATION ENVOI EMAIL :');
    console.log(`   À: ${email}`);
    console.log(`   Objet: Vos identifiants de connexion - StockManager`);
    console.log(`   Message: Bonjour ${name},\n\n`);
    console.log(`   Voici vos identifiants de connexion :`);
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe temporaire: ${temporaryPassword}`);
    console.log(`   \n   Veuillez changer votre mot de passe lors de votre première connexion.\n`);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
  
  // Version réelle (quand backend sera prêt)
  const response = await api.post('/auth/send-credentials', { email, name, temporaryPassword });
  return response.data;
};

export const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...MOCK_USERS];
    }
    const response = await api.get('/users');
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = MOCK_USERS.find(u => u.id === parseInt(id));
      if (!user) throw new Error('Utilisateur non trouvé');
      return { ...user };
    }
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Créer un utilisateur
  createUser: async (userData) => {
    const temporaryPassword = generateTemporaryPassword();
    
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser = {
        id: Date.now(),
        ...userData,
        status: 'ACTIF',
        createdAt: new Date().toISOString(),
        avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
      
      MOCK_USERS.push(newUser);
      
      // Envoyer les identifiants par email
      await sendEmailCredentials(userData.email, userData.name, temporaryPassword);
      
      return { user: newUser, temporaryPassword };
    }
    
    const response = await api.post('/users', { ...userData, temporaryPassword });
    return response.data;
  },

  // Modifier un utilisateur
  updateUser: async (id, userData) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = MOCK_USERS.findIndex(u => u.id === parseInt(id));
      if (index === -1) throw new Error('Utilisateur non trouvé');
      
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
      return MOCK_USERS[index];
    }
    
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Désactiver/Activer un utilisateur
  toggleUserStatus: async (id) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const user = MOCK_USERS.find(u => u.id === parseInt(id));
      if (!user) throw new Error('Utilisateur non trouvé');
      
      user.status = user.status === 'ACTIF' ? 'INACTIF' : 'ACTIF';
      return user;
    }
    
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = MOCK_USERS.findIndex(u => u.id === parseInt(id));
      if (index === -1) throw new Error('Utilisateur non trouvé');
      
      MOCK_USERS.splice(index, 1);
      return { success: true };
    }
    
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Réinitialiser le mot de passe et renvoyer les identifiants
  resetPasswordAndNotify: async (id) => {
    
    if (USE_MOCK) {
      const newTemporaryPassword = generateTemporaryPassword();
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const user = MOCK_USERS.find(u => u.id === parseInt(id));
      if (!user) throw new Error('Utilisateur non trouvé');
      
      await sendEmailCredentials(user.email, user.name, newTemporaryPassword);
      
      return { success: true, temporaryPassword: newTemporaryPassword };
    }
    
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  }
};

export default userService;