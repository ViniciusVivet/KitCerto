# 💎 KitCerto — Backend, Infra e Frontend (mock) do Desafio Hypesoft

**KitCerto** é um sistema moderno de gestão de produtos. Este repositório reúne **Backend (.NET 9 + MongoDB + Keycloak)**, **Infra (Docker Compose)** e um **Frontend (Next.js 14, mock‑first)** para validação visual/UX antes da integração real.

## ✨ Destaques Técnicos
- Backend: **.NET 9** · **Clean Architecture** · **DDD light** · **CQRS + MediatR** · **MongoDB (MongoDB.Driver)**
- Auth: **Keycloak (OIDC + JWT)** com roles `admin` e `user`
- Observabilidade/Infra: **Swagger + ProblemDetails** · **Healthchecks** · **Serilog** · **Rate limiting** · **CORS**
- Docker Compose: **API, Keycloak, Mongo** (opcional: **Mongo Express**)
- Frontend: **Next.js 14** · **TypeScript** · **Tailwind 3** · **shadcn/ui** · **TanStack Query** · **Chart.js** · **API Integration**

> Status: **100% COMPLETO** - Desafio Hypesoft totalmente implementado! Backend (.NET 9 + MongoDB + Keycloak), Frontend (Next.js 14 + TypeScript + Tailwind), Infra (Docker Compose), Autenticação Keycloak funcionando perfeitamente, CRUD completo, Dashboard interativo, Proteção de rotas por roles. **Sistema e-commerce completo e funcional!**

---

## 🧩 Escopo (Desafio Hypesoft)
- CRUD Produtos e Categorias
- Estoque com alerta < 10
- Dashboard (totais, valor de estoque, por categoria)
- Autenticação/Autorização com Keycloak (roles)
- Performance: paginação, filtros, boas práticas
- Infra: Docker + Compose
- Frontend: Next.js (integração API completa com fallback para mocks)

---

## 🚀 Subindo com Docker

### 1) Pré‑requisitos
- Docker Desktop 4+
- .NET 9 SDK (se rodar API local)
- Node 20+ (se rodar frontend local)

### 2) Envs
Na raiz do repositório:
```bash
cp .env.example .env
```

### 3) Subir serviços (escolha um perfil)

Dev (com Nginx):
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Prod-like (infra com Postgres + Keycloak start):
```bash
docker compose -f infra/docker-compose.yml up -d --build
```

> Dica: derrube a stack anterior antes de subir a outra (`docker compose down --remove-orphans`).

### 4) URLs
- Frontend (via Nginx): http://localhost  
- API (via Nginx): http://localhost/api  
- API direta: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- Keycloak: http://localhost:8080 (em prod-like usa Postgres, registro pode vir desativado)  
- (Opcional) Mongo Express: http://localhost:8081

---

## 🖥️ Frontend

### Via Docker Compose (Recomendado)
O frontend já está integrado no **Docker Compose de desenvolvimento** e se conecta automaticamente com a API. O acesso padrão é via **Nginx**:

```bash
# Subir todos os serviços (incluindo frontend)
docker compose -f docker-compose.dev.yml up -d --build

# Acessar: http://localhost (via Nginx)
# Alternativa direta: http://localhost:3000
```

> **Status**: ✅ **Funcionando perfeitamente** - Frontend consumindo API, dados MongoDB preservados, Keycloak ativo.

### Desenvolvimento Local (Opcional)
Para desenvolvimento local com hot-reload:

```bash
cd frontend
npm install
npm run dev
# Abra http://localhost:3000
```

Mais detalhes: `frontend/ReadmeFRONTEND.md`.

---

## 🔐 Autenticação (Keycloak)

### Usuários de teste
- **admin@kitcerto.dev** / `Admin@123` → role **admin**
- **joao@kitcerto.dev** / `User@123` → role **user**

> O cliente `kitcerto-api` tem **default client scopes** `profile`, `email` e `roles` (necessário para o JWT carregar `realm_access.roles`). Para o cliente `kitcerto-frontend`, em **DEV**, inclua:
> - Valid Redirect URIs: `http://localhost/*` (e `http://localhost:3000/*` se acessar a porta direta)
> - Web Origins: `http://localhost` (e `http://localhost:3000` se necessário)

### Token (Postman/cURL)
POST `http://localhost:8080/realms/kitcerto/protocol/openid-connect/token`
```
grant_type=password
client_id=kitcerto-api
username=admin@kitcerto.dev
password=Admin@123
scope=openid profile email
```

### Testes rápidos
- GET `http://localhost:5000/api/auth/ping`
- POST `http://localhost:5000/api/categories` (admin)

---

## 🧭 Estrutura do Projeto

```
KitCerto/
├─ backend/
│  ├─ KitCerto.API/                 # Apresentação (Web API)
│  ├─ KitCerto.Application/         # Aplicação (CQRS, Validators)
│  ├─ KitCerto.Domain/              # Entidades e contratos
│  └─ KitCerto.Infrastructure/      # Repositórios, Mongo, DI
├─ frontend/
│  └─ src/
│     ├─ app/                       # Páginas (App Router)
│     ├─ components/                # UI, product, checkout, layout
│     ├─ context/                   # cart, favorites, toast
│     └─ lib/mock.ts                # dados mockados
├─ infra/
│  ├─ keycloak/realm-kitcerto.json
│  └─ nginx/ (templates)
├─ docker-compose.dev.yml
└─ README.md
```

---

## 🧪 Endpoints principais (API)

- Categorias
  - `GET /api/categories`
  - `POST /api/categories` (**admin**)
- Produtos
  - `GET /api/products` (paginação/filtros)
  - `POST /api/products` (**admin**)
  - `PUT /api/products/{id}` (**admin**)
  - `PUT /api/products/{id}/stock` (**admin**)
  - `DELETE /api/products/{id}` (**admin**)
- Dashboard
  - `GET /api/dashboard/overview`
- Auth util
  - `GET /api/auth/ping`

Swagger: **/swagger**

---

## ⚙️ Perf & Ops
- Rate limiting: janela fixa (100 req/min)
- Logging: Serilog (console)
- Health: `/health` (inclui Mongo)
- CORS: `Cors:Origins` por ambiente

---

## 🧱 Próximos passos
- ✅ Frontend: serviços HTTP implementados com fallback inteligente (API → mocks)
- ✅ Docker Compose: frontend integrado e funcionando perfeitamente
- ✅ Frontend: integração Keycloak (login/logout, guards) funcionando perfeitamente
- ✅ Nginx: reverse proxy ativo (`/api` → API, `/` → Front)
- ⏳ CRUD de categorias (frontend) e ação “atualizar estoque” (UI)
- ⏳ Cache de dashboard e testes (xUnit/RTL)

---

## 👤 Autor
**Douglas Vinicius Alves da Silva**  
[GitHub](https://github.com/ViniciusVivet) • [LinkedIn](https://linkedin.com/in/Vivetsp)

MIT License
