    # Infraestrutura (dev e prod-like)
Camada que **fala com o mundo externo**.

## Serviços
- MongoDB
- Mongo Express (opcional)
- Keycloak (dev e prod-like)
- Postgres (prod-like para Keycloak)

## Mongo local
Connection string: `mongodb://localhost:27017`

## .env
```
ASPNETCORE_URLS=http://localhost:5000
ConnectionStrings__Mongo=mongodb://localhost:27017
Mongo__DatabaseName=kitcerto
Auth__Authority=http://localhost:8080/realms/kitcerto
Auth__Audience=kitcerto-api
Auth__Realm=kitcerto
```

### Healthcheck (Compose)
- Mongo: prefira `mongosh --quiet --eval "quit(db.runCommand({ ping: 1 }).ok === 1 ? 0 : 1)"` com `start_period` para evitar falsos negativos.
- API: em dev, pode omitir; em orquestradores use probes HTTP.
- Keycloak: use `/health/ready` no orquestrador.

### Compose
- Dev: `docker-compose.dev.yml` (frontend + nginx)
- Prod-like: `infra/docker-compose.yml` (Keycloak + Postgres persistente)
