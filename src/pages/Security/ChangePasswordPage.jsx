// src/pages/Security/ChangePasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Appel API pour changer le mot de passe
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      alert('✅ Mot de passe modifié avec succès ! Vous allez être déconnecté.');
      
      // Déconnecter l'utilisateur pour qu'il se reconnecte avec le nouveau mot de passe
      authService.logout();
      navigate('/login');
      
    } catch (error) {
      setError(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F4C81]"> Changer mon mot de passe</h1>
        <p className="text-gray-500 mt-1">Pour des raisons de sécurité, choisissez un mot de passe fort</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 caractères, incluant lettres et chiffres
            </p>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d67] transition disabled:opacity-50"
            >
              <Lock size={18} />
              {loading ? 'Modification...' : 'Changer le mot de passe'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Conseil de sécurité :</strong>
        </p>
        <ul className="text-xs text-yellow-700 mt-2 list-disc list-inside">
          <li>Ne réutilisez pas votre ancien mot de passe</li>
          <li>Utilisez une combinaison de lettres, chiffres et caractères spéciaux</li>
          <li>Ne partagez jamais votre mot de passe</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePasswordPage;