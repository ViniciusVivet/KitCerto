'use client';

import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

export const LoginButton = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <User className="h-4 w-4 mr-2" />
        Carregando...
      </Button>
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
    <Button onClick={login}>
      <LogIn className="h-4 w-4 mr-2" />
      Entrar
    </Button>
  );
};
