import React, { useState } from 'react';
import { Search, Box, LogOut } from 'lucide-react';

interface HeaderProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchPlaceholder = "Buscar Pre Avisos, OC o Productos...", showSearch = true }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="top-header" style={{ display: 'flex', alignItems: 'center', padding: '16px 32px', gap: '24px', minHeight: '72px', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--primary-main)', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box size={22} />
        </div>
        <div className="header-title" style={{ fontSize: '1.25rem', color: 'var(--text-main)', whiteSpace: 'nowrap', fontWeight: 700 }}>Operador WMS</div>
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
        <div style={{ position: 'relative' }}>
          <div className="avatar-initials" 
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'linear-gradient(135deg, var(--text-main) 0%, #475569 100%)', 
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}>OP</div>

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
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Operador Logístico</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>operador@cenabast.cl</div>
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
                    onClick={() => setShowMenu(false)}
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
