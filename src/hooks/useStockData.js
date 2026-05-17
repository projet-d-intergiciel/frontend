import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';
import movementService from '../services/movementService';
import alertService from '../services/alertService';

export const useStockData = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger toutes les données
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, movementsData, alertsData] = await Promise.all([
        productService.getAllProducts(),
        movementService.getAllMovements(0, 100),
        alertService.getAllAlerts()
      ]);
      
      setProducts(productsData);
      setMovements(movementsData.content || movementsData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir après un mouvement
  const refreshAfterMovement = useCallback(async () => {
    const [productsData, movementsData] = await Promise.all([
      productService.getAllProducts(),
      movementService.getAllMovements(0, 100)
    ]);
    setProducts(productsData);
    setMovements(movementsData.content || movementsData);
    
    // Vérifier et créer des alertes
    const newAlerts = await alertService.checkAlerts(productsData);
    if (newAlerts.length > 0) {
      const allAlerts = await alertService.getAllAlerts();
      setAlerts(allAlerts);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    products,
    movements,
    alerts,
    loading,
    error,
    refreshData: loadData,
    refreshAfterMovement,
    setProducts,
    setMovements,
    setAlerts
  };
};
