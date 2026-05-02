import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StockPage from './pages/Stock/StockPage';
import OrderListPage from './pages/orders/OrderListPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import authService from './services/authService';

function App() {
  // Initialiser un utilisateur par défaut pour le développement
  useEffect(() => {
    if (!authService.getCurrentUser()) {
      authService.setCurrentUser({
        id: 1,
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        role: 'ADMIN'
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <StockProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/commandes" element={<OrderListPage />} />
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </Layout>
      </StockProvider>
    </BrowserRouter>
  );
}

export default App;