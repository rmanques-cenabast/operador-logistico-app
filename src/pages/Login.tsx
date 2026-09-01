import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar usuarios en duro
    if (username === 'intermediacion' && password === 'cenabast123') {
      login(username, 'intermediacion', '6001');
      navigate('/entrada');
    } else if (username === 'farmacias' && password === 'cenabast123') {
      login(username, 'farmacias', '6006');
      navigate('/entrada');
    } else if (username === 'admin' && password === 'admin123') {
      login(username, 'admin', 'ALL');
      navigate('/entrada');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--app-bg)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary-main)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={32} />
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text-main)' }}>CENABAST</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingreso Operador Logístico</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: intermediacion"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-main)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-main)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: 'var(--primary-main)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-main)'}
          >
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
