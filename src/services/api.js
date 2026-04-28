import axios from 'axios';

// Configuration de base - à changer quand backend prêt
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

// Mode développement : utilise les données mock
const USE_MOCK = true; // Passer à false quand backend prêt

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { api, USE_MOCK, WS_BASE_URL };