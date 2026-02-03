# 🚨 Problemas Conhecidos - KitCerto

Este documento lista todos os problemas identificados no projeto KitCerto, organizados por prioridade e categoria. Para versão em checklist (checkboxes), use [Checklist de problemas](problems.md).

## 🔴 CRÍTICOS (Corrigir IMEDIATAMENTE)

### 🔐 Segurança
1. **JWT sem validação de audience**
   - **Arquivo**: `backend/KitCerto.API/Program.cs:93`
   - **Problema**: `ValidateAudience = false`
   - **Risco**: Tokens inválidos podem ser aceitos
   - **Solução**: Habilitar validação de audience

2. **HTTPS desabilitado**
   - **Arquivo**: `backend/KitCerto.API/Program.cs:79`
   - **Problema**: `RequireHttpsMetadata = false`
   - **Risco**: Comunicação não criptografada
   - **Solução**: Habilitar HTTPS em produção

3. **CORS permissivo**
   - **Arquivo**: `backend/KitCerto.API/Program.cs:43`
   - **Problema**: Fallback para `AllowAnyOrigin()`
   - **Risco**: Ataques CSRF
   - **Solução**: Configurar origens específicas

4. **Senhas hardcoded**
   - **Arquivo**: `README.md:96,109`
   - **Problema**: `Admin@123` exposta publicamente
   - **Risco**: Acesso não autorizado
   - **Solução**: Usar variáveis de ambiente

### ⚡ Performance
5. **Dashboard ineficiente**
   - **Arquivo**: `backend/KitCerto.Application/Dashboard/Overview/DashboardOverviewHandler.cs:30`
   - **Problema**: Carrega 1000 categorias de uma vez
   - **Impacto**: Performance ruim com muitos dados
   - **Solução**: Implementar paginação ou cache

6. **Sem sistema de cache**
   - **Problema**: Nenhum cache implementado
   - **Impacto**: Consultas repetitivas ao banco
   - **Solução**: Implementar Redis ou cache em memória

7. **Rate limiting básico**
   - **Arquivo**: `backend/KitCerto.API/Program.cs:53`
   - **Problema**: Apenas 100 req/min para todos os endpoints
   - **Impacto**: Não diferencia endpoints críticos
   - **Solução**: Rate limiting por endpoint

### 🏗️ Arquitetura
8. **Dependência circular**
   - **Problema**: Frontend → API → Keycloak
   - **Impacto**: Falhas em cascata
   - **Solução**: Implementar circuit breaker

9. **Tratamento de erro insuficiente**
   - **Problema**: Apenas ProblemDetails básico
   - **Impacto**: Erros não tratados adequadamente
   - **Solução**: Middleware global de tratamento de erro

10. **Logs insuficientes**
    - **Problema**: Apenas Serilog no console
    - **Impacto**: Dificuldade para debug em produção
    - **Solução**: Logs estruturados com níveis

## 🟡 MÉDIOS (Corrigir em BREVE)

### 📚 Documentação
11. **README desatualizado**
    - **Problema**: Menciona "mock-first" mas usa API
    - **Impacto**: Confusão para desenvolvedores
    - **Solução**: Atualizar documentação

12. **Instruções conflitantes**
    - **Problema**: Diferentes formas de configurar Auth
    - **Impacto**: Configuração incorreta
    - **Solução**: Padronizar instruções

13. **Status incorreto**
    - **Problema**: "100% COMPLETO" quando há problemas
    - **Impacto**: Expectativas incorretas
    - **Solução**: Status realista

### 🐳 Docker
14. **Healthchecks inadequados**
    - **Problema**: Nginx healthcheck pode falhar
    - **Impacto**: Containers marcados como unhealthy
    - **Solução**: Melhorar healthchecks

15. **Volumes não persistentes**
    - **Problema**: Dados podem ser perdidos
    - **Impacto**: Perda de dados
    - **Solução**: Configurar volumes persistentes

16. **Dockerfiles não otimizados**
    - **Problema**: Sem multi-stage build
    - **Impacto**: Imagens grandes
    - **Solução**: Implementar multi-stage build

### 🎨 Frontend
17. **Sem error boundaries**
    - **Problema**: Falhas podem quebrar a aplicação
    - **Impacto**: UX ruim
    - **Solução**: Implementar error boundaries

18. **Loading states básicos**
    - **Problema**: Apenas skeleton loading
    - **Impacto**: UX básica
    - **Solução**: Melhorar loading states

19. **Sem otimização de bundle**
    - **Problema**: Next.js não configurado para otimização
    - **Impacto**: Bundle grande
    - **Solução**: Configurar otimizações

## 🟢 MENORES (Corrigir quando possível)

### 💻 Código e Estrutura
20. **Comentários em português**
    - **Problema**: Mistura de idiomas no código
    - **Impacto**: Inconsistência
    - **Solução**: Padronizar idioma

21. **Nomes inconsistentes**
    - **Problema**: `kitcerto-api` vs `KitCerto.API`
    - **Impacto**: Confusão
    - **Solução**: Padronizar nomenclatura

22. **Arquivos desnecessários**
    - **Problema**: `build-log.txt`, `tree-backend.txt`
    - **Impacto**: Repositório poluído
    - **Solução**: Remover arquivos desnecessários

### 🛠️ Desenvolvimento
23. **Sem hot reload**
    - **Problema**: Frontend não configurado para hot reload
    - **Impacto**: Desenvolvimento lento
    - **Solução**: Configurar hot reload

24. **Sem debug configurado**
    - **Problema**: VS Code não configurado
    - **Impacto**: Debug difícil
    - **Solução**: Configurar debug

25. **Sem scripts de automação**
    - **Problema**: Sem scripts para setup automático
    - **Impacto**: Setup manual
    - **Solução**: Criar scripts de automação

## 📊 Resumo
- **Críticos**: 10 problemas
- **Médios**: 9 problemas
- **Menores**: 6 problemas
- **TOTAL**: 25 problemas

## 🎯 Plano de Ação
1. **Semana 1**: Corrigir problemas críticos de segurança
2. **Semana 2**: Corrigir problemas de performance
3. **Semana 3**: Corrigir problemas de arquitetura
4. **Semana 4**: Corrigir problemas médios
5. **Semana 5**: Corrigir problemas menores

## 📝 Como Contribuir
1. Escolha um problema da lista
2. Crie uma branch para a correção
3. Implemente a solução
4. Teste a correção
5. Abra um Pull Request
6. Marque o problema como resolvido na checklist
