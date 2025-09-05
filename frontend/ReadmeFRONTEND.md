# KitCerto Frontend

Aplicação web do e-commerce **KitCerto**, construída em **Next.js 14 + TypeScript + Tailwind 3 + shadcn/ui**.  
Neste momento está operando com dados **mockados** (sem depender da API/Keycloak) para viabilizar a validação visual/UX do fluxo completo de compra.

---

## 🔧 Pré-requisitos

- **Node 20 LTS** (recomendado; evite Node 22 no dev)
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
- components/
  - layout/ → Header, etc.
  - ui/ → base do shadcn/ui (button, input, sheet, dialog…)
  - product/ → Quick View e componentes de produto
  - checkout/ → Checkout Modal
  - auth/ → Modais mock de login/registro
- context/ → `cart`, `favorites`, `toast`
- lib/ → `mock.ts` (produtos, categorias, dashboard, pedidos)
- public/ → estáticos

---

## 🛠️ Scripts úteis

- npm run dev → inicia em modo desenvolvimento
- npm run build → cria versão de produção
- npm start → roda build de produção
- npm run lint → executa ESLint

## ✨ Funcionalidades (mock)

- Home
  - Hero (banners), carrosséis (Mais vendidos/Novidades)
  - Filtros: lateral fixa (desktop) e drawer (mobile)
  - Cards com glow, favoritos (localStorage) e Quick View (variações, quantidade, galeria)
- Carrinho
  - Drawer com +/−/remover, subtotal, toast de ações e persistência local
  - Badge com quantidade no ícone
- Checkout
  - Fluxo em passos (endereço/frete/pagamento/revisão) com cupom (ex.: `KIT10`)
  - Toasts de confirmação
- Dashboard (mock)
  - KPIs, produtos/valor por categoria, distribuição por preço
  - Mais vendidos e pesquisa de vendidos
- Meus pedidos (mock)
  - Filtros por status/período, busca, detalhes em modal
  - “Repetir compra” (joga itens no carrinho)

## 🔌 Integração futura (quando habilitar API/Keycloak)

- Substituir hooks mock (`lib/mock.ts`) por serviços HTTP (TanStack Query)
- Autenticação com Keycloak (login/logout, proteção de rotas e guards de ações)
- Nginx/Compose: adicionar serviço `frontend` e roteamento `/api` → API

## 📝 Notas

- O projeto usa **Tailwind 3** (com mapeamento de tokens CSS) e **shadcn/ui**.
- Para ambiente Windows, use **Node 20 LTS** para evitar instabilidades do dev overlay.

---

## 📦 Deploy

Recomendado deploy na [Vercel](https://vercel.com/).  
Basta conectar o repositório e a plataforma cuida do resto.
