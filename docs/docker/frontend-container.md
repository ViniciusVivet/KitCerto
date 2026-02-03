# 🔍 Panorama Completo - Problema do Frontend

## 📊 O Que Está Acontecendo?

### Situação Atual:
- ✅ **Container está rodando** (não quebrou)
- ✅ **Processos Next.js estão ativos** (npm, node, next-server)
- ⚠️ **Download travado** tentando baixar `@next/swc-linux-x64-gnu` (~130MB)
- ⚠️ **Conexão interrompida** após ~27MB baixados (20% do download)

### Por Que Está Demorando?
O Next.js precisa baixar um compilador nativo (SWC) específico para Linux quando roda no Docker. Esse pacote tem ~130MB e está sendo baixado do npm registry durante a primeira inicialização.

---

## 🎯 Como Acompanhar em Tempo Real

### 1. Ver logs em tempo real (melhor opção)
```powershell
docker-compose -f docker-compose.dev.yml logs -f frontend
```
**O que você vai ver:**
- `Downloading swc package @next/swc-linux-x64-gnu...` = ainda baixando
- `Ready` ou `compiled` = funcionando!
- `SocketError` ou `timeout` = problema de rede

### 2. Monitorar uso de rede do container
```powershell
docker stats kitcerto-frontend-dev
```
**O que observar:**
- Se `NET I/O` está aumentando = download ativo
- Se `NET I/O` parou = download travado

### 3. Ver processos rodando
```powershell
docker exec kitcerto-frontend-dev ps aux
```
**O que você vai ver:**
- `npm run dev` = processo principal
- `next-server` = servidor Next.js
- Se algum processo sumir = quebrou

### 4. Verificar se o pacote foi baixado
```powershell
docker exec kitcerto-frontend-dev ls -lh /app/node_modules/@next/swc-linux-x64-gnu
```
**O que significa:**
- Arquivo existe com tamanho ~130MB = download completo ✅
- Arquivo não existe ou pequeno = download incompleto ❌

---

## ⏱️ Sobre Timeouts do Docker

### Timeouts que Podem Afetar:

1. **Timeout de Rede do Node.js**
   - Padrão: ~2 minutos
   - Problema: Download de 130MB pode demorar mais

2. **Timeout do Docker**
   - Não há timeout padrão para downloads
   - Mas conexões podem ser interrompidas por:
     - Proxy corporativo
     - Firewall
     - Conexão instável
     - Servidor npm sobrecarregado

3. **Timeout do Next.js**
   - Next.js tem timeout interno para downloads
   - Pode ser aumentado com variáveis de ambiente

---

## 🔧 Soluções Práticas

### Solução 1: Instalar o Pacote Localmente (RECOMENDADO)

**Por que funciona:** O pacote fica no seu `node_modules` local e o Docker usa via volume.

```powershell
# 1. No terminal local (não Docker)
cd frontend
npm install @next/swc-linux-x64-gnu --save-optional --no-audit

# 2. Aguarde o download completar (pode demorar 2-5 minutos)

# 3. Reinicie o Docker
cd ..
docker-compose -f docker-compose.dev.yml restart frontend
```

### Solução 2: Aumentar Timeout do Node.js

Modifique o `docker-compose.dev.yml`:

```yaml
command: sh -c "NODE_OPTIONS='--max-old-space-size=4096' npm run dev"
```

### Solução 3: Usar Registry Alternativo (se npm estiver lento)

```yaml
environment:
  - NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
```

### Solução 4: Baixar Manualmente e Copiar

```powershell
# 1. Baixar o pacote manualmente
cd frontend
npm pack @next/swc-linux-x64-gnu

# 2. Instalar do arquivo local
npm install ./next-swc-linux-x64-gnu-*.tgz --save-optional
```

---

## 🚨 Quando Se Preocupar?

### ✅ TUDO OK se:
- Container está rodando (`docker ps` mostra `Up`)
- Processos estão ativos (`ps aux` mostra next-server)
- Logs mostram "Downloading..." (ainda tentando)
- Uso de rede está aumentando (`docker stats`)

### ⚠️ PREOCUPE-SE se:
- Container para de rodar (`Status: Exited`)
- Logs mostram erro fatal (não só timeout)
- Processos desaparecem (`ps aux` não mostra next-server)
- Após 10+ minutos sem progresso no download

### ❌ QUEBROU se:
- Container não inicia mais
- Erros de permissão ou arquivo não encontrado
- Porta 3000 não responde após 5 minutos de "Ready"

---

## 📈 Status Atual do Seu Sistema

**Última verificação:**
- ✅ Container: Rodando
- ✅ Processos: Ativos (npm, node, next-server)
- ⚠️ Download: Travado (~27MB de 130MB)
- ⚠️ Rede: Baixa atividade (9.83kB/s)

**Diagnóstico:** Download interrompido, mas processo ainda tentando. Não quebrou, só está travado.

---

## 🎯 Próximos Passos Recomendados

1. **Tente a Solução 1** (instalar localmente) - mais confiável
2. **Se não funcionar**, aumente timeout (Solução 2)
3. **Se persistir**, pode ser problema de rede/proxy - considere rodar frontend localmente temporariamente

---

## 💡 Dica Final

O Next.js **vai funcionar** mesmo se o download falhar algumas vezes. Ele tenta novamente automaticamente. Mas instalar localmente é mais rápido e confiável.
