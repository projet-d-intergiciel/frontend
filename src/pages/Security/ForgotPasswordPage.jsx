// src/pages/Security/ForgotPasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { api, publicApi,USE_MOCK } from '../../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 900));
        // En mock, on accepte tout email non vide
      } else {
        await publicApi.post('/auth/forgot-password', { email });
      }
      setSent(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Aucun compte trouvé avec cet email.');
      } else {
        setError("Erreur lors de l'envoi. Réessayez plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h2 className="text-xl font-bold text-[#0F4C81] mb-2">Email envoyé !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            Vérifiez aussi vos spams.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d67] transition"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F4C81] mb-6 transition"
        >
          <ArrowLeft size={16} /> Retour à la connexion
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F4C81]">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition"
              />
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3d67] transition disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;