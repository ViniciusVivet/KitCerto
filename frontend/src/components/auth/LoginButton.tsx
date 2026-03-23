'use client';

import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LoginButton = () => {
  const { isAuthenticated, isLoading, isReady, user, login, logout, register } = useAuth();
  const [showHint, setShowHint] = useState(false);

  const buttonsDisabled = isLoading || !isReady;

  // Esconde o aviso automaticamente após 4s ou quando o Keycloak estiver pronto
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    if (isReady) setShowHint(false);
  }, [isReady]);

  const handleEarlyClick = () => {
    if (buttonsDisabled) setShowHint(true);
  };

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
    <div className="relative flex items-center gap-2">
      {/* Aviso de inicialização — aparece ao clicar antes do Keycloak estar pronto */}
      {showHint && (
        <div className="absolute -bottom-10 right-0 z-50 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary/20 bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          Iniciando sessão, aguarde…
        </div>
      )}

      {/* Wrapper div captura cliques mesmo com botão disabled */}
      <div onClick={handleEarlyClick}>
        <Button onClick={!buttonsDisabled ? login : undefined} disabled={buttonsDisabled}>
          <LogIn className="h-4 w-4 mr-2" />
          Entrar
        </Button>
      </div>
      <div onClick={handleEarlyClick}>
        <Button variant="secondary" onClick={!buttonsDisabled ? register : undefined} disabled={buttonsDisabled}>
          Registrar
        </Button>
      </div>
    </div>
  );
};
