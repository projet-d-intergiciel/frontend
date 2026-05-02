// src/pages/Login/Login.jsx (version avec redirection)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password, rememberMe);
      // Redirection vers dashboard après login réussi
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Gestion de Stock - Connexion</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@stock.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Se souvenir de moi
            </label>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.testAccounts}>
          <p style={{ fontSize: '12px', marginBottom: '5px' }}>
            🧪 Comptes de test :
          </p>
          <div>admin@stock.com / admin123 → ADMIN</div>
          <div>gest@stock.com / gest123 → GESTIONNAIRE</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  field: {
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginTop: '0.25rem',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  testAccounts: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
    fontSize: '12px'
  }
};

export default Login;