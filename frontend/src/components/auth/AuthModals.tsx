"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(2) });

export function LoginModal({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = loginSchema.safeParse({ email, password });
    setError(res.success ? null : "Preencha os campos corretamente.");
    if (res.success) alert("Login simulado com sucesso!");
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar</DialogTitle>
          <DialogDescription>Use seu e-mail e senha para acessar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RegisterModal({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = registerSchema.safeParse({ email, password, name });
    setError(res.success ? null : "Preencha os campos corretamente.");
    if (res.success) alert("Cadastro simulado com sucesso!");
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar conta</DialogTitle>
          <DialogDescription>Preencha seus dados para se cadastrar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Cadastrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


