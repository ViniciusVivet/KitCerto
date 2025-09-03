# KitCerto Frontend

Aplicação web construída em **Next.js 14 + TypeScript + TailwindCSS**.  
Interface do e-commerce KitCerto, conectada à API backend.

---

## 🔧 Pré-requisitos

- [Node.js](https://nodejs.org/) (>= 18)
- npm, yarn, pnpm ou bun (à sua escolha)

---

## 🚀 Rodando o projeto

1. Instale dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

3. Acesse no navegador:
   ```
   http://localhost:3000
   ```

---

## 📂 Estrutura principal

- app/ → Páginas e rotas (App Router)
- components/ → Componentes reutilizáveis
- styles/ → Estilos globais
- public/ → Arquivos estáticos (imagens, ícones)

---

## 🛠️ Scripts úteis

- npm run dev → inicia em modo desenvolvimento
- npm run build → cria versão de produção
- npm start → roda build de produção
- npm run lint → executa ESLint

---

## 📦 Deploy

Recomendado deploy na [Vercel](https://vercel.com/).  
Basta conectar o repositório e a plataforma cuida do resto.
