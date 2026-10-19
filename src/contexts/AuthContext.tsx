import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type UserRole = 'intermediacion' | 'farmacias' | 'admin';
export type ActiveVisor = 'intermediacion' | 'farmacias';

export interface User {
  username: string;
  role: UserRole;
  almacenPermitido: string; // '6000-6099' (Intermediación), '6100+' (Farmacias Privadas), o 'ALL' (Administrador)
  activeVisor?: ActiveVisor;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  effectiveVisor: ActiveVisor;
  lineaNegocio: 'INT' | 'FP';
  lineaNegocioLabel: string;
  login: (username: string, role: UserRole, almacenPermitido: string, activeVisor?: ActiveVisor) => void;
  setActiveVisor: (visor: ActiveVisor) => void;
  logout: () => void;
}

/**
 * Valida si un JWT de IAM CENABAST ha expirado
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Si no es un JWT estándar de 3 partes, no podemos verificar fecha internamente
      return false;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (decoded && typeof decoded.exp === 'number') {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return nowInSeconds >= decoded.exp - 5; // Margen de seguridad de 5 segundos
    }
    return false;
  } catch {
    return false;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicialización sincrónica desde localStorage para evitar que la sesión se cierre al recargar (F5)
  const getInitialSession = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('cenabast_token');
      // Si hay un token y ha expirado según IAM, invalidamos la sesión
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('auth_session');
        localStorage.removeItem('cenabast_token');
        return null;
      }

      const storedAuth = localStorage.getItem('auth_session');
      if (storedAuth) {
        const session = JSON.parse(storedAuth);
        if (session && session.user) {
          return session.user;
        }
      }
    } catch {
      localStorage.removeItem('auth_session');
      localStorage.removeItem('cenabast_token');
    }
    return null;
  };

  const initialUser = getInitialSession();
  const [user, setUser] = useState<User | null>(() => initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!initialUser);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('cenabast_token');
  }, []);

  // Validación periódica de expiración de token de IAM
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem('cenabast_token');
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 15000); // Chequeo cada 15 segundos

    // Escuchar evento global cuando cualquier llamada API reciba 401 Unauthorized de IAM
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      clearInterval(checkTokenInterval);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [logout]);

  const login = (username: string, role: UserRole, almacenPermitido: string, activeVisor?: ActiveVisor) => {
    const defaultVisor: ActiveVisor = role === 'intermediacion' ? 'intermediacion' : (activeVisor || 'farmacias');
    const newUser: User = { username, role, almacenPermitido, activeVisor: defaultVisor };
    setIsAuthenticated(true);
    setUser(newUser);
    localStorage.setItem('auth_session', JSON.stringify({ user: newUser }));
  };

  const setActiveVisor = (visor: ActiveVisor) => {
    if (!user) return;
    const updatedUser: User = { ...user, activeVisor: visor };
    setUser(updatedUser);
    localStorage.setItem('auth_session', JSON.stringify({ user: updatedUser }));
  };

  const effectiveVisor: ActiveVisor = user?.role === 'admin'
    ? (user.activeVisor || 'farmacias')
    : (user?.role === 'intermediacion' ? 'intermediacion' : 'farmacias');

  const lineaNegocio: 'INT' | 'FP' = effectiveVisor === 'intermediacion' ? 'INT' : 'FP';
  const lineaNegocioLabel: string = effectiveVisor === 'intermediacion' ? 'INTERMEDIACIÓN' : 'FARMACIAS PRIVADAS';

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, effectiveVisor, lineaNegocio, lineaNegocioLabel, login, setActiveVisor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
