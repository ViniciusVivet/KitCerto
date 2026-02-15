import Keycloak from 'keycloak-js';

// Configuração do Keycloak
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'kitcerto',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'kitcerto-frontend',
};

// Instância do Keycloak
export const keycloak = new Keycloak(keycloakConfig);

// Configurações de inicialização
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : '',
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
};

// Função para inicializar o Keycloak
export const initKeycloak = async () => {
  try {
    const authenticated = await keycloak.init(keycloakInitOptions);
    return authenticated;
  } catch (error) {
    console.error('Erro ao inicializar Keycloak:', error);
    return false;
  }
};

// Função para fazer login
export const login = () => {
  keycloak.login({
    redirectUri: `${window.location.origin}/`,
  });
};

export const register = () => {
  keycloak.register({
    redirectUri: `${window.location.origin}/`,
  });
};

// Função para fazer logout
export const logout = () => {
  keycloak.logout({
    redirectUri: `${window.location.origin}/`,
  });
};

// Função para verificar se o usuário tem uma role específica
export const hasRole = (role: string): boolean => {
  return keycloak.hasRealmRole(role);
};

// Função para verificar se o usuário é admin
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Função para verificar se o usuário é user
export const isUser = (): boolean => {
  return hasRole('user');
};

// Função para obter o token
export const getToken = (): string | undefined => {
  return keycloak.token;
};

// Função para obter informações do usuário
export const getUserInfo = () => {
  return keycloak.tokenParsed;
};
