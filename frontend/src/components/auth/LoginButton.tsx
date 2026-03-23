'use client';

import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export const LoginButton = () => {
  const { isAuthenticated, isLoading, isReady, user, login, logout, register } = useAuth();

  // Botões visíveis imediatamente, desabilitados enquanto:
  // - isLoading: timeout de 3s ainda não expirou
  // - !isReady: keycloak.init() ainda não concluiu (evita erro se clicar antes da hora)
  const buttonsDisabled = isLoading || !isReady;

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
      <Button onClick={login} disabled={buttonsDisabled}>
        <LogIn className="h-4 w-4 mr-2" />
        Entrar
      </Button>
      <Button variant="secondary" onClick={register} disabled={buttonsDisabled}>
        Registrar
      </Button>
    </div>
  );
};
