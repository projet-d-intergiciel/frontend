import ProductCatalog from './components/products/ProductCatalog';

function App() {
  return <ProductCatalog />;
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

            <Route path="/orders/:id" element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['ADMIN', 'GESTIONNAIRE']}>
                    <Layout>
                      <OrderDetailPage />
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