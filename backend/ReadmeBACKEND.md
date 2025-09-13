# KitCerto Backend

API do e‑commerce **KitCerto**, construída com **.NET 9**, **MongoDB**, **Keycloak (OIDC/JWT)** e **CQRS + Clean Architecture**.

---

## 🔧 Pré‑requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/)
- [Docker Desktop](https://www.docker.com/) (MongoDB + Keycloak)
- (Frontend local) **Node 20 LTS**

---

## 🚀 Rodando o projeto

1. Configure o ambiente:
   ```bash
   cp .env.example .env
   ```

2. Suba a infraestrutura (escolha um):
   - Dev (com Nginx e frontend):
     ```bash
     docker compose -f docker-compose.dev.yml up -d --build
     ```
   - Prod-like (infra com Postgres + Keycloak start):
     ```bash
     docker compose -f infra/docker-compose.yml up -d --build
     ```

3. Restaure e compile:
   ```bash
   cd backend
   dotnet restore
   dotnet build
   ```

4. Rode a API:
   ```bash
   dotnet run --project KitCerto.API --urls http://localhost:5000
   ```

5. Acesse:
   - Swagger: http://localhost:5000/swagger
   - Health: http://localhost:5000/health

> Frontend integrado via Docker Compose. Veja `frontend/ReadmeFRONTEND.md` para detalhes.

---

## 📂 Estrutura principal

- KitCerto.API → Controllers, Swagger, autenticação
- KitCerto.Application → CQRS (Commands, Handlers, Validators)
- KitCerto.Domain → Entidades puras + Interfaces
- KitCerto.Infrastructure → MongoDB (Context + Repositórios)

Endpoints principais:
- Categorias: `GET/POST /api/categories`
- Produtos: `GET /api/products`, `POST/PUT/DELETE /api/products/{id}`, `PUT /api/products/{id}/stock`
- Dashboard: `GET /api/dashboard/overview`
- Auth util: `GET /api/auth/ping`

---

## 🛠️ Comandos úteis

- dotnet restore → instala dependências  
- dotnet build → compila o projeto  
- dotnet run --project KitCerto.API → roda a API  
- docker compose up -d → sobe infraestrutura  

## 🔐 Autenticação
- Keycloak configurado (realm `kitcerto`, clients `kitcerto-api` e `kitcerto-frontend`).
- Roles via JWT mapeadas para claims .NET (`ClaimTypes.Role`).
- Usuários de teste: `admin@kitcerto.dev` (admin), `joao@kitcerto.dev` (user).
  
> Swagger OAuth: garanta `Auth:Realm=kitcerto`. Se `Auth:Authority` já contiver `/realms/kitcerto`, o código do Swagger já trata para não duplicar o caminho.

## ⚙️ Operação
- ProblemDetails (middleware): disponível; habilitar no pipeline se desejar respostas padronizadas.
- Rate limiting: janela fixa (100 req/min)
- Health checks: `/health` (Mongo)
- Logs: Serilog (console)

---

## 📦 Deploy

Pode ser publicado em **Docker** ou via **Azure / AWS / GCP**.  
Recomendado usar docker-compose com API + MongoDB + Keycloak + Frontend.
