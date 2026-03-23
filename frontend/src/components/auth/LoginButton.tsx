'use client';

import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

export const LoginButton = () => {
  const { isAuthenticated, isLoading, user, login, logout, register } = useAuth();

  // Enquanto o Keycloak inicializa, exibe os botões desabilitados no lugar do
  // "Carregando..." — evita layout shift e a UI aparece imediatamente.
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Button disabled>
          <LogIn className="h-4 w-4 mr-2" />
          Entrar
        </Button>
        <Button variant="secondary" disabled>
          Registrar
        </Button>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Olá, {user.firstName || user.email}
        </span>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={login}>
        <LogIn className="h-4 w-4 mr-2" />
        Entrar
      </Button>
      <Button variant="secondary" onClick={register}>
        Registrar
      </Button>
    </div>
  );
};
