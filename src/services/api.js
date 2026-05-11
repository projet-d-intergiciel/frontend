import axios from 'axios';
import { getAccessToken } from './tokenService'

// Configuration de base - à changer quand backend prêt
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

// Mode développement : utilise les données mock
const USE_MOCK = false; // Passer à false quand backend prêt

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
    // Cherche dans localStorage ET sessionStorage
    let token = getAccessToken();
    if (!token) {
      token = sessionStorage.getItem('token');
    } 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { api, USE_MOCK, WS_BASE_URL };