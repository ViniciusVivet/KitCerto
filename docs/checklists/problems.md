# 🔧 Checklist de Problemas - KitCerto

> Para descrição detalhada de cada item (arquivo, solução sugerida), veja [Problemas conhecidos (detalhado)](known-issues.md).

## 🚨 PROBLEMAS CRÍTICOS (Prioridade ALTA)

### 🔐 Segurança
- [ ] **JWT sem validação de audience** - `ValidateAudience = false` no Program.cs
- [ ] **HTTPS desabilitado** - `RequireHttpsMetadata = false` 
- [ ] **CORS permissivo** - Fallback para `AllowAnyOrigin()` em produção
- [ ] **Senhas hardcoded** - `Admin@123` exposta no README

### ⚡ Performance
- [ ] **Dashboard ineficiente** - Carrega 1000 categorias de uma vez
- [ ] **Sem cache** - Nenhum sistema de cache implementado
- [ ] **Rate limiting básico** - Apenas 100 req/min sem diferenciação

### 🏗️ Arquitetura
- [ ] **Dependência circular** - Frontend → API → Keycloak
- [ ] **Sem tratamento de erro global** - Apenas ProblemDetails básico
- [ ] **Logs insuficientes** - Apenas Serilog no console

### ⚙️ Configuração
- [ ] **Múltiplas configurações conflitantes** - env.example vs appsettings
- [ ] **CORS mal configurado** - Configurações inconsistentes
- [ ] **URLs inconsistentes** - Diferentes portas em diferentes docs

## ⚠️ PROBLEMAS MÉDIOS (Prioridade MÉDIA)

### 📚 Documentação
- [ ] **README desatualizado** - Menciona "mock-first" mas usa API
- [ ] **Instruções conflitantes** - Diferentes formas de configurar Auth
- [ ] **Status incorreto** - "100% COMPLETO" quando há problemas

### 🐳 Docker
- [ ] **Healthchecks inadequados** - Nginx healthcheck pode falhar
- [ ] **Volumes não persistentes** - Dados podem ser perdidos
- [ ] **Sem otimização de build** - Dockerfiles não usam multi-stage

### 🎨 Frontend
- [ ] **Sem error boundaries** - Falhas podem quebrar a aplicação
- [ ] **Loading states básicos** - Apenas skeleton loading
- [ ] **Sem otimização de bundle** - Next.js não configurado

## 🔧 PROBLEMAS MENORES (Prioridade BAIXA)

### 💻 Código e Estrutura
- [ ] **Comentários em português** - Mistura de idiomas no código
- [ ] **Nomes inconsistentes** - `kitcerto-api` vs `KitCerto.API`
- [ ] **Arquivos desnecessários** - `build-log.txt`, `tree-backend.txt`

### 🛠️ Desenvolvimento
- [ ] **Sem hot reload** - Frontend não configurado para hot reload
- [ ] **Sem debug configurado** - VS Code não configurado
- [ ] **Sem scripts de automação** - Sem scripts para setup automático

---

## 📊 Resumo
- **Críticos**: 14 problemas
- **Médios**: 13 problemas  
- **Menores**: 9 problemas
- **TOTAL**: 36 problemas

## 🎯 Ordem de Correção Sugerida
1. **Segurança** (4 críticos)
2. **Performance** (3 críticos)
3. **Configuração** (3 críticos)
4. **Documentação** (3 médios)
5. **Docker** (3 médios)
6. **Frontend** (3 médios)
7. **Código** (9 menores)
