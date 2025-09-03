# 💎 KitCerto API

A **KitCerto** nasceu como uma marca de semi-joias na Zona Leste de São Paulo.  
Este projeto é a transformação digital da marca — um **e-commerce robusto** com:

- Arquitetura **Clean Architecture** (camadas bem definidas).
- **CQRS (Command Query Responsibility Segregation)** para separar escrita/leitura.
- Autenticação e Autorização via **Keycloak (OIDC + JWT)**.
- API **100% documentada no Swagger**.
- Integração pronta para **MongoDB**.

---

## 🚀 Objetivo

Construir um backend sólido que vai servir como **base oficial do e-commerce da KitCerto**, escalável e seguro, pronto para integrar com frontend moderno (Next.js).

---

## 🏗️ Estrutura do Projeto

- **KitCerto.API** → Porta de entrada, Controllers, Swagger.
- **KitCerto.Application** → Regras de caso de uso (CQRS, Handlers, Validadores).
- **KitCerto.Domain** → Entidades puras (Produto, Categoria, Interfaces).
- **KitCerto.Infrastructure** → Persistência e Repositórios (MongoDB).
- **Frontend** → Next.js + Tailwind (em construção).
- **Infra** → Docker Compose (API, Mongo, Keycloak, Nginx).

---

## 🔑 Tecnologias

- [.NET 9](https://dotnet.microsoft.com/)  
- [MongoDB](https://www.mongodb.com/)  
- [Keycloak](https://www.keycloak.org/)  
- [MediatR](https://github.com/jbogard/MediatR)  
- [FluentValidation](https://docs.fluentvalidation.net/)  
- [Swagger / OpenAPI](https://swagger.io/)

---

## 🧩 Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/ViniciusVivet/KitCerto.git
   cd KitCerto
   ```

2. Configure o `.env`:
   ```bash
   cp infra/.env.example infra/.env
   ```

3. Suba a infraestrutura com Docker:
   ```bash
   docker compose up -d
   ```

4. Rode a API:
   ```bash
   cd backend
   dotnet restore
   dotnet build
   dotnet run --project KitCerto.API --urls http://localhost:5000
   ```

5. Acesse:
   - Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)  
   - HealthCheck: [http://localhost:5000/health](http://localhost:5000/health)

---

## 👤 Autor

**Douglas Vinicius Alves da Silva**  
[GitHub](https://github.com/ViniciusVivet) • [LinkedIn](https://linkedin.com/in/Vivetsp)  

---

## 📜 Licença
[MIT](https://opensource.org/licenses/MIT)
