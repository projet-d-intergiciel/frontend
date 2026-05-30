import { WS_BASE_URL, USE_MOCK } from './api';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connexion au WebSocket
  connect() {
    if (USE_MOCK) {
      console.log('🔌 Mode mock - WebSocket simulé');
      this.simulateMockEvents();
      return;
    }

    const token = localStorage.getItem('token');
    this.ws = new WebSocket(`${WS_BASE_URL}/stock?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data.type, data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket déconnecté');
      this.reconnect();
    };
  }

  // Reconnexion automatique
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  // Simulation d'événements mock (pour développement)
  simulateMockEvents() {
    setInterval(() => {
      // Simulation d'alerte aléatoire
      const mockEvent = {
        type: 'stock.alerte',
        data: {
          productId: Math.floor(Math.random() * 4) + 1,
          productName: ['Batterie', 'Capteur', 'Microcontrôleur', 'Câble'][Math.floor(Math.random() * 4)],
          stock: Math.floor(Math.random() * 50),
          seuil: 50,
          message: 'Stock critique détecté'
        }
      };
      this.notifyListeners(mockEvent.type, mockEvent.data);
    }, 30000); // Toutes les 30 secondes
  }

  // Ajouter un écouteur d'événement
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  // Supprimer un écouteur
  removeEventListener(type, callback) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type).filter(cb => cb !== callback);
      this.listeners.set(type, callbacks);
    }
  }

  // Notifier les écouteurs
  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(data));
    }
    // Événement générique pour tous les types
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => callback({ type, data }));
    }
  }

  // Déconnexion
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();