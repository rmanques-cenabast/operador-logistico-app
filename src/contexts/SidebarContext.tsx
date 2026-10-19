import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  // Aliases for compatibility
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Por defecto colapsado (para que las tablas tengan el máximo ancho disponible)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('ol_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Guardar preferencia de colapso en localStorage
  useEffect(() => {
    localStorage.setItem('ol_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Cerrar drawer con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Al presionar las 3 rayitas (en colapsado o en móvil), abre/cierra el drawer lateral superpuesto
  const toggleSidebar = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleSidebar,
        openDrawer,
        closeDrawer,
        // Aliases
        isMobileOpen: isDrawerOpen,
        setIsMobileOpen: setIsDrawerOpen,
        closeMobile: closeDrawer
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
