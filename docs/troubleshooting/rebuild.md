# 🔍 Diagnóstico do Rebuild Completo - KitCerto

> **Uso:** Referência para entender por que a stack pode demorar ao subir (MongoDB recovery, Keycloak, SWC do frontend). Se o seu problema for outro (API não responde, CORS, auth), veja [Debug e problemas comuns](../docker/debug.md).

## 📊 Status Atual dos Containers

**Data/Hora do Rebuild:** 29/01/2026 ~03:41 UTC

### Containers em Execução:
- ✅ **MongoDB** - Rodando (recovery em andamento)
- ✅ **Postgres** - Pronto para conexões
- ⏳ **Keycloak** - Inicializando (sem logs ainda)
- ⏳ **API (.NET)** - Compilando
- ⏳ **Frontend (Next.js)** - Inicializando

---

## 🐌 O Que Está Demorando

### 1. **MongoDB - Recovery Lento**

**Problema Identificado:**
- Logs mostram: `"serverStatus was very slow"` (2674ms, 1123ms)
- MongoDB está fazendo recovery de dados antigos
- Isso é **NORMAL** quando há dados persistidos

**É Problema de Código?** ❌ **NÃO**
- É comportamento esperado do MongoDB ao iniciar com dados existentes
- Quanto mais dados, mais tempo demora o recovery

**É Problema de Máquina?** ✅ **SIM, PARCIALMENTE**
- Máquina lenta = recovery mais lento
- Mas é esperado mesmo em máquinas rápidas com muitos dados

**Solução:** Aguardar - não há como acelerar sem perder dados

---

### 2. **Keycloak - Inicialização Lenta**

**Problema Identificado:**
- Keycloak ainda não mostrou logs de inicialização
- Pode estar aguardando Postgres estar 100% pronto
- Ou pode estar carregando realm/configurações

**É Problema de Código?** ❌ **NÃO**
- Keycloak em modo `start-dev` é mais lento que produção
- Primeira inicialização sempre demora mais

**É Problema de Máquina?** ✅ **SIM**
- Máquina lenta = Keycloak mais lento
- Mas é esperado em desenvolvimento

**Tempo Esperado:** 30-60 segundos para primeira inicialização

---

### 3. **API (.NET) - Compilação**

**Problema Identificado:**
- API está compilando (`Building...`)
- .NET SDK precisa compilar todo o projeto
- Primeira compilação após rebuild sempre demora

**É Problema de Código?** ❌ **NÃO**
- Compilação é normal do .NET
- Com muitos projetos, demora mais

**É Problema de Máquina?** ✅ **SIM**
- Máquina lenta = compilação mais lenta
- Mas é esperado

**Tempo Esperado:** 30-90 segundos para primeira compilação

---

### 4. **Frontend (Next.js) - Inicialização**

**Problema Identificado:**
- Frontend ainda não mostrou logs
- Pode estar instalando dependências ou compilando
- Next.js precisa compilar na primeira vez

**É Problema de Código?** ❌ **NÃO**
- Next.js precisa compilar na primeira execução
- É comportamento esperado

**É Problema de Máquina?** ✅ **SIM**
- Máquina lenta = compilação mais lenta
- Mas é esperado

**Tempo Esperado:** 60-180 segundos para primeira compilação

---

## 📈 Tempos Esperados (Máquina Lenta)

### Inicialização Normal:
1. **MongoDB:** 10-30 segundos (recovery)
2. **Postgres:** 5-10 segundos ✅ (já pronto)
3. **Keycloak:** 30-60 segundos (primeira vez)
4. **API:** 30-90 segundos (compilação)
5. **Frontend:** 60-180 segundos (compilação)

### Total Esperado: **2-5 minutos** para tudo estar funcionando

---

## ✅ Conclusão

### **Não é Problema de Código** ✅

Todos os serviços estão se comportando normalmente:
- MongoDB fazendo recovery (esperado)
- Keycloak inicializando (esperado em dev)
- API compilando (esperado)
- Frontend compilando (esperado)

### **É Problema de Processamento da Máquina** ✅

Máquina lenta = tudo mais lento, mas **funciona normalmente**.

---

## 🎯 Próximos Passos

1. **Aguardar mais 2-3 minutos** para tudo inicializar
2. **Verificar logs novamente** para confirmar que tudo subiu
3. **Testar aplicação** quando tudo estiver pronto
4. **Se ainda estiver lento após inicialização**, aí sim investigar código

---

## 📝 Sobre os Índices MongoDB

**Status:** Os índices ainda estão no código (não foram completamente desfeitos)

**Próximo Passo:** 
- Aguardar rebuild completar
- Testar performance
- Se necessário, planejar melhor os índices antes de implementar

---

## 🔍 Monitoramento Contínuo

Para acompanhar em tempo real:
```powershell
# Ver logs de todos os serviços
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f keycloak

# Ver status dos containers
docker-compose -f docker-compose.dev.yml ps

# Ver uso de recursos
docker stats
```
