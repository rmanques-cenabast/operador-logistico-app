import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogIn, Box, LogOut, ChevronDown, ChevronRight, Menu, Database, ArrowRightLeft, Trash2, Scale, FlaskConical, Gift, FileText } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isMaestrosOpen, setIsMaestrosOpen] = useState(false);
  const [isInventarioOpen, setIsInventarioOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          {!isCollapsed && <h1 className="sidebar-title">CENABAST OL</h1>}
          {!isCollapsed && <div className="sidebar-subtitle">Terminal A-12</div>}
          {isCollapsed && <h1 className="sidebar-title" style={{ fontSize: '1.2rem', textAlign: 'center' }}>C</h1>}
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

      <nav className="nav-links" style={{ padding: isCollapsed ? '16px 8px' : '24px' }}>
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
                <FileText size={15} style={{ flexShrink: 0 }} /> <span>Registros Generales</span>
              </NavLink>
              <NavLink to="/inventario/traspasos" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                <ArrowRightLeft size={15} style={{ flexShrink: 0 }} /> <span>Traspasos e Internos</span>
              </NavLink>
              <NavLink to="/inventario/mermas" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                <Trash2 size={15} style={{ flexShrink: 0 }} /> <span>Mermas y Destrucción</span>
              </NavLink>
              <NavLink to="/inventario/conteos" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                <Scale size={15} style={{ flexShrink: 0 }} /> <span>Conteos Cíclicos</span>
              </NavLink>
              <NavLink to="/inventario/muestras" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                <FlaskConical size={15} style={{ flexShrink: 0 }} /> <span>Muestreos ISP</span>
              </NavLink>
              <NavLink to="/inventario/entradas-especiales" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                <Gift size={15} style={{ flexShrink: 0 }} /> <span>Entradas Especiales</span>
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
      </nav>
    </aside>
  );
};

export default Sidebar;
