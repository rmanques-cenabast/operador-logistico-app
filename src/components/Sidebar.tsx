import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogIn, BarChart2, Box, LogOut, ChevronDown, ChevronRight, Menu, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isMaestrosOpen, setIsMaestrosOpen] = useState(false);
  const [isInventarioOpen, setIsInventarioOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
      <div className="sidebar-header" style={{ 
        padding: isCollapsed ? '24px 0' : '24px', 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        flexDirection: isCollapsed ? 'column' : 'row',
        gap: isCollapsed ? '16px' : '0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start', width: isCollapsed ? '100%' : 'auto' }}>
          {!isCollapsed && (
            <h1 className="sidebar-title" style={{ marginBottom: 0 }}>
              {user?.role === 'intermediacion' ? 'INTERMEDIACIÓN' : 
               user?.role === 'farmacias' ? 'F. PRIVADAS' : 
               'CENABAST'}
            </h1>
          )}
          
          {isCollapsed && (
            <h1 className="sidebar-title" style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: 0 }}>
              {user?.role === 'intermediacion' ? 'I' : 
               user?.role === 'farmacias' ? 'F' : 
               'C'}
            </h1>
          )}
        </div>
        
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            margin: isCollapsed ? '0 auto' : '0'
          }}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="nav-links" style={{ padding: isCollapsed ? '16px 8px' : '24px 12px' }}>
        {/* ENTRADA */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NavLink
            to="/entrada"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsEntradaOpen(true);
              } else {
                setIsEntradaOpen(!isEntradaOpen);
              }
            }}
            style={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '12px' : '10px 12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogIn size={18} />
              {!isCollapsed && <span>Entrada</span>}
            </div>
            {!isCollapsed && (isEntradaOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </NavLink>
          {isEntradaOpen && !isCollapsed && (
            <div className="submenu">
              <NavLink to="/entrada/pre-aviso" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                Pre aviso
              </NavLink>
              <NavLink to="/entrada" end className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                Recepción
              </NavLink>
            </div>
          )}
        </div>

        {/* INVENTARIO */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NavLink
            to="/inventario"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsInventarioOpen(true);
              } else {
                setIsInventarioOpen(!isInventarioOpen);
              }
            }}
            style={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '12px' : '10px 12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <Box size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inventario</span>}
            </div>
            {!isCollapsed && (isInventarioOpen ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />)}
          </NavLink>
          {isInventarioOpen && !isCollapsed && (
            <div className="submenu">
              <NavLink to="/inventario" end className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Registros hist.</span>
              </NavLink>
              <NavLink to="/inventario/traspasos" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Traslado Alm.</span>
              </NavLink>
              <NavLink to="/inventario/mermas" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Mermas</span>
              </NavLink>
              <NavLink to="/inventario/conteos" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Conteo ciclico</span>
              </NavLink>
              <NavLink to="/inventario/muestras" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Muestreo ISP</span>
              </NavLink>
              <NavLink to="/inventario/entradas-especiales" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                 <span>Entradas Esp.</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* SALIDA */}
        <NavLink
          to="/salida"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 12px' }}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Salida</span>}
        </NavLink>

        {/* DATOS MAESTROS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NavLink
            to="/maestros"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsMaestrosOpen(true);
              } else {
                setIsMaestrosOpen(!isMaestrosOpen);
              }
            }}
            style={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '12px' : '10px 12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={18} />
              {!isCollapsed && <span>Datos maestros</span>}
            </div>
            {!isCollapsed && (isMaestrosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </NavLink>
          {isMaestrosOpen && !isCollapsed && (
            <div className="submenu">
              <NavLink to="/maestros/clientes" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                Clientes
              </NavLink>
              <NavLink to="/maestros/materiales" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                Materiales
              </NavLink>
              <NavLink to="/maestros/proveedores" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                Proveedores
              </NavLink>
            </div>
          )}
        </div>
        {/* REPORTES */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NavLink 
            to="/reportes" 
            className={({ isActive }) => "nav-item " + (isActive ? 'active' : '')}
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start', 
              padding: isCollapsed ? '12px' : '10px 12px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart2 size={18} />
              {!isCollapsed && <span>Reportes</span>}
            </div>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

// force reload 639225682422583862