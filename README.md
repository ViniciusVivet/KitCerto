# 💎 KitCerto — API & Infra do Desafio Hypesoft

**KitCerto** nasceu como uma marca de semi-joias na Zona Leste de SP.  
Este repositório entrega o **backend e a infra** de um sistema moderno de gestão de produtos, seguindo o **Desafio Técnico Hypesoft** — com arquitetura limpa, autenticação sólida e documentação profissional.

## ✨ Destaques Técnicos
- **.NET 9** · **Clean Architecture** · **DDD light** · **CQRS + MediatR**
- **MongoDB** (repos custom com MongoDB.Driver)
- **Keycloak (OIDC + JWT)** com **roles** `admin` e `user`
- **Swagger** com JWT + ProblemDetails
- **Healthchecks**, **Serilog**, **Rate limiting**, **CORS**
- Docker Compose (API, Keycloak, Mongo, *Mongo Express opcional*)
- Pronto para **Nginx** e **Frontend Next.js 15**

---

## 🧩 Escopo do Desafio (Hypesoft)
- CRUD **Produtos** e **Categorias**
- **Estoque** com alerta `< 10`
- **Dashboard** (totais, valor total em estoque, por categoria)
- **Autenticação/Autorização** com Keycloak (roles)
- **Performance**: paginação, filtros, boas práticas
- **Infra**: Docker + Compose
- **Frontend** (Next.js) — a ser pluggado

> **Status**: Backend/Infra **90%+** prontos; Auth OK; roles habilitadas; Frontend em bootstrap.

---

## 🚀 Subindo tudo em 1 comando (Docker)

### 1) Pré-requisitos
- Docker Desktop 4+
- .NET 9 SDK (se rodar local)
- Node 18+ (se rodar frontend depois)

### 2) Copie envs de exemplo
Na raiz do repo:
```bash
cp .env.example .env
```

### 3) Suba os serviços
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### 4) URLs
- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- Keycloak: http://localhost:8080  
- (Opcional) Mongo Express: http://localhost:8081

---

## 🔐 Autenticação (Keycloak)

### Usuários de teste
- **admin@kitcerto.dev** / `Admin@123` → role **admin**
- **joao@kitcerto.dev** / `User@123` → role **user**

> As roles são realm roles. O cliente `kitcerto-api` tem **default client scopes** `profile`, `email` **e `roles`** (necessário para o JWT carregar `realm_access.roles`).

### Pegando token (Postman/cURL)
**POST** `http://localhost:8080/realms/kitcerto/protocol/openid-connect/token`  
Body (x-www-form-urlencoded):
```
grant_type=password
client_id=kitcerto-api
username=admin@kitcerto.dev
password=Admin@123
scope=openid profile email
```

### Testes rápidos
- **GET** `http://localhost:5000/api/auth/ping` → exige token válido; retorna usuário e **roles**.
- **POST** `http://localhost:5000/api/categories` → exige **role admin**:
```json
{ "name": "Bebidas" }
```

---

## 🧭 Estrutura do Projeto

```
KitCerto/
├─ backend/
│  ├─ KitCerto.API/                 # Camada de Apresentação (Web API)
│  │  ├─ Controllers/
│  │  ├─ appsettings.*.json
│  │  └─ Program.cs
│  ├─ KitCerto.Application/         # Camada de Aplicação (CQRS, DTOs, Validators)
│  ├─ KitCerto.Domain/              # Entidades, VOs, Regras
│  └─ KitCerto.Infrastructure/      # Repositórios, Mongo, DI
├─ infra/
│  ├─ keycloak/
│  │  └─ realm-kitcerto.json        # Realm com roles/usuários e client
│  └─ nginx/ (em breve)
├─ docker-compose.dev.yml
├─ .env.example
└─ README.md
```

---

## 🧪 Endpoints principais

- **Categorias**
  - `GET /api/categories` (livre para autenticados)
  - `POST /api/categories` (**admin**)
- **Produtos**
  - `GET /api/products` (paginação/filtros)
  - `POST /api/products` (**admin**)
  - `PUT /api/products/{id}` (**admin**)
  - `PUT /api/products/{id}/stock` (**admin**)
  - `DELETE /api/products/{id}` (**admin**)
- **Dashboard**
  - `GET /api/dashboard/summary`, `by-category`, `low-stock`
- **Auth util**
  - `GET /api/auth/ping` (devolve `user` + `roles`)

> Swagger com exemplos em: **/swagger**.

---

## ⚙️ Perf & Ops
- **Rate limiting**: janela fixa (100 req/min)
- **Logging**: Serilog (console)
- **Health**: `/health` (inclui Mongo)
- **CORS**: Origins via `Cors:Origins` (env)

---

## 🧱 Próximos passos (planejados)
- Frontend Next 15 + Tailwind + shadcn/ui + Chart.js
- Nginx como reverse proxy (`/api` → API, `/` → Front)
- Cache de listas (IMemoryCache/ETag)
- Seeds & testes de integração (xUnit + FluentAssertions)

---

## 👤 Autor
**Douglas Vinicius Alves da Silva**  
[GitHub](https://github.com/ViniciusVivet) • [LinkedIn](https://linkedin.com/in/Vivetsp)

MIT License
