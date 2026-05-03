// src/pages/Notifications/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, RefreshCw, AlertTriangle, Info, ShoppingCart, Package, Check } from 'lucide-react';
import notificationService from '../../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [selectedIds, setSelectedIds] = useState([]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      setError('Impossible de charger les notifications.');
      // Données de démo si le service échoue
      setNotifications([
        {
          id: 1,
          type: 'STOCK_LOW',
          title: 'Stock critique — Câble HDMI',
          message: 'Le stock du produit "Câble HDMI 2m" est passé en dessous du seuil minimum (5 unités restantes).',
          date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
        },
        {
          id: 2,
          type: 'ORDER',
          title: 'Commande #ORD-2891 expédiée',
          message: 'La commande de réapprovisionnement #ORD-2891 a été expédiée par le fournisseur.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
        },
        {
          id: 3,
          type: 'INFO',
          title: 'Inventaire mensuel planifié',
          message: 'Un inventaire complet du stock est prévu le 30 Mai 2025 à 08h00.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: true,
        },
        {
          id: 4,
          type: 'STOCK_LOW',
          title: 'Stock critique — Switch 24 ports',
          message: 'Le produit "Switch Cisco 24 ports" est en rupture de stock (0 unités).',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
        },
        {
          id: 5,
          type: 'ORDER',
          title: 'Nouvelle commande créée',
          message: 'Une nouvelle commande #ORD-2892 de sortie stock a été créée par J. Dupont.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
          read: true,
        },
        {
          id: 6,
          type: 'PRODUCT',
          title: 'Nouveau produit ajouté',
          message: 'Le produit "SSD NVMe 1To Samsung" a été ajouté au catalogue par A. Martin.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          read: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Continuer quand même
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Supprimer une notification
  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
    } catch {
      // Continuer quand même
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  // Supprimer la sélection
  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      try {
        await notificationService.delete(id);
      } catch {}
    }
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  // Sélection / désélection
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filtered = getFiltered();
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(n => n.id));
    }
  };

  // Filtrage
  const getFiltered = () => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  };

  const filtered = getFiltered();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Icône et couleur selon le type
  const getTypeConfig = (type) => {
    switch (type) {
      case 'STOCK_LOW':
        return {
          icon: <AlertTriangle size={18} />,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-500',
          borderColor: 'border-red-400',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700',
          label: 'Stock critique',
        };
      case 'ORDER':
        return {
          icon: <ShoppingCart size={18} />,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-500',
          borderColor: 'border-blue-400',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700',
          label: 'Commande',
        };
      case 'PRODUCT':
        return {
          icon: <Package size={18} />,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-500',
          borderColor: 'border-green-400',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700',
          label: 'Produit',
        };
      default:
        return {
          icon: <Info size={18} />,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-500',
          borderColor: 'border-gray-300',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-600',
          label: 'Info',
        };
    }
  };

  // Formater la date relative
  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD === 1) return 'Hier';
    if (diffD < 7) return `Il y a ${diffD} jours`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={loadNotifications}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          title="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
        {/* Filtres */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'unread', label: 'Non lues' },
            { key: 'read', label: 'Lues' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setSelectedIds([]); }}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                filter === f.key
                  ? 'bg-blue-50 text-[#0F4C81] border border-blue-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions groupées */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={15} />
              Supprimer ({selectedIds.length})
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#0F4C81] hover:bg-blue-50 rounded-lg transition-all"
            >
              <CheckCheck size={15} />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header de la liste */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              {selectedIds.length > 0
                ? `${selectedIds.length} sélectionnée(s)`
                : `${filtered.length} notification${filtered.length > 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">Aucune notification</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'unread' ? 'Vous avez tout lu !' : 'Rien à afficher pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((notif) => {
              const config = getTypeConfig(notif.type);
              const isSelected = selectedIds.includes(notif.id);

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-all cursor-pointer
                    ${!notif.read ? 'bg-blue-50/40' : 'bg-white'}
                    ${isSelected ? 'bg-blue-50' : ''}
                    hover:bg-gray-50`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  {/* Checkbox */}
                  <div className="pt-0.5" onClick={(e) => { e.stopPropagation(); toggleSelect(notif.id); }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Icône type */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bgColor} ${config.iconColor}`}>
                    {config.icon}
                  </div>

                  {/* Contenu */}
                  <div className={`flex-1 border-l-4 pl-4 ${config.borderColor}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title || notif.productName || 'Notification'}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" title="Non lue" />
                          )}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(notif.date)}</p>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            title="Marquer comme lu"
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          title="Supprimer"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;