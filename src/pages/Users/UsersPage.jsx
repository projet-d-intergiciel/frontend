// src/pages/Users/UsersPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Power, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import userService from '../../services/userService';
import authService from '../../services/authService';
import UserFormModal from './UserFormModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // ============ PAGINATION ============
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3; // Nombre d'utilisateurs par page

  // Charger l'utilisateur connecté au montage
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Charger les utilisateurs
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Réinitialiser à la première page quand la liste change
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  // ============ LOGIQUE PAGINATION ============
  // Calculer les indices
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Changer de page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Nombre maximum de pages à afficher
    
    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Afficher avec ellipses
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // ============ RESTRICTIONS DE SÉCURITÉ ============
  
  const canModifyUser = (user) => {
    if (!currentUser) return false;
    if (user.role === 'GESTIONNAIRE') return true;
    if (user.role === 'ADMIN' && currentUser.id !== user.id) return false;
    return true;
  };

  const canToggleStatus = (user) => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false;
    if (user.role === 'GESTIONNAIRE') return true;
    return false;
  };

  const canDeleteUser = (user) => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false;
    if (user.role === 'GESTIONNAIRE') return true;
    return false;
  };

  const canResetPassword = (user) => {
    if (!currentUser) return false;
    if (user.role === 'GESTIONNAIRE') return true;
    return false;
  };

  // ============ GESTIONNAIRES DES ACTIONS ============

  const handleCreateUser = async (userData) => {
    try {
      const result = await userService.createUser(userData);
      await loadUsers();
      alert(`✅ Utilisateur créé avec succès !\n\nUn email contenant le mot de passe temporaire a été envoyé à ${userData.email}`);
      
      if (result.temporaryPassword) {
        console.log(`📧 Mot de passe temporaire pour ${userData.email}: ${result.temporaryPassword}`);
      }
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création de l\'utilisateur');
      throw error;
    }
  };

  const handleUpdateUser = async (userData) => {
    if (!canModifyUser(editingUser)) {
      alert('❌ Vous n\'avez pas l\'autorisation de modifier cet utilisateur');
      return;
    }
    
    if (currentUser.id === editingUser.id && userData.role !== 'ADMIN') {
      alert('❌ Vous ne pouvez pas changer votre propre rôle d\'administrateur');
      return;
    }
    
    try {
      await userService.updateUser(editingUser.id, userData);
      await loadUsers();
      alert('✅ Utilisateur modifié avec succès !');
    } catch (error) {
      console.error('Erreur modification:', error);
      alert('Erreur lors de la modification');
      throw error;
    }
  };

  const handleToggleStatus = async (user) => {
    if (!canToggleStatus(user)) {
      alert('❌ Vous ne pouvez pas modifier le statut de cet utilisateur');
      return;
    }
    
    const action = user.statut === 'ACTIF' ? 'désactiver' : 'activer';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} ${user.nom} ?`)) return;
    
    try {
      await userService.toggleUserStatus(user.id);
      await loadUsers();
      alert(`✅ Utilisateur ${action} avec succès !`);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleResetPassword = async (user) => {
    if (!canResetPassword(user)) {
      alert('❌ Vous ne pouvez pas réinitialiser le mot de passe de cet utilisateur');
      return;
    }
    
    if (!window.confirm(`Envoyer un nouveau mot de passe temporaire à ${user.nom} ?`)) return;
    
    try {
      const result = await userService.resetPasswordAndNotify(user.id);
      alert(`✅ Un email avec un nouveau mot de passe temporaire a été envoyé à ${user.email}`);
      if (result.temporaryPassword) {
        console.log(`📧 Nouveau mot de passe temporaire pour ${user.email}: ${result.temporaryPassword}`);
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      alert('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!canDeleteUser(user)) {
      alert('❌ Vous ne pouvez pas supprimer cet utilisateur');
      return;
    }
    
    if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer définitivement ${user.nom} ?`)) return;
    
    try {
      await userService.deleteUser(user.id);
      await loadUsers();
      alert('✅ Utilisateur supprimé avec succès !');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditModal = (user) => {
    if (!canModifyUser(user)) {
      alert('❌ Vous ne pouvez pas modifier cet utilisateur');
      return;
    }
    setEditingUser(user);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // ============ AFFICHAGE ============

  const getStatusBadge = (statut) => {
    console.log('Statut reçu du backend:', statut, 'Type:', typeof statut)
    return statut === 'ACTIF' 
    ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">ACTIF</span>
    : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">INACTIF</span>;
  };

  const getRoleBadge = (role) => {
    return role === 'ADMIN'
      ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Administrateur</span>
      : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Gestionnaire</span>;
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F4C81]"> Gestion des utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérer les comptes et les permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d67] transition"
        >
          <Plus size={18} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Règles de sécurité */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Règles de sécurité :</strong>
            <ul className="mt-1 text-xs list-disc list-inside">
              <li>Vous ne pouvez pas modifier un autre administrateur</li>
              <li>Vous ne pouvez pas désactiver ou supprimer votre propre compte</li>
              <li>Vous ne pouvez pas supprimer un compte administrateur</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const isCurrentUser = currentUser?.id === user.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            isCurrentUser ? 'bg-green-600' : 'bg-slate-800'
                          }`}>
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.nom}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-green-600 font-normal">(Vous)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            disabled={!canModifyUser(user)}
                            className={`p-2 rounded-lg transition ${
                              canModifyUser(user) 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={!canToggleStatus(user)}
                            className={`p-2 rounded-lg transition ${
                              canToggleStatus(user)
                                ? user.statut === 'ACTIF' 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-green-600 hover:bg-green-50'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={user.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                          >
                            <Power size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleResetPassword(user)}
                            disabled={!canResetPassword(user)}
                            className={`p-2 rounded-lg transition ${
                              canResetPassword(user) 
                                ? 'text-purple-600 hover:bg-purple-50' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Réinitialiser mot de passe"
                          >
                            <RefreshCw size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={!canDeleteUser(user)}
                            className={`p-2 rounded-lg transition ${
                              canDeleteUser(user) 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* ============ PAGINATION ============ */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, users.length)} sur {users.length} utilisateurs
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bouton Précédent */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Numéros de page */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        currentPage === page
                          ? 'bg-[#0F4C81] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              {/* Bouton Suivant */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
};

export default UsersPage;