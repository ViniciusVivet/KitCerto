# Infraestrutura (dev)
Camada que **fala com o mundo externo**.

## Serviços
- MongoDB
- Mongo Express (opcional)
- Keycloak (futuro)

## Mongo local
Connection string: `mongodb://localhost:27017`

## .env
```
ASPNETCORE_URLS=http://localhost:5000
ConnectionStrings__Mongo=mongodb://localhost:27017
Mongo__DatabaseName=kitcerto
Auth__Authority=http://localhost:8080/realms/kitcerto
Auth__Audience=kitcerto-api
```
