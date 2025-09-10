# KitCerto API (Backend)

API **.NET 9** seguindo **Clean Architecture + CQRS/MediatR**, com **MongoDB** e **Keycloak (OIDC/JWT)**.

## Requisitos
- .NET 9 SDK
- MongoDB local (ex.: `mongodb://localhost:27017`)

## Como rodar
```bash
cd backend
dotnet build
dotnet run --project ./KitCerto.API --urls http://localhost:5000
```

### URLs
- Swagger: http://localhost:5000/swagger
- Health:  http://localhost:5000/health

## Variáveis de ambiente

Use um `.env` dentro de `backend/`:

```
ASPNETCORE_URLS=http://localhost:5000

# Mongo
ConnectionStrings__Mongo=mongodb://localhost:27017
Mongo__DatabaseName=kitcerto

# Auth (Keycloak)
# Forma 1 (recomendada): base + realm
Auth__Authority=http://localhost:8080
Auth__Realm=kitcerto
Auth__Audience=kitcerto-api

# Forma 2: Authority já com /realms/kitcerto (o Swagger trata a duplicação)
# Auth__Authority=http://localhost:8080/realms/kitcerto
# Auth__Audience=kitcerto-api
```

## Pacotes
```bash
cd backend/KitCerto.API
dotnet add package AspNetCore.HealthChecks.MongoDb
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet restore
```

## Endpoints resumidos
- Categorias: `GET/POST /api/categories`
- Produtos: `GET /api/products`, `POST/PUT/DELETE /api/products/{id}`, `PUT /api/products/{id}/stock`
- Produtos: `GET /api/products/search` (com filtros e paginação)
- Produtos: `GET /api/products/low-stock` (alertas de estoque < 10)
- Dashboard: `GET /api/dashboard/overview`
- Auth util: `GET /api/auth/ping`, `GET /whoami` (info do usuário logado)

## Integração Frontend
- ✅ CORS configurado para `http://localhost:3000`
- ✅ Endpoints testados e funcionais
- ✅ Fallback inteligente implementado no frontend

