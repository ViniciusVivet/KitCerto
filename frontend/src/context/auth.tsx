'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keycloak, initKeycloak, login, logout, hasRole, isAdmin, isUser, getToken, getUserInfo, register } from '@/lib/keycloak';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: () => void;
  register: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Inicializar Keycloak
        const authenticated = await initKeycloak();
        
        if (authenticated) {
          setIsAuthenticated(true);
          setToken(keycloak.token || null);
          
          // Obter informações do usuário
          const userInfo = getUserInfo();
          if (userInfo) {
            setUser({
              id: userInfo.sub || '',
              email: userInfo.email || '',
              firstName: userInfo.given_name || '',
              lastName: userInfo.family_name || '',
              roles: (userInfo as any).realm_access?.roles || [],
            });
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Configurar listeners do Keycloak
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token || null);
          console.log('Token renovado com sucesso');
        } else {
          console.warn('Token não foi renovado, redirecionando para login');
          logout();
        }
      }).catch((error) => {
        console.error('Erro ao renovar token:', error);
        logout();
      });
    };

    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    };

  }, []);

  const handleLogin = () => {
    login();
  };

  const handleRegister = () => {
    register();
  };

  const handleLogout = () => {
    logout();
  };

  const handleHasRole = (role: string): boolean => {
    return hasRole(role);
  };

  const handleIsAdmin = (): boolean => {
    return isAdmin();
  };

  const handleIsUser = (): boolean => {
    return isUser();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasRole: handleHasRole,
    isAdmin: handleIsAdmin,
    isUser: handleIsUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
