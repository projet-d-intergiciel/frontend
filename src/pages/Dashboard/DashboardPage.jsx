import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Package, ShoppingCart, AlertTriangle, TrendingUp, 
  RefreshCw, Eye, Truck, XCircle, CheckCircle
} from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { useAlerts } from '../../hooks/useAlerts';
import { formatNumber } from '../../utils/formatters';
import authService from '../../services/authService';
import movementService from '../../services/movementService';
import orderService from '../../services/orderService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { products, loading: productsLoading, error: productsError, refreshData } = useStockData();
  const { alerts, unreadCount, refreshAlerts, markAsRead } = useAlerts();
  
  const [historicalData, setHistoricalData] = useState([]);
  const [user, setUser] = useState(null);
  const [movements, setMovements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Normaliser les statuts du backend vers le format dashboard
  const normalizeStatus = (status) => {
    const statusMap = {
      'Brouillon': 'EN COURS',
      'Validée': 'VALIDEE',
      'Expédiée': 'EXPÉDIÉ',
      'Livrée': 'LIVRÉ',
      'Annulée': 'ANNULE',
      'Clôturée': 'CLOTUREE',
      'EN COURS': 'EN COURS',
      'VALIDEE': 'VALIDEE',
      'EXPÉDIÉ': 'EXPÉDIÉ',
      'LIVRÉ': 'LIVRÉ',
      'ANNULE': 'ANNULE'
    };
    return statusMap[status] || status || 'EN COURS';
  };

  // Récupérer l'utilisateur connecté correctement
  useEffect(() => {
    const loadCurrentUser = () => {
      let currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        try {
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          const userStr = storage.getItem('user');
          if (userStr) {
            currentUser = JSON.parse(userStr);
          }
        } catch (error) {
          console.error('Erreur lecture storage:', error);
        }
      }
      
      console.log('👤 Utilisateur chargé:', currentUser);
      setUser(currentUser);
    };
    
    loadCurrentUser();
  }, []);

  // Charger toutes les données
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        // Charger les mouvements
        const movementsRes = await movementService.getAllMovements();
        const allMovements = movementsRes.content || movementsRes.data || movementsRes || [];
        setMovements(allMovements);
        
        // Charger les commandes depuis le backend
        const ordersRes = await orderService.lister({ page: 0, size: 10 });
        console.log('📦 Commandes backend:', ordersRes);
        
        let rawOrders = [];
        if (ordersRes.content) {
          rawOrders = ordersRes.content;
        } else if (ordersRes.data) {
          rawOrders = ordersRes.data;
        } else if (Array.isArray(ordersRes)) {
          rawOrders = ordersRes;
        }
        
        // Normaliser les commandes pour le dashboard
        const normalizedOrders = rawOrders.map(order => ({
          id: order.reference || order.id,
          type: order.type || order.typeCommande || 'STANDARD',
          status: normalizeStatus(order.statut || order.status),
          originalStatus: order.statut || order.status,
          date: order.date || order.dateCreation || order.createdAt,
          creator: order.creerPar || order.createdBy || order.creator || 'Système',
          items: order.articles || order.items || [],
          fournisseur: order.fournisseur || order.supplier,
          client: order.client
        }));
        
        console.log('📋 Commandes normalisées:', normalizedOrders);
        setOrders(normalizedOrders);
        
      } catch (err) {
        console.error('Erreur chargement données dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  // Préparer les données du graphique à partir des mouvements réels
  useEffect(() => {
    if (movements && movements.length > 0) {
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
        
        const dayMovements = movements.filter(m => {
          const movementDate = m.dateMouvement?.split('T')[0] || m.date?.split('T')[0];
          return movementDate === dateStr;
        });
        
        const total = dayMovements.reduce((sum, m) => sum + (m.quantite || m.quantity || 0), 0);
        
        last7Days.push({ 
          day: dayName, 
          value: total,
          date: dateStr,
          count: dayMovements.length
        });
      }
      
      setHistoricalData(last7Days);
    } else {
      setHistoricalData([
        { day: 'Lun', value: 0, count: 0 },
        { day: 'Mar', value: 0, count: 0 },
        { day: 'Mer', value: 0, count: 0 },
        { day: 'Jeu', value: 0, count: 0 },
        { day: 'Ven', value: 0, count: 0 },
        { day: 'Sam', value: 0, count: 0 },
        { day: 'Dim', value: 0, count: 0 }
      ]);
    }
  }, [movements]);

  // Statistiques
  const activeProducts = products?.length || 0;
  const pendingOrders = orders.filter(o => o.status === 'EN COURS').length;
  const stockOuts = products?.filter(p => p.stock === 0 || p.quantite === 0).length || 0;
  const totalMovements7d = historicalData.reduce((sum, d) => sum + d.value, 0);

  // Données pour le graphique circulaire
  const getCategoryData = () => {
    if (products && products.length > 0) {
      const data = products.reduce((acc, p) => {
        const category = p.category || p.categorie || 'Autres';
        const existing = acc.find(item => item.name === category);
        const stockValue = p.stock || p.quantite || 0;
        if (existing) {
          existing.value += stockValue;
        } else {
          acc.push({ name: category, value: stockValue });
        }
        return acc;
      }, []);
      if (data.length > 0 && data.some(d => d.value > 0)) return data;
    }
    return [
      { name: 'Composants', value: 0 },
      { name: 'Périphériques', value: 0 },
      { name: 'Réseau', value: 0 },
      { name: 'Stockage', value: 0 }
    ];
  };

  const categoryData = getCategoryData();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec489a', '#14b8a6'];

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'EN COURS': 'bg-yellow-100 text-yellow-700',
      'VALIDEE': 'bg-purple-100 text-purple-700',
      'EXPÉDIÉ': 'bg-blue-100 text-blue-700',
      'LIVRÉ': 'bg-green-100 text-green-700',
      'ANNULE': 'bg-red-100 text-red-700',
      'CLOTUREE': 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewOrder = async (order) => {
    try {
      const orderDetails = await orderService.getById(order.id);
      setSelectedOrder(orderDetails.data || orderDetails);
      setShowOrderModal(true);
    } catch (err) {
      console.error('Erreur chargement détails commande:', err);
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      let updatedOrder;
      switch(newStatus) {
        case 'VALIDEE':
          updatedOrder = await orderService.valider(orderId);
          break;
        case 'EXPÉDIÉ':
          updatedOrder = await orderService.expedier(orderId);
          break;
        case 'LIVRÉ':
          updatedOrder = await orderService.recevoir(orderId);
          break;
        case 'ANNULE':
          updatedOrder = await orderService.annuler(orderId);
          break;
        default:
          return;
      }
      
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
      setShowOrderModal(false);
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleRefresh = async () => {
    refreshData();
    refreshAlerts();
    try {
      const movementsRes = await movementService.getAllMovements();
      setMovements(movementsRes.content || movementsRes.data || []);
    } catch (err) {
      console.error('Erreur rechargement mouvements:', err);
    }
    try {
      const ordersRes = await orderService.lister({ page: 0, size: 10 });
      let rawOrders = [];
      if (ordersRes.content) {
        rawOrders = ordersRes.content;
      } else if (ordersRes.data) {
        rawOrders = ordersRes.data;
      } else if (Array.isArray(ordersRes)) {
        rawOrders = ordersRes;
      }
      
      const normalizedOrders = rawOrders.map(order => ({
        id: order.reference || order.id,
        type: order.type || order.typeCommande || 'STANDARD',
        status: normalizeStatus(order.statut || order.status),
        originalStatus: order.statut || order.status,
        date: order.date || order.dateCreation || order.createdAt,
        creator: order.creerPar || order.createdBy || order.creator || 'Système',
        items: order.articles || order.items || []
      }));
      setOrders(normalizedOrders);
    } catch (err) {
      console.error('Erreur rechargement commandes:', err);
    }
  };

  const handleViewAllOrders = () => {
    navigate('/commandes');
  };

  const handleViewAllAlerts = () => {
    navigate('/notifications');
  };

  const handleMarkAlertAsRead = async (alertId) => {
    await markAsRead(alertId);
    await refreshAlerts();
  };

  const getUserRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      case 'USER': return 'Utilisateur';
      default: return role || 'Invité';
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    if (user?.fullName) return user.fullName;
    if (user?.email) return user.email.split('@')[0];
    
    try {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      const userStr = storage.getItem('user');
      if (userStr) {
        const directUser = JSON.parse(userStr);
        return directUser.name || directUser.username || 'Utilisateur';
      }
    } catch(e) {}
    
    return 'Utilisateur';
  };

  const isLoading = productsLoading || loading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{productsError}</p>
        <button 
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const unreadAlerts = alerts?.filter(a => !a.read) || [];
  const hasChartData = historicalData.some(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">StockManager</h1>
          <p className="text-gray-500 text-sm mt-1">INVENTORY CONTROL</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          title="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">PRODUITS ACTIFS</p>
              <p className="text-3xl font-bold text-gray-800">{formatNumber(activeProducts)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">COMMANDES EN COURS</p>
              <p className="text-3xl font-bold text-gray-800">{formatNumber(pendingOrders)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">RUPTURES DE STOCK</p>
              <p className="text-3xl font-bold text-red-600">{formatNumber(stockOuts)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">MOUVEMENTS 7J</p>
              <p className="text-3xl font-bold text-gray-800">{formatNumber(totalMovements7d)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique et Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Mouvements de stock — 7 derniers jours
          </h3>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`${value} unités`, 'Quantité']}
                />
                <Bar dataKey="value" fill="#3b82f6" name="Mouvements" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <TrendingUp size={48} className="mb-4 opacity-50" />
              <p>Aucun mouvement de stock sur les 7 derniers jours</p>
              <p className="text-sm mt-2">Créez un mouvement dans la page Gestion de Stock</p>
            </div>
          )}
          <div className="mt-4 text-center text-sm text-gray-500">
            Total des mouvements : {totalMovements7d}
          </div>
        </div>

        {/* Alertes critiques */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              Alertes critiques
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} nouvelle(s)
                </span>
              )}
              <button 
                onClick={handleViewAllAlerts}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Voir toutes
              </button>
            </div>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {unreadAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" />
                <p>Aucune nouvelle alerte</p>
                <p className="text-sm mt-1">Tous les stocks sont dans les normes</p>
              </div>
            ) : (
              unreadAlerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id} 
                  className="border-l-4 border-red-500 pl-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleMarkAlertAsRead(alert.id)}
                >
                  <p className="font-semibold text-gray-800">
                    {alert.productName || alert.title || 'Alerte stock'}
                  </p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alert.date ? new Date(alert.date).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Graphique circulaire */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Répartition du stock par catégorie
        </h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.filter(d => d.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} unités`, 'Stock']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {categoryData.every(d => d.value === 0) && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Aucune donnée de stock disponible
          </div>
        )}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Commandes récentes</h3>
          <button 
            onClick={handleViewAllOrders}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Voir toutes
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé par</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Aucune commande récente
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDisplayDate(order.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.creator}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        {order.status === 'EN COURS' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'VALIDEE')}
                              className="text-green-500 hover:text-green-700"
                              title="Valider"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'ANNULE')}
                              className="text-red-500 hover:text-red-700"
                              title="Annuler"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {order.status === 'VALIDEE' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'EXPÉDIÉ')}
                            className="text-blue-500 hover:text-blue-700"
                            title="Expédier"
                          >
                            <Truck size={18} />
                          </button>
                        )}
                        {order.status === 'EXPÉDIÉ' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'LIVRÉ')}
                            className="text-green-500 hover:text-green-700"
                            title="Livrer"
                          >
                            <Package size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {getUserDisplayName()} — {getUserRoleLabel(user?.role)}
        </p>
      </footer>

      {/* Modal Détails commande */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Détails de la commande
              </h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Référence:</span>
                <span className="font-medium">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Type:</span>
                <span>{selectedOrder.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Statut:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Date:</span>
                <span>{formatDisplayDate(selectedOrder.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Créé par:</span>
                <span>{selectedOrder.creator}</span>
              </div>
              {selectedOrder.fournisseur && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Fournisseur:</span>
                  <span>{selectedOrder.fournisseur}</span>
                </div>
              )}
              {selectedOrder.client && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Client:</span>
                  <span>{selectedOrder.client}</span>
                </div>
              )}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="py-2 border-b">
                  <span className="text-gray-500 block mb-2">Articles:</span>
                  <div className="text-sm max-h-40 overflow-y-auto">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span>{item.productName || item.name || item.produit}</span>
                        <span>x{item.quantity || item.quantite || item.qte}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedOrder.status === 'EN COURS' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'VALIDEE')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Valider
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'ANNULE')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Annuler
                  </button>
                </>
              )}
              {selectedOrder.status === 'VALIDEE' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'EXPÉDIÉ')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Truck size={16} />
                  Expédier
                </button>
              )}
              {selectedOrder.status === 'EXPÉDIÉ' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'LIVRÉ')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Package size={16} />
                  Livrer
                </button>
              )}
              <button 
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;