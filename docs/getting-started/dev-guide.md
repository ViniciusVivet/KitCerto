# Guia de Desenvolvimento

## Estrutura
- Domain – Entidades
- Application – CQRS/Handlers
- Infrastructure – Repos/Mongo
- API – Controllers/Swagger/DI

## Commits
```
feat(products): add stock update endpoint
fix(api): correct health check registration
docs(readme): add env example
```

## Comandos úteis
```bash
dotnet restore
dotnet build
dotnet run --project ./KitCerto.API --urls http://localhost:5000
```

## Frontend local (sem Nginx)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
