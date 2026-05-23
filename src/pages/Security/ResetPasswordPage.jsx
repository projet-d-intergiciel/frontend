// src/pages/Auth/ResetPasswordPage.jsx

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const ResetPasswordPage = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  // =========================
  // Validation mot de passe
  // =========================

  const validatePassword = (password) => {

    // Minimum 8 caractères
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Majuscule
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }

    // Minuscule
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }

    // Chiffre
    if (!/\d/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }

    return null;
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    // Vérifier token
    if (!token) {

      setError(
        'Lien de réinitialisation invalide'
      );

      return;
    }

    // Vérifier confirmation
    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {

      setError(
        'Les mots de passe ne correspondent pas'
      );

      return;
    }

    // Validation sécurité password
    const passwordError =
      validatePassword(formData.newPassword);

    if (passwordError) {

      setError(passwordError);

      return;
    }

    setLoading(true);

    try {

      await api.post(
        '/auth/reset-password',
        {
          token,
          newPassword:
            formData.newPassword
        }
      );

      setSuccess(true);

      // redirection auto login
      setTimeout(() => {

        navigate('/login');

      }, 3000);

    } catch (error) {

      const message =
    error.response?.data?.message;

  if (message === "Token expiré" || message === "Token déjà utilisé" || message === "Token invalide") {
    setError(
      "Le lien de réinitialisation est invalide ou expiré."
    );
  } else {
    setError(
      "Erreur lors de la réinitialisation du mot de passe."
    );
  }

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // Toggle visibilité
  // =========================

  const togglePasswordVisibility = (field) => {

    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // =========================
  // SUCCESS PAGE
  // =========================

  if (success) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

          <CheckCircle
            className="mx-auto text-green-600 mb-4"
            size={70}
          />

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Mot de passe réinitialisé
          </h1>

          <p className="text-gray-600 mb-6">
            Votre mot de passe a été modifié avec succès.
          </p>

          <p className="text-sm text-gray-500">
            Redirection vers la page de connexion...
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // PAGE PRINCIPALE
  // =========================

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">

        {/* Header */}

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">

            <div className="bg-blue-100 p-4 rounded-full">

              <Lock
                className="text-[#0F4C81]"
                size={36}
              />

            </div>

          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Réinitialiser le mot de passe
          </h1>

          <p className="text-gray-500 mt-2">
            Entrez un nouveau mot de passe sécurisé
          </p>

        </div>

        {/* Error */}

        {error && (

          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">

            {error}

          </div>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Nouveau password */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Nouveau mot de passe

            </label>

            <div className="relative">

              <input
                type={
                  showPasswords.new
                    ? 'text'
                    : 'password'
                }
                required
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword:
                      e.target.value
                  })
                }
                placeholder="••••••••"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  togglePasswordVisibility('new')
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >

                {
                  showPasswords.new
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                }

              </button>

            </div>

          </div>

          {/* Confirm password */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Confirmer le mot de passe

            </label>

            <div className="relative">

              <input
                type={
                  showPasswords.confirm
                    ? 'text'
                    : 'password'
                }
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword:
                      e.target.value
                  })
                }
                placeholder="••••••••"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  togglePasswordVisibility(
                    'confirm'
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >

                {
                  showPasswords.confirm
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                }

              </button>

            </div>

          </div>

          {/* Password Rules */}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">

            <p className="font-semibold mb-2">
              Le mot de passe doit contenir :
            </p>

            <ul className="list-disc list-inside space-y-1">

              <li>8 caractères minimum</li>

              <li>Une majuscule</li>

              <li>Une minuscule</li>

              <li>Un chiffre</li>

            </ul>

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] hover:bg-[#0d3f6a] text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >

            {
              loading
                ? 'Réinitialisation...'
                : 'Réinitialiser le mot de passe'
            }

          </button>

        </form>

      </div>

    </div>
  );
};

export default ResetPasswordPage;