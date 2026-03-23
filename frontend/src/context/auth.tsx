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
  // true somente após keycloak.init() completar — guarda as funções de login/register
  isReady: boolean;
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
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Timeout de segurança: se o Keycloak demorar mais de 3s (servidor lento ou
        // offline), desbloqueia a UI como "não autenticado" para não travar a página.
        const timeoutId = setTimeout(() => setIsLoading(false), 3000);

        // Inicializar Keycloak
        const authenticated = await initKeycloak();
        clearTimeout(timeoutId);
        setIsReady(true); // keycloak.init() concluído — funções de login/register agora são seguras
        
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
    // Ignora clique se o Keycloak ainda não terminou de inicializar.
    // Evita erro "Keycloak not initialized" na janela entre o timeout de 3s
    // e a resposta real do servidor.
    if (!isReady) return;
    login();
  };

  const handleRegister = () => {
    if (!isReady) return;
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
    isReady,
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
