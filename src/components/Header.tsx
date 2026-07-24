import React from 'react';
import { Search, Bell, HelpCircle, Box } from 'lucide-react';

interface HeaderProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchPlaceholder = "Buscar Pre Avisos, OC o Productos...", showSearch = true }) => {
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
        <button className="icon-action-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="icon-action-btn">
          <HelpCircle size={20} />
        </button>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }}></div>
        <div className="avatar-initials" style={{
          background: 'linear-gradient(135deg, var(--text-main) 0%, #475569 100%)', 
          color: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}>OP</div>
      </div>
    </header>
  );
};

export default Header;
