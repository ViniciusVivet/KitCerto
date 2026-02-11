# 🚀 Guia de Deploy - KitCerto Backend na AWS EC2

## Pré-requisitos

- ✅ Instância EC2 criada e rodando
- ✅ Security Group configurado (HTTP 80, HTTPS 443, SSH 22)
- ✅ IP público da instância: `3.134.117.18` (exemplo)

---

## Passo 1: Conectar na EC2 via SSH

### No Windows (PowerShell ou Git Bash):

```bash
# Baixe a chave .pem que você criou ao lançar a instância
# Conecte usando:
ssh -i "caminho/para/sua-chave.pem" ubuntu@3.134.117.18
```

**OU** use o botão "Conectar" no console AWS que gera o comando automaticamente.

---

## Passo 2: Instalar Docker e Docker Compose

Na instância EC2, execute:

```bash
# Baixar e executar o script de setup
curl -fsSL https://raw.githubusercontent.com/ViniciusVivet/KitCerto/main/infra/setup-ec2.sh | bash

# OU execute manualmente:
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER

# Faça logout e login novamente (ou execute):
newgrp docker
```

---

## Passo 3: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/ViniciusVivet/KitCerto.git
cd KitCerto/infra
```

---

## Passo 4: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo de .env
cp .env.example .env

# Editar o .env com seus valores
nano .env
```

**Importante:** Preencha pelo menos:
- `KEYCLOAK_PUBLIC_URL` → URL pública do Keycloak (ex: `http://auth.seudominio.com` ou `http://3.134.117.18`)
- `FRONTEND_URL` → URL do frontend na Vercel (ex: `https://kit-certo.vercel.app`)
- `KEYCLOAK_ADMIN_PASSWORD` → Senha segura para admin do Keycloak

---

## Passo 5: Ajustar Nginx (se necessário)

Se você **não tem domínio** ainda, edite `nginx/default.prod.conf`:

```bash
nano nginx/default.prod.conf
```

Substitua `api.seudominio.com` e `auth.seudominio.com` pelo IP público da instância ou remova os `server_name` para aceitar qualquer host.

**OU** use uma versão simplificada que aceita qualquer host:

```nginx
server {
  listen 80;
  server_name _;
  
  # API
  location /api/ {
    proxy_pass http://api:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  
  # Keycloak
  location /auth/ {
    proxy_pass http://keycloak:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Passo 6: Subir os Containers

```bash
# Build e start de todos os serviços
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Ver status
docker compose -f docker-compose.prod.yml ps
```

---

## Passo 7: Verificar se Está Funcionando

```bash
# Testar API
curl http://localhost/api/health

# Testar Keycloak
curl http://localhost/auth/realms/kitcerto
```

Do seu computador, teste:
- `http://3.134.117.18/api/` → Deve retornar JSON da API
- `http://3.134.117.18/auth/` → Deve mostrar página do Keycloak

---

## Passo 8: Configurar DNS (Opcional)

Se você tem um domínio:

1. **No seu provedor de DNS** (ex: Registro.br, Cloudflare):
   - Crie registro A: `api.seudominio.com` → `3.134.117.18`
   - Crie registro A: `auth.seudominio.com` → `3.134.117.18`

2. **Atualize o `.env`** com as URLs reais:
   ```
   KEYCLOAK_PUBLIC_URL=http://auth.seudominio.com
   FRONTEND_URL=https://seu-app.vercel.app
   ```

3. **Reinicie os containers**:
   ```bash
   docker compose -f docker-compose.prod.yml restart keycloak api
   ```

---

## Passo 9: Configurar Keycloak para Aceitar Frontend Vercel

1. Acesse: `http://3.134.117.18/auth/` (ou sua URL de Keycloak)
2. Login: `admin` / senha que você definiu no `.env`
3. Vá em **Clients** → `kitcerto-frontend`
4. Em **Valid redirect URIs**, adicione:
   - `https://seu-app.vercel.app/*`
   - `https://*.vercel.app/*` (para previews)
5. Em **Web origins**, adicione:
   - `https://seu-app.vercel.app`
6. Salve

---

## Passo 10: Atualizar Variáveis no Vercel

No dashboard da Vercel, adicione/atualize:

- `NEXT_PUBLIC_API_BASE_URL` → `http://3.134.117.18/api` (ou `https://api.seudominio.com/api` se tiver domínio)
- `NEXT_PUBLIC_KEYCLOAK_URL` → `http://3.134.117.18/auth` (ou `https://auth.seudominio.com`)
- `NEXT_PUBLIC_KEYCLOAK_REALM` → `kitcerto`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` → `kitcerto-frontend`

---

## Comandos Úteis

```bash
# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f api

# Reiniciar um serviço
docker compose -f docker-compose.prod.yml restart api

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker compose -f docker-compose.prod.yml down -v

# Atualizar código (após git pull)
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

### Porta 80 já em uso?
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # se houver Apache
```

### Containers não sobem?
```bash
docker compose -f docker-compose.prod.yml logs
```

### MongoDB não conecta?
Verifique se o container `mongo` está healthy:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## Próximos Passos

- [ ] Configurar SSL/HTTPS com Let's Encrypt (certbot)
- [ ] Configurar S3 para uploads de arquivos
- [ ] Configurar backup automático do MongoDB
- [ ] Monitoramento (CloudWatch ou similar)
