import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ActiveVisor } from '../contexts/AuthContext';
import { Lock, User, Eye, EyeOff, Loader2, Building2, Truck, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | 'select-visor'>('credentials');
  const [adminUser, setAdminUser] = useState<{ username: string; almacen: string } | null>(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/entrada', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Autenticación institucional exclusiva contra LDAP / IAM CENABAST para el Visor
      const response = await fetch(`${API_URL}/visor/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const token = data.data?.token || data.data?.access_token || data.data?.jwt;
        if (token) {
          localStorage.setItem('cenabast_token', token);
        }

        // Usuario autenticado por LDAP: paso a selección de visor (Farmacias Privadas / Intermediación)
        setAdminUser({ username: username.trim(), almacen: 'ALL' });
        setStep('select-visor');
        return;
      }

      setError('El usuario o la contraseña ingresados podrían ser incorrectos. Por favor, verifica tus datos e inténtalo nuevamente.');
    } catch (err: any) {
      setError('El usuario o la contraseña ingresados podrían ser incorrectos. Por favor, verifica tus datos e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVisor = (visor: ActiveVisor) => {
    if (!adminUser) return;
    login(adminUser.username, 'admin', adminUser.almacen, visor);
    navigate('/entrada');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--app-bg)', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', padding: '48px 44px', borderRadius: '20px', boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.09), 0 0 0 1px rgba(0, 0, 0, 0.04)', width: '100%', maxWidth: step === 'select-visor' ? '540px' : '480px', transition: 'all 0.3s ease' }}>
        
        {step === 'credentials' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ background: '#eff6ff', color: '#2563eb', width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1.5px solid #dbeafe', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
                <Lock size={34} />
              </div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>CENABAST</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>INGRESO VISOR OPERADOR LOGÍSTICO</p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #fecaca', lineHeight: 1.5, boxShadow: '0 2px 6px rgba(239, 68, 68, 0.04)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Usuario Institucional</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej: usuario.cenabast"
                    style={{ width: '100%', padding: '13px 14px 13px 44px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem', background: '#f8fafc' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '36px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '13px 46px 13px 44px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem', background: '#f8fafc' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0 }}
                    tabIndex={-1}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.6px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> INGRESANDO...
                  </>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Paso 2: Selección de Visor para Administrador */
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ background: '#eff6ff', color: '#2563eb', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1.5px solid #dbeafe', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
                <Building2 size={30} />
              </div>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>SELECCIÓN DE VISOR</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Acceso como <span style={{ fontWeight: 700, color: '#2563eb' }}>Administrador ({adminUser?.username})</span>. Seleccione la línea de negocio:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {/* Opción 1: Farmacias Privadas */}
              <button
                type="button"
                onClick={() => handleSelectVisor('farmacias')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      Farmacias Privadas
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Ingresar al visor de Farmacias Privadas</p>
                  </div>
                </div>
                <ArrowRight size={20} color="#2563eb" />
              </button>

              {/* Opción 2: Intermediación */}
              <button
                type="button"
                onClick={() => handleSelectVisor('intermediacion')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bbf7d0' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      Intermediación
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Ingresar al visor de Intermediación</p>
                  </div>
                </div>
                <ArrowRight size={20} color="#16a34a" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setAdminUser(null);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; }}
            >
              <ArrowLeft size={16} /> Volver a ingresar credenciales
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
