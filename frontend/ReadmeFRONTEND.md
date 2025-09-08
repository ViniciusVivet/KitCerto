# KitCerto Frontend

Aplicação web do e-commerce **KitCerto**, construída em **Next.js 14 + TypeScript + Tailwind 3 + shadcn/ui**.  
Integração completa com API backend implementada com **fallback inteligente** (API → mocks) para desenvolvimento e produção.

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

## ✨ Funcionalidades

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
- Dashboard
  - KPIs, produtos/valor por categoria, distribuição por preço
  - Mais vendidos e pesquisa de vendidos
  - Integração com API backend
- Meus pedidos
  - Filtros por status/período, busca, detalhes em modal
  - "Repetir compra" (joga itens no carrinho)

## 🔌 Integração API/Keycloak

- ✅ Serviços HTTP implementados com fallback inteligente (API → mocks)
- ✅ Feature-flag configurada (`NEXT_PUBLIC_USE_MOCKS`)
- ✅ TanStack Query para gerenciamento de estado
- ✅ **Docker Compose de desenvolvimento**: frontend integrado e funcionando via **Nginx (http://localhost)**
- ✅ **Autenticação Keycloak**: login/logout, proteção de rotas e guards de ações funcionando
- ✅ **Proteção de rotas**: Dashboard protegido para role `admin`, demais rotas para `user`

### Configuração de Ambiente

#### Docker Compose (Automático)
No Docker Compose de desenvolvimento, as variáveis são configuradas automaticamente (
`docker-compose.dev.yml`):
```bash
NEXT_PUBLIC_API_BASE_URL=http://api:5000
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=kitcerto
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=kitcerto-frontend
```

#### Desenvolvimento Local
```bash
# Para usar API real
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_USE_MOCKS=false

# Para usar mocks (desenvolvimento)
NEXT_PUBLIC_USE_MOCKS=true
```

## 📝 Notas

- O projeto usa **Tailwind 3** (com tokens) e **shadcn/ui**.
- Em DEV via Nginx, garanta no Keycloak (client `kitcerto-frontend`):
  - **Valid Redirect URIs**: `http://localhost/*`
  - **Web Origins**: `http://localhost`
- No acesso direto (sem Nginx), mantenha também `http://localhost:3000/*` e Web Origin `http://localhost:3000`.

---

## 📦 Deploy

Recomendado deploy na [Vercel](https://vercel.com/).  
Basta conectar o repositório e a plataforma cuida do resto.
