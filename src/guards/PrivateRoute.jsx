// src/guards/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
   console.log("AUTH CHECK:", isAuthenticated);
  if (!isAuthenticated) {
    // Redirige vers login si non authentifié
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;