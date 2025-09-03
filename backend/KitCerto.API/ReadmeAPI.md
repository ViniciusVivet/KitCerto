# KitCerto API (Backend)

API .NET 9 seguindo Clean Architecture + CQRS/MediatR.

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

# Auth (Keycloak) - placeholder
Auth__Authority=http://localhost:8080/realms/kitcerto
Auth__Audience=kitcerto-api
```

## Pacotes
```bash
cd backend/KitCerto.API
dotnet add package AspNetCore.HealthChecks.MongoDb
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet restore
```

