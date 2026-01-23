# 🔧 Instruções de Debug - KitCerto

## 🚀 Como rodar o projeto

1. **Inicie o Docker Desktop** (necessário para rodar os containers)

2. **Copie o arquivo de ambiente**:
   ```bash
   cp .env.example .env
   ```

3. **Suba todos os serviços**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

4. **Acesse a aplicação**:
   - Frontend: http://localhost (via Nginx)
   - API: http://localhost:5000 (direto)
   - Swagger: http://localhost:5000/swagger
   - Keycloak: http://localhost:8080
   - Mongo Express: http://localhost:8081

## 🔍 Problemas Comuns e Soluções

### 1. **Frontend não consegue conectar com a API**

**Sintomas**: Erro 404 ou CORS no console do navegador

**Verificações**:
```bash
# Verificar se todos os containers estão rodando
docker compose -f docker-compose.dev.yml ps

# Verificar logs da API
docker compose -f docker-compose.dev.yml logs api

# Verificar logs do Nginx
docker compose -f docker-compose.dev.yml logs nginx

# Testar API diretamente
curl http://localhost:5000/api/auth/ping
```

**Soluções**:
- Se API não estiver rodando: `docker compose -f docker-compose.dev.yml restart api`
- Se Nginx não estiver funcionando: `docker compose -f docker-compose.dev.yml restart nginx`
- Verificar se a URL da API está correta: `NEXT_PUBLIC_API_BASE_URL=/api`

### 2. **Problemas de Autenticação**

**Sintomas**: Erro 401 ou redirecionamento infinito

**Verificações**:
```bash
# Verificar se Keycloak está rodando
curl http://localhost:8080/realms/kitcerto/.well-known/openid-configuration

# Verificar logs do Keycloak
docker compose -f docker-compose.dev.yml logs keycloak
```

**Soluções**:
- Usuários de teste:
  - admin@kitcerto.dev / Admin@123 (role: admin)
  - joao@kitcerto.dev / User@123 (role: user)
- Verificar se as URLs de redirect estão corretas no Keycloak

### 3. **Problemas de CORS**

**Sintomas**: Erro CORS no console do navegador

**Soluções**:
- Verificar configuração CORS no `backend/KitCerto.API/appsettings.Docker.json`
- Verificar se o frontend está acessando via http://localhost (não localhost:3000)

### 4. **Dados não aparecem no Dashboard**

**Sintomas**: Dashboard vazio ou com dados mock

**Verificações**:
```bash
# Verificar se MongoDB tem dados
docker compose -f docker-compose.dev.yml exec mongo mongosh kitcerto --eval "db.products.countDocuments()"

# Verificar logs da API para erros
docker compose -f docker-compose.dev.yml logs api | grep -i error
```

**Soluções**:
- Executar scripts de seed se necessário
- Verificar se a API está retornando dados em http://localhost:5000/api/dashboard/overview

## 🛠️ Comandos Úteis

```bash
# Reiniciar todos os serviços
docker compose -f docker-compose.dev.yml restart

# Ver logs em tempo real
docker compose -f docker-compose.dev.yml logs -f

# Limpar tudo e recomeçar
docker compose -f docker-compose.dev.yml down --volumes
docker compose -f docker-compose.dev.yml up -d --build

# Acessar container da API para debug
docker compose -f docker-compose.dev.yml exec api bash

# Acessar MongoDB
docker compose -f docker-compose.dev.yml exec mongo mongosh kitcerto
```

## 📊 Status dos Problemas Corrigidos

✅ **Correções Implementadas**:
- Validação de audience habilitada no JWT
- RequireHttpsMetadata configurado corretamente
- CORS corrigido com AllowAnyOrigin em desenvolvimento
- Tratamento de erro 401 com redirecionamento automático
- Fallback inteligente API → mocks em caso de erro
- Melhor tratamento de tokens expirados no Keycloak
- Logs de erro mais detalhados

⚠️ **Ainda pendente**:
- Otimização de performance do dashboard
- Implementação de cache
- Error boundaries no frontend
- Logs estruturados

## 🎯 Próximos Passos

1. Testar a aplicação com as correções implementadas
2. Verificar se o frontend consegue consumir a API
3. Testar autenticação e autorização
4. Implementar melhorias de performance
5. Adicionar monitoramento e logs
