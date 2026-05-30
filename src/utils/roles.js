// src/utils/roles.js
export const ROLES = {
  ADMIN: 'ADMIN',
  GESTIONNAIRE: 'GESTIONNAIRE'
}

// Utile pour les guards
export const hasAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}