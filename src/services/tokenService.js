// src/services/tokenService.js

const STORAGE_KEY = 'auth_token'
const USER_KEY = 'user'

// Choisis ta stratégie (localStorage persiste, sessionStorage à vie de l'onglet)
export const saveToken = (token, rememberMe = false) => {
  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEY, token)
}

export const getToken = () => {
  // D'abord chercher dans localStorage, puis sessionStorage
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
}

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

// Pour les infos utilisateur (rôle avant tout)
export const saveUser = (user) => {
  const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const removeUser = () => {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}