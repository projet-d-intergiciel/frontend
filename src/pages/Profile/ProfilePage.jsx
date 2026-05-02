// src/pages/Profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { User, Mail, Save, Key } from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || ''
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Appel API pour modifier le profil
      const updatedUser = await userService.updateUser(user.id, formData);
      
      // Mettre à jour l'utilisateur dans le stockage
      authService.setCurrentUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      
      // Recharger l'utilisateur
      setUser(updatedUser);
      
      // Rafraîchir après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F4C81]"> Mon profil</h1>
        <p className="text-gray-500 mt-1">Gérer vos informations personnelles</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Infos de base */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white text-xl font-bold">
                {user.avatar || user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-gray-500">Rôle actuel</p>
                <p className="font-semibold text-[#0F4C81]">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Gestionnaire'}
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-1" />
                Nom complet
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline mr-1" />
                Email professionnel
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Si vous changez votre email, vous devrez vous reconnecter avec la nouvelle adresse.
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition"
              >
                <Save size={18} />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/change-password')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Key size={18} />
                Changer mon mot de passe
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;