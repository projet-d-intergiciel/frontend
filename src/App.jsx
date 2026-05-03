// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import Layout from './components/Layout/layout';
import Login from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Stock/StockPage';
import OrderListPage from './pages/orders/OrderListPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import UsersPage from './pages/Users/UsersPage';
import PrivateRoute from './guards/PrivateRoute';
import RoleGuard from './guards/RoleGuard';
import ProfilePage from './pages/Profile/ProfilePage';
import ChangePasswordPage from './pages/Security/ChangePasswordPage';
import ProductCatalog from './components/products/ProductCatalog'

function App() {
  return (
    <BrowserRouter>
      <StockProvider>
        <Routes>
          <Route path="/" element={<Login />} />
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
          
          
            <Route path="/commandes" element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <OrderListPage />
                    </Layout>
                  </RoleGuard>
            </PrivateRoute> 
              } />

            <Route path="/orders/new" element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <NewOrderPage />
                    </Layout>
                  </RoleGuard>
            </PrivateRoute> 
              } />
              
            <Route path="/orders/new" element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <NewOrderPage />
                    </Layout>
                  </RoleGuard>
            </PrivateRoute> 
              } />
            <Route path="/orders/:id"  element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <OrderDetailPage />
                    </Layout>
                  </RoleGuard>
            </PrivateRoute> 
              } />

              {/* route produits */}

            <Route path="/produits" element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <ProductCatalog />
                    </Layout>
                  </RoleGuard>
            </PrivateRoute> 
              } />
        </Routes>
      </StockProvider>
    </BrowserRouter>
  );
}

export default App;