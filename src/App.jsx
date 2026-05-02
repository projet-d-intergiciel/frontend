// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Stock/StockPage';
import UsersPage from './pages/Users/UsersPage';
import PrivateRoute from './guards/PrivateRoute';
import RoleGuard from './guards/RoleGuard';
import ProfilePage from './pages/Profile/ProfilePage';
import ChangePasswordPage from './pages/Security/ChangePasswordPage';

function App() {
  return (
    <BrowserRouter>
      <StockProvider>
        <Routes>
          {/* Page Login (sans Layout) */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées avec Layout */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/change-password" element={
            <PrivateRoute>
              <Layout>
                <ChangePasswordPage />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/stock" element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                <Layout>
                  <StockPage />
                </Layout>
              </RoleGuard>
            </PrivateRoute>
          } />
          
          <Route path="/utilisateurs" element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['ADMIN']}>
                <Layout>
                  <UsersPage />
                </Layout>
              </RoleGuard>
            </PrivateRoute>
          } />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/produits" element={<Navigate to="/stock" replace />} />
          <Route path="/commandes" element={<Navigate to="/stock" replace />} />
          <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </StockProvider>
    </BrowserRouter>
  );
}

export default App;