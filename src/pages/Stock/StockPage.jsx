import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCards';
import { DataTable, StatusBadge } from '../../components/common/TableComponents';
import { InputGroup, PrimaryButton, SecondaryButton } from '../../components/stock/FormElements';
import { Database, TrendingUp, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { useAlerts } from '../../hooks/useAlerts';
import movementService from '../../services/movementService';
import productService from '../../services/productService';
import alertService from '../../services/alertService';
import userService from '../../services/userService';
import authService from '../../services/authService';
import { formatDate, formatNumber, getStatusBadge } from '../../utils/formatters';

export default function StockPage() {
  const { products, movements, loading, error, refreshAfterMovement } = useStockData();
  const { refreshAlerts } = useAlerts();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Maps pour l'affichage
  const [productMap, setProductMap] = useState({});
  const [userMap, setUserMap] = useState({});
  
  // États du formulaire
  const [productName, setProductName] = useState('');
  const [movementType, setMovementType] = useState('ENTREE');
  const [quantity, setQuantity] = useState('');
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États du filtre
  const [selectedType, setSelectedType] = useState('TOUS');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Créer un Map produitId → nomProduit
  useEffect(() => {
    if (products.length > 0) {
      const map = {};
      products.forEach(p => {
        map[p.id] = p.name;
      });
      setProductMap(map);
    }
  }, [products]);

  // Charger les utilisateurs pour afficher les vrais noms
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        console.log('📋 Utilisateurs reçus:', users);
        
        const map = {};
        // Si users est un tableau
        if (Array.isArray(users)) {
          users.forEach(user => {
            map[user.id] = user.nom;
          });
        } 
        // Si users a une propriété data
        else if (users && users.data && Array.isArray(users.data)) {
          users.data.forEach(user => {
            map[user.id] = user.nom;
          });
        }
        
        setUserMap(map);
        console.log('📋 Map utilisateurs créée:', map);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
        // Fallback avec données mock
        setUserMap({
          1: 'Jean Dupont',
          2: 'Marie Laurent',
          3: 'Pierre Bernard',
          4: 'Sophie Comte'
        });
      }
    };
    loadUsers();
  }, []);

  // Filtrage des mouvements
  const filteredMovements = movements.filter(m => {
    if (startDate && endDate && m.dateMouvement) {
      const movementDate = m.dateMouvement.split('T')[0];
      if (movementDate < startDate || movementDate > endDate) {
        return false;
      }
    }
    if (selectedType !== 'TOUS' && m.typeMouvement !== selectedType) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalMovements = filteredMovements.length;
  const totalPages = Math.ceil(totalMovements / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovements = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);

  // Statistiques
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  
  const entrees7J = movements
    .filter(m => m.typeMouvement === 'ENTREE' && m.dateMouvement?.split('T')[0] >= startDate && m.dateMouvement?.split('T')[0] <= endDate)
    .reduce((sum, m) => sum + (m.quantite || 0), 0);
  
  const sorties7J = movements
    .filter(m => m.typeMouvement === 'SORTIE' && m.dateMouvement?.split('T')[0] >= startDate && m.dateMouvement?.split('T')[0] <= endDate)
    .reduce((sum, m) => sum + (m.quantite || 0), 0);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Produit', 'Stock Disponible', 'Seuil Min', 'Statut'];
    const data = products.map(p => [
      p.name,
      p.stock || 0,
      p.seuilMin || 0,
      p.statut || 'OK'
    ]);
    
    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Export CSV effectué avec succès !');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productName || !quantity || !motif) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    const qtyNum = parseInt(quantity);
    
    try {
      let product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      let productId;
      
      if (!product) {
        const newProduct = await productService.createProduct({
          name: productName,
          description: '',
          category: 'Général',
          stock: movementType === 'ENTREE' ? qtyNum : 0,
          seuilMin: 0,
          statut: 'OK'
        });
        productId = newProduct.id;
        product = newProduct;
      } else {
        productId = product.id;
      }
      
      const movementData = {
        produitId: productId,
        typeMouvement: movementType,
        quantite: qtyNum,
        motif: motif,
        utilisateurId: currentUser?.id || 1
      };
      
      await movementService.createMovement(movementData);
      
      let newStock = product.stock || 0;
      if (movementType === 'ENTREE') {
        newStock = (product.stock || 0) + qtyNum;
      } else if (movementType === 'SORTIE') {
        newStock = (product.stock || 0) - qtyNum;
      }
      
      let newStatut = 'OK';
      if (newStock <= 0) newStatut = 'RUPTURE';
      else if (newStock < (product.seuilMin || 0)) newStatut = 'ALERTE';
      
      await productService.updateProduct(productId, { ...product, stock: newStock, statut: newStatut });
      
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, stock: newStock, statut: newStatut } : p
      );
      await alertService.checkAlerts(updatedProducts);
      
      await refreshAfterMovement();
      await refreshAlerts();
      
      setProductName('');
      setQuantity('');
      setMotif('');
      setMovementType('ENTREE');
      
      alert('Mouvement enregistré avec succès !');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'enregistrement du mouvement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setProductName('');
    setMovementType('ENTREE');
    setQuantity('');
    setMotif('');
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatTypeDisplay = (type) => {
    if (type === 'ENTREE') return 'ENTRÉE';
    if (type === 'SORTIE') return 'SORTIE';
    return type;
  };

  const getProductName = (produitId) => {
    return productMap[produitId] || `Produit ${produitId}`;
  };

  const getUserName = (utilisateurId) => {
    const id = Number(utilisateurId);
    if (userMap[id]) {
      return userMap[id];
    }
    if (userMap[String(id)]) {
      return userMap[String(id)];
    }
    return `Utilisateur ${id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">StockManager</h1>
          <p className="text-gray-500 text-sm mt-1">INVENTORY CONTROL</p>
        </div>
        <button 
          onClick={refreshAfterMovement}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span className="text-sm">Rafraîchir</span>
        </button>
      </div>

      {/* SECTION 1: STATISTIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Stock Total" 
          value={formatNumber(totalStock)} 
          unit="unités" 
          icon={Database} 
          colorClass="text-blue-900" 
          bgColorClass="bg-blue-50" 
        />
        <StatCard 
          title="Entrées 7J" 
          value={`+${formatNumber(entrees7J)}`} 
          icon={TrendingUp} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
          trend={`${entrees7J > sorties7J ? 'Flux positif' : 'Flux négatif'}`}
        />
        <StatCard 
          title="Sorties 7J" 
          value={`-${formatNumber(sorties7J)}`} 
          icon={TrendingDown} 
          colorClass="text-red-600" 
          bgColorClass="bg-red-50" 
          trend="Basé sur les mouvements enregistrés" 
        />
      </div>

      {/* SECTION 2: INVENTAIRE ET FORMULAIRE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Tableau d'Inventaire */}
        <div className="lg:col-span-3">
          <DataTable 
            title="Inventaire des Produits" 
            headers={['Produit', 'Stock Disponible', 'Seuil Min', 'Statut', 'Action']}
            action={
              <button 
                onClick={exportToCSV}
                className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                ⬇ Exporter
              </button>
            }
          >
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">{p.name}</td>
                <td className="px-6 py-4 font-bold">{formatNumber(p.stock || 0)}</td>
                <td className="px-6 py-4 text-gray-400 font-bold">{p.seuilMin || 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(p.statut)}`}>
                    {p.statut || 'OK'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <PrimaryButton 
                    className="text-[9px] px-2 py-1"
                    onClick={() => setProductName(p.name)}
                  >
                    Mouvement
                  </PrimaryButton>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>

        {/* Formulaire de Mouvement */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-6 text-sm">Enregistrer un mouvement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <InputGroup label="Produit">
              <input 
                type="text"
                className="w-full p-2 border border-gray-200 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nom du produit (nouveau ou existant)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                list="product-suggestions"
                disabled={submitting}
              />
              <datalist id="product-suggestions">
                {products.map(p => (<option key={p.id} value={p.name} />))}
              </datalist>
              <p className="text-[10px] text-gray-400 mt-1">
                💡 Saisissez un nouveau produit ou sélectionnez-en un existant
              </p>
            </InputGroup>
            
            <InputGroup label="Type de mouvement">
              <select 
                className="w-full p-2 border border-gray-200 rounded text-sm bg-white outline-none"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                disabled={submitting}
              >
                <option value="ENTREE">ENTRÉE (+) - Ajouter au stock</option>
                <option value="SORTIE">SORTIE (-) - Retirer au stock</option>
                <option value="AJUSTEMENT">AJUSTEMENT - Correction</option>
              </select>
            </InputGroup>

            <InputGroup label="Quantité">
              <input 
                type="number" 
                className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                disabled={submitting}
              />
            </InputGroup>

            <InputGroup label="Motif">
              <textarea 
                className="w-full p-2 border border-gray-200 rounded text-sm h-20 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Description du mouvement..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                required
                disabled={submitting}
              />
            </InputGroup>

            <div className="flex gap-2 pt-2">
              <SecondaryButton type="button" className="flex-1" onClick={handleReset} disabled={submitting}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: HISTORIQUE DES MOUVEMENTS */}
      <DataTable 
        title="Historique des mouvements" 
        headers={['Produit', 'Type', 'Quantité', 'Motif', 'Date', 'Auteur']}
        action={
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1 border rounded text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-white cursor-pointer hover:bg-gray-50"
            >
              <option value="TOUS">Tous les types</option>
              <option value="ENTREE">ENTRÉE</option>
              <option value="SORTIE">SORTIE</option>
              <option value="AJUSTEMENT">AJUSTEMENT</option>
            </select>
            
            <div className="relative">
              <button 
                className="px-3 py-1 border rounded text-[10px] font-bold text-gray-500 uppercase tracking-tighter flex items-center gap-1 hover:bg-gray-50"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar size={12} />
                {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Toutes les dates'}
              </button>
              
              {showDatePicker && (
                <div className="absolute right-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-10 w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded text-sm"
                        value={startDate || ''}
                        onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded text-sm"
                        value={endDate || ''}
                        onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded hover:bg-gray-300"
                        onClick={() => { setStartDate(''); setEndDate(''); setShowDatePicker(false); setCurrentPage(1); }}
                      >
                        Réinitialiser
                      </button>
                      <button 
                        className="flex-1 bg-[#0F4C81] text-white text-xs py-2 rounded hover:bg-blue-900"
                        onClick={() => setShowDatePicker(false)}
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      >
        {currentMovements.map((m) => (
          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-700">
              {getProductName(m.produitId)}
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                m.typeMouvement === 'ENTREE' ? 'bg-green-100 text-green-700' :
                m.typeMouvement === 'SORTIE' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {formatTypeDisplay(m.typeMouvement)}
              </span>
            </td>
            <td className={`px-6 py-4 font-bold ${m.typeMouvement === 'ENTREE' ? 'text-green-600' : 'text-red-600'}`}>
              {m.typeMouvement === 'ENTREE' ? '+' : '-'}{m.quantite}
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm">{m.motif}</td>
            <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(m.dateMouvement, 'datetime')}</td>
            <td className="px-6 py-4 font-medium text-slate-600">
              {getUserName(m.utilisateurId)}
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <p>Affichage de {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalMovements)} sur {totalMovements} mouvements</p>
          <div className="flex gap-1">
            <button 
              className={`w-6 h-6 border rounded flex items-center justify-center ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              return (
                <button 
                  key={index}
                  className={`w-6 h-6 border rounded flex items-center justify-center ${currentPage === pageNum ? 'bg-[#0F4C81] text-white' : 'hover:bg-gray-50'}`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className={`w-6 h-6 border rounded flex items-center justify-center ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}