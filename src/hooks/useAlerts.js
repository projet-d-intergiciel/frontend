import { useState, useEffect, useCallback } from 'react';
import alertService from '../services/alertService';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastAlert, setLastAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les alertes
  const loadAlerts = useCallback(async () => {
    try {
      const alertsData = await alertService.getAllAlerts();
      setAlerts(alertsData || []);
      
      // Compter uniquement les alertes non lues
      const unread = (alertsData || []).filter(a => !a.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur chargement alertes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marquer comme lue
  const markAsRead = useCallback(async (id) => {
    try {
      await alertService.markAsRead(id);
      await loadAlerts();
    } catch (err) {
      console.error('Erreur marquage alerte:', err);
    }
  }, [loadAlerts]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await alertService.markAllAsRead();
      await loadAlerts();
    } catch (err) {
      console.error('Erreur marquage toutes alertes:', err);
    }
  }, [loadAlerts]);

  // Rafraîchir
  const refreshAlerts = useCallback(async () => {
    await loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    unreadCount,
    lastAlert,
    loading,
    markAsRead,
    markAllAsRead,
    refreshAlerts
  };
};