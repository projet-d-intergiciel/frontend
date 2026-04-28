import React, { createContext, useContext, useReducer, useCallback } from 'react';
import productService from '../services/productService';
import movementService from '../services/movementService';
import alertService from '../services/alertService';

// État initial
const initialState = {
  products: [],
  movements: [],
  alerts: [],
  loading: false,
  error: null,
  stats: {
    totalStock: 0,
    entries7d: 0,
    exits7d: 0,
    activeProducts: 0,
    stockOuts: 0
  }
};

// Reducer
const stockReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_MOVEMENTS':
      return { ...state, movements: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'ADD_MOVEMENT':
      return { ...state, movements: [action.payload, ...state.movements] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };
    default:
      return state;
  }
};

// Context
const StockContext = createContext();

// Provider
export const StockProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stockReducer, initialState);

  // Actions
  const loadAllData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [products, movements, alerts] = await Promise.all([
        productService.getAllProducts(),
        movementService.getAllMovements(0, 100),
        alertService.getAllAlerts()
      ]);

      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_MOVEMENTS', payload: movements.content || movements });
      dispatch({ type: 'SET_ALERTS', payload: alerts });

      // Calculer les stats
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const activeProducts = products.length;
      const stockOuts = products.filter(p => p.stock === 0).length;

      dispatch({
        type: 'SET_STATS',
        payload: { totalStock, activeProducts, stockOuts, entries7d: 0, exits7d: 0 }
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const addMovement = useCallback(async (movementData) => {
    const newMovement = await movementService.createMovement(movementData);
    dispatch({ type: 'ADD_MOVEMENT', payload: newMovement });
    
    // Mettre à jour le produit concerné
    const updatedProduct = await productService.getProductById(movementData.productId);
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    
    return newMovement;
  }, []);

  const value = {
    ...state,
    loadAllData,
    addMovement,
    dispatch
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Hook personnalisé
export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
};