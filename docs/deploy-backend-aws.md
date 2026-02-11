# Deploy do backend KitCerto na AWS (EC2 + Keycloak)

Frontend fica na **Vercel**; backend (API + Keycloak + Mongo + Postgres) sobe em um **EC2** com Docker.

---

## 1. AWS – o que fazer no console

### 1.1 EC2

- **Opção A – Novo EC2 (recomendado para testar):**
  - **Launch instance**: Amazon Linux 2023 ou Ubuntu 22.04.
  - **Tipo**: `t3.micro` ou `t3.small` (1 vCPU, 1–2 GB RAM).
  - **Storage**: 20–30 GB.
  - **Security group**: libere:
    - **22** (SSH) – seu IP.
    - **80** (HTTP) – 0.0.0.0/0 (para acesso à API e Keycloak).
    - **443** (HTTPS) – 0.0.0.0/0 (quando ativar SSL).

- **Opção B – Usar o mesmo EC2 do Orbitamos:**
  - Use o mesmo servidor; o KitCerto pode rodar em outra pasta com outro `docker-compose` (ex.: `/home/ubuntu/kitcerto`).
  - No nginx desse servidor você adiciona dois `server` (ou locations) para `api.seudominio.com` e `auth.seudominio.com` (veja seção 4).

- **Elastic IP** (opcional): associe um IP fixo ao EC2 para apontar o DNS e não perder o IP ao reiniciar.

### 1.2 S3 (opcional)

- Se quiser armazenar uploads na AWS: crie um bucket (ex.: `kitcerto-uploads`), configure permissões (público de leitura se for exibir imagens direto do S3) e anote região e nome do bucket para o `.env`.

### 1.3 DNS (Route 53 ou seu registrador)

- Crie dois registros apontando para o IP do EC2 (ou do Elastic IP):
  - **api.seudominio.com** → A → IP do EC2
  - **auth.seudominio.com** → A → IP do EC2  

Substitua `seudominio.com` pelo domínio real (ex.: `kitcerto.com.br`).

---

## 2. No servidor (EC2) – preparar ambiente

Conecte por SSH e instale Docker + Docker Compose (se ainda não tiver):

```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER
# Instalar Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
# Saia e entre de novo no SSH para o grupo docker valer
```

Clone o repositório e entre na pasta de infra:

```bash
git clone https://github.com/ViniciusVivet/KitCerto.git
cd KitCerto/infra
```

---

## 3. Configurar Nginx e variáveis de ambiente

### 3.1 Nginx (produção)

Edite `nginx/default.prod.conf` e troque **`seudominio.com`** pelo seu domínio nos dois `server_name`:

- `server_name api.seudominio.com;`
- `server_name auth.seudominio.com;`

### 3.2 Arquivo `.env`

Copie o exemplo e preencha:

```bash
cp .env.example.prod .env
nano .env   # ou vim
```

Defina pelo menos:

- `KEYCLOAK_PUBLIC_URL=https://auth.seudominio.com` (domínio real, sem barra no final).
- `FRONTEND_URL=https://kit-certo.vercel.app` (ou a URL que a Vercel der).
- URLs do Mercado Pago (`MP_SUCCESS_URL`, etc.) apontando para o frontend na Vercel.
- Se usar S3: bucket, região e credenciais AWS.

---

## 4. Keycloak – o que fazer no console

Depois que o backend subir, o Keycloak estará em **https://auth.seudominio.com** (ou http até configurar SSL).

1. Acesse **https://auth.seudominio.com** (ou http).
2. Login **admin** / senha que você colocou em `KEYCLOAK_ADMIN_PASSWORD` no `.env`.
3. Selecione o realm **kitcerto**.
4. Vá em **Clients** → **kitcerto-frontend**.
5. Em **Settings**:
   - **Valid redirect URIs**: adicione as URLs do frontend em produção, por exemplo:
     - `https://kit-certo.vercel.app/*`
     - `https://seudominio.com/*` (se tiver domínio próprio no frontend)
   - **Web origins**: adicione (uma por linha ou separadas):
     - `https://kit-certo.vercel.app`
     - `https://seudominio.com`
6. Salve.

Isso evita erro de “redirect URI inválido” quando o usuário fizer login no app na Vercel.

---

## 5. Subir o backend

Na pasta `KitCerto/infra`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Verifique se os containers estão rodando:

```bash
docker compose -f docker-compose.prod.yml ps
```

Teste:

- **API**: `https://api.seudominio.com/health` ou `https://api.seudominio.com/swagger` (se tiver).
- **Keycloak**: `https://auth.seudominio.com` (página de login do realm).

---

## 6. Frontend na Vercel – variáveis de ambiente

No projeto da Vercel, configure:

- `NEXT_PUBLIC_API_BASE_URL` = `https://api.seudominio.com`
- `NEXT_PUBLIC_KEYCLOAK_URL` = `https://auth.seudominio.com`
- `NEXT_PUBLIC_KEYCLOAK_REALM` = `kitcerto`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` = `kitcerto-frontend`

Faça um novo deploy para aplicar.

---

## 7. HTTPS (recomendado)

Com domínio próprio, use **Let’s Encrypt** no EC2:

1. Instale **certbot** e gere os certificados para `api.seudominio.com` e `auth.seudominio.com`.
2. Ajuste o nginx para escutar 443 e usar os certificados; ou use um proxy reverso (ex.: Caddy) na frente do nginx.
3. Atualize `KEYCLOAK_PUBLIC_URL` e as URLs do frontend para `https://`.

Alternativa: coloque um **Application Load Balancer (ALB)** na frente do EC2 e use certificados no **AWS Certificate Manager (ACM)**; aí o ALB faz HTTPS e repassa HTTP para o EC2 na porta 80.

---

## Resumo rápido

| Onde | O que fazer |
|------|-------------|
| **AWS** | EC2 (ou reutilizar), Security Group 22/80/443, (opcional) S3, DNS api.* e auth.* |
| **EC2** | Docker + Compose, clone do repo, editar `default.prod.conf` e `.env`, `docker compose -f docker-compose.prod.yml --env-file .env up -d` |
| **Keycloak** | Login admin → realm kitcerto → Client kitcerto-frontend → Valid redirect URIs e Web origins com a URL da Vercel |
| **Vercel** | Variáveis de ambiente com URL da API e do Keycloak, redeploy |

Se quiser, na próxima etapa dá para detalhar só a parte do Keycloak (print por print) ou só a parte do EC2 (comando por comando).
