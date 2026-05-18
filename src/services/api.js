import axios from 'axios';
import { getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuth} from './tokenService'

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

// ==========================
// REQUEST INTERCEPTOR
// ==========================

api.interceptors.request.use(

  (config) => {

    const token = getAccessToken();

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// Instance spéciale pour refresh
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
});



// ==========================
// RESPONSE INTERCEPTOR
// ==========================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    // si access token expiré
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken = getRefreshToken();

        // pas de refresh token
        if (!refreshToken) {
          clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // demander nouveau access token
        const response = await refreshApi.post(
          '/auth/refresh',
          {
            refreshToken
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken
        } = response.data;

        // sauvegarder nouveaux tokens
        saveTokens(
          accessToken,
          newRefreshToken || refreshToken,
          localStorage.getItem('rememberMe') === 'true'
        );

        // remettre nouveau token dans requête
        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        // rejouer requête originale
        return api(originalRequest);

      } catch (refreshError) {

        console.error(
          'Refresh token expiré',
          refreshError
        );

        clearAuth();

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, USE_MOCK, WS_BASE_URL };