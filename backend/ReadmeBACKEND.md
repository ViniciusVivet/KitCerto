# KitCerto Backend

API do e-commerce **KitCerto**, construída com **.NET 9**, **MongoDB**, **Keycloak** e **CQRS + Clean Architecture**.

---

## 🔧 Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/)  
- [Docker](https://www.docker.com/) (para MongoDB e Keycloak)  

---

## 🚀 Rodando o projeto

1. Configure o ambiente:
   ```bash
   cp infra/.env.example infra/.env
   ```

2. Suba a infraestrutura (MongoDB + Keycloak + Nginx):
   ```bash
   docker compose up -d
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
   - HealthCheck: http://localhost:5000/health

---

## 📂 Estrutura principal

- KitCerto.API → Controllers, Swagger, autenticação
- KitCerto.Application → CQRS (Commands, Handlers, Validators)
- KitCerto.Domain → Entidades puras + Interfaces
- KitCerto.Infrastructure → MongoDB (Context + Repositórios)

---

## 🛠️ Comandos úteis

- dotnet restore → instala dependências  
- dotnet build → compila o projeto  
- dotnet run --project KitCerto.API → roda a API  
- docker compose up -d → sobe infraestrutura  

---

## 📦 Deploy

Pode ser publicado em **Docker** ou via **Azure / AWS / GCP**.  
Recomendado usar docker-compose com API + MongoDB + Keycloak + Frontend.
