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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { products, movements, loading, error, refreshData } = useStockData();
  const { alerts, unreadCount, refreshAlerts, markAsRead } = useAlerts();
  
  const [historicalData, setHistoricalData] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([
    { id: '#ORD-2891', type: 'Réapprovisionnement', status: 'EXPÉDIÉ', date: '22 Mai, 14:30', creator: 'A. Martin' },
    { id: '#ORD-2890', type: 'Sortie Stock', status: 'EN COURS', date: '22 Mai, 12:15', creator: 'J. Dupont' },
    { id: '#ORD-2889', type: 'Inventaire', status: 'ATTENTE', date: '21 Mai, 09:45', creator: 'S. Leroy' }
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Préparer les données du graphique
  useEffect(() => {
    if (movements && movements.length > 0) {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
        
        const dayMovements = movements.filter(m => m.date?.split('T')[0] === dateStr);
        const total = dayMovements.reduce((sum, m) => sum + (m.quantity || 0), 0);
        
        last7Days.push({ day: dayName, value: total });
      }
      setHistoricalData(last7Days);
    } else {
      setHistoricalData([
        { day: 'Lun', value: 45 },
        { day: 'Mar', value: 52 },
        { day: 'Mer', value: 38 },
        { day: 'Jeu', value: 47 },
        { day: 'Ven', value: 55 },
        { day: 'Sam', value: 62 },
        { day: 'Dim', value: 48 }
      ]);
    }
  }, [movements]);

  // Statistiques
  const activeProducts = products?.length || 0;
  const pendingOrders = orders.filter(o => o.status === 'EN COURS').length;
  const stockOuts = products?.filter(p => p.stock === 0).length || 0;
  const totalMovements7d = historicalData.reduce((sum, d) => sum + d.value, 0);

  // Données pour le graphique circulaire
  const getCategoryData = () => {
    if (products && products.length > 0) {
      const data = products.reduce((acc, p) => {
        const category = p.category || 'Composants';
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.value += p.stock || 0;
        } else {
          acc.push({ name: category, value: p.stock || 0 });
        }
        return acc;
      }, []);
      if (data.length > 0) return data;
    }
    return [
      { name: 'Composants', value: 45 },
      { name: 'Périphériques', value: 25 },
      { name: 'Réseau', value: 15 },
      { name: 'Stockage', value: 15 }
    ];
  };

  const categoryData = getCategoryData();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const getStatusBadge = (status) => {
    const styles = {
      'EXPÉDIÉ': 'bg-green-100 text-green-700',
      'EN COURS': 'bg-yellow-100 text-yellow-700',
      'ATTENTE': 'bg-gray-100 text-gray-700',
      'LIVRÉ': 'bg-blue-100 text-blue-700',
      'ANNULE': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setShowOrderModal(false);
  };

  const handleRefresh = () => {
    refreshData();
    if (refreshAlerts) refreshAlerts();
  };

  // Fonction pour voir toutes les commandes
  const handleViewAllOrders = () => {
    navigate('/commandes');
  };

  // Fonction pour voir toutes les alertes
  const handleViewAllAlerts = () => {
    navigate('/notifications');
  };

  // Fonction pour marquer une alerte comme lue
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Récupérer les alertes non lues uniquement pour l'affichage
  const unreadAlerts = alerts?.filter(a => !a.read) || [];

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
        <div className="bg-white rounded-xl shadow-sm p-6">
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

        <div className="bg-white rounded-xl shadow-sm p-6">
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

        <div className="bg-white rounded-xl shadow-sm p-6">
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

        <div className="bg-white rounded-xl shadow-sm p-6">
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Mouvements de stock — 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value} mouvements`, '']}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Mouvements" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-500">
            Total des mouvements : {totalMovements7d.toLocaleString('fr-FR')}
          </div>
        </div>

        {/* Alertes critiques - Affichage uniquement des alertes non lues */}
        <div className="bg-white rounded-xl shadow-sm p-6">
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
          <div className="space-y-4">
            {unreadAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
      <div className="bg-white rounded-xl shadow-sm p-6">
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} unités`, 'Stock']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commandes récentes avec bouton Voir toutes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
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
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'EXPÉDIÉ')}
                          className="text-green-500 hover:text-green-700"
                          title="Marquer comme expédié"
                        >
                          <Truck size={18} />
                        </button>
                      )}
                      {order.status !== 'ANNULE' && order.status !== 'LIVRÉ' && order.status !== 'EXPÉDIÉ' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'ANNULE')}
                          className="text-red-500 hover:text-red-700"
                          title="Annuler"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {user?.name || 'Jean Dupont'} — {getUserRoleLabel(user?.role)}
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
                <span className="text-gray-500">ID:</span>
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
                <span>{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Créateur:</span>
                <span>{selectedOrder.creator}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedOrder.status === 'EN COURS' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'EXPÉDIÉ')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Truck size={16} />
                  Marquer comme expédié
                </button>
              )}
              {selectedOrder.status === 'EXPÉDIÉ' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'LIVRÉ')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Marquer comme livré
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