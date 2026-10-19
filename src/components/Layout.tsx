import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

const LayoutInner: React.FC = () => {
  const { isDrawerOpen, closeDrawer } = useSidebar();

  return (
    <div className="layout">
      {/* Backdrop oscuro cuando el drawer lateral está abierto (tanto en escritorio como en móvil) */}
      {isDrawerOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
};

export default Layout;
