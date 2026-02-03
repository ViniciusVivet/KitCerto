# 🐳 Comandos Docker - KitCerto Dev

## 📋 Status e Informações

### Ver todos os containers rodando
```powershell
docker-compose -f docker-compose.dev.yml ps
```
**Para que serve:** Mostra status, portas, nomes e estado de todos os serviços

### Ver portas mapeadas de um serviço específico
```powershell
docker-compose -f docker-compose.dev.yml port frontend
docker-compose -f docker-compose.dev.yml port api
```
**Para que serve:** Mostra exatamente em qual porta local está mapeado (ex: `0.0.0.0:3000->3000/tcp`)

### Ver informações detalhadas de um container
```powershell
docker inspect kitcerto-frontend-dev
docker inspect kitcerto-api-dev
```
**Para que serve:** Mostra configurações completas, variáveis de ambiente, volumes, portas, etc.

---

## 🚀 Iniciar e Parar

### Subir todos os serviços
```powershell
docker-compose -f docker-compose.dev.yml up -d
```
**Para que serve:** Inicia todos os containers em background (`-d` = detached)

### Subir apenas um serviço específico
```powershell
docker-compose -f docker-compose.dev.yml up -d api
docker-compose -f docker-compose.dev.yml up -d frontend
```
**Para que serve:** Inicia só o que você precisa

### Parar todos os serviços
```powershell
docker-compose -f docker-compose.dev.yml stop
```
**Para que serve:** Para containers mas mantém dados (volumes)

### Parar apenas um serviço
```powershell
docker-compose -f docker-compose.dev.yml stop api
```
**Para que serve:** Para só a API, mantém resto rodando

### Parar e remover containers (mantém volumes)
```powershell
docker-compose -f docker-compose.dev.yml down
```
**Para que serve:** Remove containers mas mantém dados do MongoDB/Postgres

### Parar e remover TUDO (incluindo volumes - ⚠️ CUIDADO!)
```powershell
docker-compose -f docker-compose.dev.yml down -v
```
**Para que serve:** Limpa tudo, incluindo dados do banco (use com cuidado!)

---

## 🔄 Reiniciar

### Reiniciar um serviço específico
```powershell
docker-compose -f docker-compose.dev.yml restart api
docker-compose -f docker-compose.dev.yml restart frontend
```
**Para que serve:** Reinicia rápido quando mudou código (especialmente `Program.cs`)

### Reiniciar todos os serviços
```powershell
docker-compose -f docker-compose.dev.yml restart
```

---

## 📊 Logs

### Ver logs em tempo real de um serviço
```powershell
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f frontend
```
**Para que serve:** Acompanha erros e debug em tempo real (`-f` = follow)

### Ver últimas 100 linhas de log
```powershell
docker-compose -f docker-compose.dev.yml logs --tail=100 api
```

### Ver logs de todos os serviços
```powershell
docker-compose -f docker-compose.dev.yml logs -f
```

---

## 🔨 Rebuild

### Rebuild apenas um serviço (quando mudou Dockerfile ou dependências)
```powershell
docker-compose -f docker-compose.dev.yml up -d --build api
docker-compose -f docker-compose.dev.yml up -d --build frontend
```
**Para que serve:** Rebuilda a imagem quando mudou Dockerfile ou packages NuGet/npm

### Rebuild forçado (sem cache)
```powershell
docker-compose -f docker-compose.dev.yml build --no-cache api
docker-compose -f docker-compose.dev.yml up -d api
```
**Para que serve:** Força rebuild completo quando algo está muito errado

---

## 🐛 Debug e Execução

### Entrar dentro do container (shell interativo)
```powershell
docker exec -it kitcerto-api-dev bash
docker exec -it kitcerto-frontend-dev sh
```
**Para que serve:** Acessa o shell do container para debugar, rodar comandos, etc.

### Executar comando dentro do container sem entrar
```powershell
docker exec kitcerto-api-dev dotnet --version
docker exec kitcerto-frontend-dev npm --version
```
**Para que serve:** Roda comandos rápidos sem abrir shell

### Ver processos rodando dentro do container
```powershell
docker exec kitcerto-api-dev ps aux
```

---

## 🧹 Limpeza

### Ver imagens Docker
```powershell
docker images
```

### Remover imagens não usadas
```powershell
docker image prune
```

### Remover tudo não usado (containers, imagens, volumes, networks)
```powershell
docker system prune -a
```
**⚠️ CUIDADO:** Remove imagens não usadas também!

### Ver uso de espaço
```powershell
docker system df
```

---

## 🔍 Troubleshooting

### Ver se porta está em uso
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```
**Para que serve:** Descobre se algo está usando a porta antes do Docker

### Ver recursos do container (CPU, memória)
```powershell
docker stats kitcerto-api-dev
docker stats kitcerto-frontend-dev
```

### Ver variáveis de ambiente do container
```powershell
docker exec kitcerto-api-dev env
```

### Testar conectividade entre containers
```powershell
docker exec kitcerto-api-dev ping mongo
docker exec kitcerto-api-dev ping keycloak
```

---

## 📝 Comandos Úteis Combinados

### Ver logs e status ao mesmo tempo
```powershell
docker-compose -f docker-compose.dev.yml ps && docker-compose -f docker-compose.dev.yml logs --tail=50 api
```

### Reiniciar e ver logs
```powershell
docker-compose -f docker-compose.dev.yml restart api && docker-compose -f docker-compose.dev.yml logs -f api
```

### Limpar e subir tudo do zero
```powershell
docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml up -d
```

---

## 🎯 Respostas Rápidas

**"Em que porta está o frontend?"**
```powershell
docker-compose -f docker-compose.dev.yml port frontend
# ou
docker-compose -f docker-compose.dev.yml ps frontend
```

**"A API está rodando?"**
```powershell
docker-compose -f docker-compose.dev.yml ps api
```

**"Por que a API não está funcionando?"**
```powershell
docker-compose -f docker-compose.dev.yml logs --tail=100 api
```

**"Mudei o código, preciso rebuildar?"**
- Se mudou código C#/TypeScript: **NÃO**, só reinicie (`restart`)
- Se mudou Dockerfile ou packages: **SIM**, use `--build`

**"Como limpar tudo e começar do zero?"**
```powershell
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📌 Portas Padrão do Projeto

- **Frontend:** `http://localhost:3000`
- **API:** `http://localhost:5000`
- **MongoDB:** `localhost:27017`
- **Keycloak:** `http://localhost:8080`
- **Mongo Express (se usar):** `http://localhost:8081`

---

## 💡 Dica Pro

Crie aliases no PowerShell para comandos frequentes:
```powershell
# Adicione no seu perfil PowerShell ($PROFILE)
function dcup { docker-compose -f docker-compose.dev.yml up -d }
function dcdown { docker-compose -f docker-compose.dev.yml down }
function dclogs { docker-compose -f docker-compose.dev.yml logs -f $args }
function dcps { docker-compose -f docker-compose.dev.yml ps }
```

Depois use: `dcup`, `dcdown`, `dclogs api`, `dcps`
