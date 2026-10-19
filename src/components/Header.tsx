import React, { useState, useRef, useEffect } from 'react';
import { Search, LogOut, Building2, Truck, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

interface HeaderProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchPlaceholder = "Buscar Pre Avisos, OC o Productos...", showSearch = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, effectiveVisor, setActiveVisor, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="top-header" style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', gap: '16px', minHeight: '64px', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="mobile-menu-toggle"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <div className="header-title" style={{ fontSize: '1.15rem', color: '#0f172a', whiteSpace: 'nowrap', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", letterSpacing: '-0.02em' }}>Operador Logístico</div>
        
        {/* Switcher de Visor para Administradores */}
        {user?.role === 'admin' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
              gap: '2px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
          >
            <button
              type="button"
              onClick={() => setActiveVisor('farmacias')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: effectiveVisor === 'farmacias' ? 600 : 500,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: effectiveVisor === 'farmacias'
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                  : 'transparent',
                color: effectiveVisor === 'farmacias' ? '#ffffff' : '#64748b',
                boxShadow: effectiveVisor === 'farmacias'
                  ? '0 2px 6px -1px rgba(37, 99, 235, 0.4), 0 1px 2px rgba(0, 0, 0, 0.05)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (effectiveVisor !== 'farmacias') {
                  e.currentTarget.style.color = '#1e293b';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (effectiveVisor !== 'farmacias') {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <Building2 size={13} strokeWidth={effectiveVisor === 'farmacias' ? 2.5 : 2} />
              <span>F. Privadas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveVisor('intermediacion')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: effectiveVisor === 'intermediacion' ? 600 : 500,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: effectiveVisor === 'intermediacion'
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'transparent',
                color: effectiveVisor === 'intermediacion' ? '#ffffff' : '#64748b',
                boxShadow: effectiveVisor === 'intermediacion'
                  ? '0 2px 6px -1px rgba(5, 150, 105, 0.4), 0 1px 2px rgba(0, 0, 0, 0.05)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (effectiveVisor !== 'intermediacion') {
                  e.currentTarget.style.color = '#1e293b';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (effectiveVisor !== 'intermediacion') {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <Truck size={13} strokeWidth={effectiveVisor === 'intermediacion' ? 2.5 : 2} />
              <span>Intermediación</span>
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginLeft: 'auto', width: '100%', maxWidth: '480px', position: 'relative' }}>
        {showSearch && (
          <div className="search-bar">
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder={searchPlaceholder} style={{ width: '100%', padding: '12px 48px 12px 44px', border: '1px solid transparent', background: 'var(--bg-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} 
            onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-main)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}
            onBlur={(e) => { e.currentTarget.style.background = 'var(--bg-color)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div className="search-shortcut" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', background: 'white', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', pointerEvents: 'none' }}>⌘K</div>
          </div>
        )}
      </div>
      
      <div className="header-actions">
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div className="avatar-initials" 
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'linear-gradient(135deg, var(--text-main) 0%, #475569 100%)', 
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}>{user?.username?.substring(0, 2) || 'OP'}</div>

            {showMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                minWidth: '240px',
                zIndex: 50,
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{user?.username || 'Operador Logístico'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Rol: <span className="font-semibold text-slate-700 capitalize">{user?.role}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                    Visor: <span className="font-bold text-blue-600">{effectiveVisor === 'intermediacion' ? 'Intermediación' : 'Farmacias Privadas'}</span>
                  </div>
                </div>
                
                <div style={{ padding: '8px' }}>
                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#b91c1c'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
