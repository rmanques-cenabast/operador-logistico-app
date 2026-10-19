import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogIn, BarChart2, Box, LogOut, ChevronDown, ChevronRight, Menu, Database, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

const Sidebar: React.FC = () => {
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isMaestrosOpen, setIsMaestrosOpen] = useState(false);
  const [isInventarioOpen, setIsInventarioOpen] = useState(true);
  const { isDrawerOpen, openDrawer, closeDrawer, toggleSidebar } = useSidebar();
  const { effectiveVisor } = useAuth();
  const location = useLocation();

  const isEntradaActive = location.pathname.startsWith('/entrada');
  const isInventarioActive = location.pathname.startsWith('/inventario');
  const isMaestrosActive = location.pathname.startsWith('/maestros');

  return (
    <>
      {/* 1. DESKTOP MINI RAIL (Visible sólo en escritorio, ancho 72px) */}
      <aside className="sidebar-rail">
        <div style={{ 
          height: '64px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Botón de 3 rayitas para abrir/cerrar el Drawer */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Abrir menú de navegación"
            className="rail-toggle-btn"
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            title="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Iconos de navegación compactos en el Rail */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '16px 0',
          width: '100%' 
        }}>
          {/* Entrada */}
          <button
            type="button"
            className={`rail-item ${isEntradaActive ? 'active' : ''}`}
            onClick={() => {
              setIsEntradaOpen(true);
              openDrawer();
            }}
            aria-label="Entrada"
          >
            <LogIn size={18} />
            <span className="rail-tooltip">Entrada</span>
          </button>

          {/* Inventario */}
          <button
            type="button"
            className={`rail-item ${isInventarioActive ? 'active' : ''}`}
            onClick={() => {
              setIsInventarioOpen(true);
              openDrawer();
            }}
            aria-label="Inventario"
          >
            <Box size={18} />
            <span className="rail-tooltip">Inventario</span>
          </button>

          {/* Salidas */}
          <NavLink
            to="/salida"
            className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            aria-label="Salidas"
          >
            <LogOut size={18} />
            <span className="rail-tooltip">Salidas</span>
          </NavLink>

          {/* Datos Maestros */}
          <button
            type="button"
            className={`rail-item ${isMaestrosActive ? 'active' : ''}`}
            onClick={() => {
              setIsMaestrosOpen(true);
              openDrawer();
            }}
            aria-label="Datos maestros"
          >
            <Database size={18} />
            <span className="rail-tooltip">Datos maestros</span>
          </button>

          {/* Reportes */}
          <NavLink
            to="/reportes"
            className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            aria-label="Reportes"
          >
            <BarChart2 size={18} />
            <span className="rail-tooltip">Reportes</span>
          </NavLink>
        </nav>
      </aside>

      {/* 2. DRAWER OVERLAY (Superpuesto tanto en móvil como en escritorio al abrir) */}
      <aside className={`sidebar sidebar-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h1 className="sidebar-title" style={{ marginBottom: 0, fontSize: '1.05rem' }}>
            {effectiveVisor === 'intermediacion' ? 'INTERMEDIACIÓN' : 'F. PRIVADAS'}
          </h1>
          
          <button
            className="sidebar-close-btn"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '5px',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-links" style={{ padding: '20px 12px', flex: 1, overflowY: 'auto' }}>
          {/* ENTRADA */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              className={`nav-item ${isEntradaActive ? 'active' : ''}`}
              onClick={() => setIsEntradaOpen(!isEntradaOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LogIn size={18} />
                <span>Entrada</span>
              </div>
              {isEntradaOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {isEntradaOpen && (
              <div className="submenu">
                <NavLink 
                  to="/entrada/pre-aviso" 
                  onClick={closeDrawer} 
                  className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                >
                  Pre aviso
                </NavLink>
                <NavLink 
                  to="/entrada" 
                  end 
                  onClick={closeDrawer} 
                  className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                >
                  Recepción
                </NavLink>
              </div>
            )}
          </div>

          {/* INVENTARIO */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              className={`nav-item ${isInventarioActive ? 'active' : ''}`}
              onClick={() => setIsInventarioOpen(!isInventarioOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <Box size={18} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inventario</span>
              </div>
              {isInventarioOpen ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />}
            </div>
            {isInventarioOpen && (
              <div className="submenu">
                <NavLink to="/inventario" end onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Ajuste de inventarios</span>
                </NavLink>
                <NavLink to="/inventario/traspasos" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Traslado Alm.</span>
                </NavLink>
                <NavLink to="/inventario/mermas" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Mermas</span>
                </NavLink>
                <NavLink to="/inventario/conteos" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Conteo ciclico</span>
                </NavLink>
                <NavLink to="/inventario/muestras" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Muestreo ISP</span>
                </NavLink>
                <NavLink to="/inventario/entradas-especiales" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                   <span>Entradas Esp.</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* SALIDAS */}
          <NavLink
            to="/salida"
            onClick={closeDrawer}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
          >
            <LogOut size={18} />
            <span>Salidas</span>
          </NavLink>

          {/* DATOS MAESTROS */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              className={`nav-item ${isMaestrosActive ? 'active' : ''}`}
              onClick={() => setIsMaestrosOpen(!isMaestrosOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={18} />
                <span>Datos maestros</span>
              </div>
              {isMaestrosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {isMaestrosOpen && (
              <div className="submenu">
                <NavLink to="/maestros/clientes" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                  Clientes
                </NavLink>
                <NavLink to="/maestros/materiales" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                  Materiales
                </NavLink>
                <NavLink to="/maestros/proveedores" onClick={closeDrawer} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                  Proveedores
                </NavLink>
              </div>
            )}
          </div>

          {/* REPORTES */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <NavLink 
              to="/reportes" 
              onClick={closeDrawer}
              className={({ isActive }) => "nav-item " + (isActive ? 'active' : '')}
              style={{ 
                justifyContent: 'flex-start', 
                padding: '10px 12px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart2 size={18} />
                <span>Reportes</span>
              </div>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;