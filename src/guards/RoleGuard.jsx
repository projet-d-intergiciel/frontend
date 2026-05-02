// src/guards/RoleGuard.jsx
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const RoleGuard = ({ children, allowedRoles }) => {
  const userRole = authService.getUserRole();
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    // Redirige vers dashboard si rôle non autorisé
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default RoleGuard;