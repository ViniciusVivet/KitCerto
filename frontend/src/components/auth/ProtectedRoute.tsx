'use client';

import { useAuth } from '@/context/auth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
  unauthTitle?: string;
  unauthMessage?: string;
  unauthzTitle?: string;
  unauthzMessage?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallback,
  unauthTitle,
  unauthMessage,
  unauthzTitle,
  unauthzMessage,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{unauthTitle ?? "Acesso Restrito"}</h2>
          <p className="text-muted-foreground mb-4">
            {unauthMessage ?? "Você precisa estar logado para acessar esta página."}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{unauthzTitle ?? "Acesso Negado"}</h2>
          <p className="text-muted-foreground mb-4">
            {unauthzMessage ?? "Você não tem permissão para acessar esta página."}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
