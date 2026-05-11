// src/pages/Login/Login.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false); 
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await authService.login(
      email,
      password,
      rememberMe );
      console.log("NAVIGATE EXECUTED");
    navigate('/dashboard');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mb-6">
          <div className="text-[#0F4C81] font-bold text-2xl leading-tight">
            StockManager
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">
            Inventory Control
          </p>
        </div>

        <h2 className="text-[#0F4C81] font-bold text-xl text-center mb-6">
          Connexion
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Champ Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@stock.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition"
            />
          </div>

          {/* Champ Mot de passe */}
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F4C81] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Se souvenir de moi */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]"
              />
              Se souvenir de moi
            </label>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0a3a61] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 3 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Lien mot de passe oublié */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => alert('Fonctionnalité à venir : réinitialisation par email')}
            className="text-sm text-[#0F4C81] hover:text-[#0a3a61] transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Comptes de test */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            🧪 Comptes de test :
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">admin@stock.com</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">admin123</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold">ADMIN</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">gest@stock.com</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">gest123</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">GESTIONNAIRE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;