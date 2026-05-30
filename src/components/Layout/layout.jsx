// src/components/layout/Layout.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Database, ShoppingCart, Bell, Users, User, LogOut, Key, UserCircle, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import notificationService from '../../services/notificationService';
import authService from '../../services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  
  // Menu items avec les rôles autorisés
  const allMenuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['ADMIN', 'GESTIONNAIRE'] },
    { path: '/produits', icon: <Package size={20} />, label: 'Produits', roles: ['ADMIN', 'GESTIONNAIRE'] },
    { path: '/stock', icon: <Database size={20} />, label: 'Stock', roles: ['ADMIN', 'GESTIONNAIRE'] },
    { path: '/commandes', icon: <ShoppingCart size={20} />, label: 'Commandes', roles: ['ADMIN', 'GESTIONNAIRE'] },
    { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications', roles: ['ADMIN', 'GESTIONNAIRE'] },
    { path: '/utilisateurs', icon: <Users size={20} />, label: 'Utilisateurs', roles: ['ADMIN'] }, // Réservé ADMIN
  ];

  // Récupérer l'utilisateur connecté
 useEffect(() => {
    //  Récupère l'utilisateur connecté depuis authService
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Filtrer les menus selon le rôle de l'utilisateur
  const getFilteredMenuItems = () => {
    if (!user) return [];
    return allMenuItems.filter(item => item.roles.includes(user.role));
  };

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
    if (user) {
      loadUnreadCount();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Écouter les événements WebSocket pour les nouvelles notifications
  useEffect(() => {
    const handleNewNotification = () => {
      loadUnreadCount();
    };
    
    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  // Fermer le menu profil quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Déconnexion
  const handleLogout = () => {
    authService.logout();
  };

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

  // Si pas d'utilisateur, ne pas afficher le layout
  if (!user) {
    return null;
  }

  const menuItems = getFilteredMenuItems();

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

        {/* Profil Utilisateur avec menu déroulant */}
        <div className="p-4 border-t border-gray-50 relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.avatar || getInitials(user.nom)}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-sm font-bold text-slate-700 truncate">{user ? user.nom: ''}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                {getRoleLabel(user?.role)}
              </p>
            </div>
            <div className={`transform transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Menu déroulant */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle size={16} className="text-gray-400" />
                  <span>Mon profil</span>
                </Link>
                
                <Link
                  to="/change-password"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Key size={16} className="text-gray-400" />
                  <span>Changer mot de passe</span>
                </Link>
                
                <hr className="my-1 border-gray-100" />
                
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
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
            {location.pathname === '/profile' && 'Mon profil'}
            {location.pathname === '/change-password' && 'Sécurité'}
          </div>

          <div className="flex items-center gap-6">
            {/* Icône Notification avec badge global */}
            <button 
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} className="text-gray-500 hover:text-gray-700 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Icône Utilisateur avec menu (optionnel) */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center justify-center"
              >
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