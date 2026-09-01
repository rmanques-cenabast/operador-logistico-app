import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'intermediacion' | 'farmacias' | 'admin';

export interface User {
  username: string;
  role: UserRole;
  almacenPermitido: string; // '6001', '6006', o 'ALL'
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, role: UserRole, almacenPermitido: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restaurar sesión desde localStorage al cargar la app
    const storedAuth = localStorage.getItem('auth_session');
    if (storedAuth) {
      const session = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUser(session.user);
    }
  }, []);

  const login = (username: string, role: UserRole, almacenPermitido: string) => {
    const newUser: User = { username, role, almacenPermitido };
    setIsAuthenticated(true);
    setUser(newUser);
    localStorage.setItem('auth_session', JSON.stringify({ user: newUser }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_session');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
