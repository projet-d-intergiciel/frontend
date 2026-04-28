import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Database, ShoppingCart, Bell, Users, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import authService from '../../services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  
  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/produits', icon: <Package size={20} />, label: 'Produits' },
    { path: '/stock', icon: <Database size={20} />, label: 'Stock' },
    { path: '/commandes', icon: <ShoppingCart size={20} />, label: 'Commandes' },
    { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { path: '/utilisateurs', icon: <Users size={20} />, label: 'Utilisateurs' },
  ];

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Charger le compteur de notifications non lues
  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur notifications:', error);
    }
  };

  // Charger le compteur au montage et périodiquement
  useEffect(() => {
    loadUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Écouter les événements WebSocket pour les nouvelles notifications
  useEffect(() => {
    // Fonction pour écouter les nouvelles notifications
    const handleNewNotification = () => {
      loadUnreadCount(); // Recharger le compteur
    };
    
    // Écouter l'événement personnalisé (si tu as un système d'événements)
    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  // Obtenir les initiales pour l'avatar
  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Obtenir le rôle formaté
  const getRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      default: return 'Invité';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 mb-4">
          <div className="text-[#0F4C81] font-bold text-xl leading-tight">
            StockManager
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Inventory Control</p>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive(item.path) 
                ? 'bg-blue-50 text-[#0F4C81] border-l-4 border-[#0F4C81] rounded-l-none' 
                : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <span className={isActive(item.path) ? 'text-[#0F4C81]' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="text-sm font-bold">{item.label}</span>
              {/* Badge de notification dans la sidebar */}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Profil Utilisateur dynamique en bas de Sidebar */}
        <div className="p-4 border-t border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'Jean Dupont'}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              {getRoleLabel(user?.role)}
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header avec compteur de notification global */}
        <header className="bg-white border-b border-gray-100 h-16 px-8 flex justify-between items-center shrink-0">
          <div className="text-sm font-semibold text-slate-500">
            {/* Titre de la page dynamique */}
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/stock' && 'Gestion de Stock'}
            {location.pathname === '/produits' && 'Produits'}
            {location.pathname === '/commandes' && 'Commandes'}
            {location.pathname === '/notifications' && 'Notifications'}
            {location.pathname === '/utilisateurs' && 'Utilisateurs'}
          </div>

          <div className="flex items-center gap-6">
            {/* Icône Notification avec badge global */}
            <button 
              className="relative"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell size={20} className="text-gray-500 hover:text-gray-700 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Icône Utilisateur */}
            <div className="relative">
              <button className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User size={16} className="text-slate-600" />
                </div>
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                  ●
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;