# Avaliação do Projeto KitCerto

Revisão crítica da organização, pontos fortes, lacunas para produção e melhorias imediatas.

---

## 1. Organização geral

### Pontos positivos

- **Backend:** Estrutura clara (Domain → Application → Infrastructure → API), CQRS/MediatR, responsabilidades bem separadas. Handlers por feature (Products, Orders, Support, Sellers, etc.) facilitam manutenção.
- **Frontend:** App Router do Next.js com rotas coerentes (`/dashboard`, `/meus-pedidos`, `/produto/[id]`). `components/`, `context/`, `lib/`, `services/` bem definidos; um serviço por domínio da API.
- **Documentação:** `docs/` com subpastas (getting-started, docker, backend, checklists, production, features, status, troubleshooting) e índice em `docs/README.md`. README da raiz direciona para a doc.
- **Infra:** `docker-compose.dev.yml` sobe stack completa (Mongo, Postgres, Keycloak, API, Frontend, Nginx). `env.example` documenta variáveis.

### Pontos fracos

- **Arquivos de apoio na raiz de pastas:** No backend: `build-log.txt`, `tree-backend.txt`, `nuget-packages.txt`, `proj-refs.txt` (úteis para debug local, mas poluem o repositório). No frontend: `fix_cats.js`, `fix_products_ids.js`, `fix_products_ids2.js`, `seed.js`, `seed-test.js`, `seed_fixed.js` (scripts pontuais que poderiam estar em `scripts/` ou fora do versionamento).
- **Handlers da API em dois lugares:** Parte dos handlers (ListProducts, UpdateProduct, Delete, Stock) está em `KitCerto.API/Products/...` e parte em `KitCerto.Application`. Funciona, mas quebra um pouco a consistência “toda lógica na Application”.

---

## 2. O que está bem feito

- **Escopo funcional:** E-commerce com catálogo, carrinho, checkout (Mercado Pago), pedidos, webhook, cupom, endereço (CEP), frete por settings, área do cliente (pedidos, endereços, pagamentos, dados pessoais, suporte), dashboard admin completo e **área do vendedor** (Meus produtos, Pedidos, Chamados) no mesmo dashboard.
- **Autenticação e autorização:** Keycloak (OIDC/JWT), roles (admin/user), seller identificado por `GET /sellers/me`. `RequireHttpsMetadata` e `ValidateAudience` condicionados ao ambiente (dev vs prod).
- **Rate limiting:** Limites por janela (api, auth, health) já configurados.
- **Documentação:** Checklists de problemas, o que falta para produção, guias Docker e backend atualizados. Status do projeto e das features alinhados ao que está implementado.

---

## 3. Nota e visão geral

| Critério            | Nota (0–10) | Comentário |
|---------------------|-------------|------------|
| Organização do código | 7,5       | Backend e frontend bem estruturados; alguns arquivos/scripts soltos. |
| Arquitetura         | 8           | Clean Architecture + CQRS no backend; frontend com camada de serviços e contextos. |
| Funcionalidade      | 8           | Fluxo de compra, área cliente, dashboard e vendedor cobertos; faltam refinamentos. |
| Segurança           | 5,5         | Auth e JWT ok em dev; CORS e secrets em produção ainda a ajustar; senha de exemplo no README. |
| Testes              | 0           | Nenhum projeto de teste (unit, integration, E2E). |
| Documentação        | 8           | docs/ organizada, README e checklists úteis. |
| Pronto para produção | 4          | Falta segurança em prod, testes, CI/CD e alguns itens da checklist. |

**Nota geral: 6,5 / 10**

- **Como produto/MVP e base de código:** sólido (7–8): escopo grande, organização boa, doc boa.
- **Como sistema pronto para produção:** ainda insuficiente (4–5): sem testes, segurança e operação em prod por fazer.

---

## 4. O que falta para produção

### Crítico (bloqueante)

1. **Segurança em produção**
   - CORS: não usar `AllowAnyOrigin()` em prod; listar origens em `Cors:Origins`.
   - Garantir `ValidateAudience = true` e `RequireHttpsMetadata = true` em prod (já condicionados no código; conferir config).
   - Remover senhas e tokens de exemplo do README; usar variáveis de ambiente e documentar só o nome da variável.

2. **Testes**
   - Nenhum teste automatizado hoje. Mínimo aceitável para produção:
     - Alguns testes unitários nos handlers críticos (checkout, cupom, webhook).
     - Pelo menos um teste de integração (ex.: API + Mongo) para um fluxo principal.
     - Opcional mas desejável: um E2E (ex.: Playwright) para login + listar produtos ou checkout.

3. **Configuração e secrets**
   - Keycloak e Mercado Pago configurados para o domínio real (redirect URIs, webhook URL).
   - Secrets (Keycloak, Mercado Pago, connection strings) só em variáveis de ambiente ou vault, nunca no código.

### Importante (recomendado antes de subir)

4. **Observabilidade**
   - Logs estruturados (ex.: JSON) para erros e eventos importantes (checkout, webhook, login).
   - Tratamento de erro global na API (middleware) e mensagens amigáveis no front (evitar stack trace ao usuário).
   - Healthchecks da API refletindo dependências (Mongo, Keycloak opcional).

5. **Frontend**
   - Error boundaries para não deixar tela branca em erros não tratados.
   - Garantir que dados sensíveis não vazem em mensagens de erro (ex.: não expor detalhes de 500).

6. **Deploy**
   - Pipeline CI/CD (build, testes, deploy em homologação/produção).
   - Documentar variáveis obrigatórias para produção em `env.example` ou em `docs/production/whats-missing.md`.

### Desejável (pós-go-live)

7. Cache para listagens (produtos, categorias, settings) se o tráfego crescer.
8. Dashboard com paginação/limite em vez de carregar muitas categorias de uma vez.
9. E-mail real para notificação do seller (substituir stub).
10. LGPD: política de privacidade e termos de uso; revisar dados pessoais e retenção.

---

## 5. O que podemos melhorar agora (curto prazo)

### Limpeza e organização

1. **Mover ou ignorar arquivos de apoio**
   - Backend: adicionar ao `.gitignore` (ou mover para `scripts/`): `build-log.txt`, `tree-backend.txt`, `nuget-packages.txt`, `proj-refs.txt`.
   - Frontend: mover `fix_cats.js`, `fix_products_ids*.js`, `seed*.js` para uma pasta `scripts/` e documentar no README que são ferramentas de desenvolvimento/seed.

2. **Consistência do backend**
   - Opcional: migrar os handlers que estão em `KitCerto.API/Products/` (Update, Delete, Stock, ListProducts) para `KitCerto.Application` e deixar a API só com controllers. Isso unifica a regra “toda lógica na Application”.

### Documentação e checklist

3. **Atualizar checklist de problemas**
   - Em `docs/checklists/problems.md`, ajustar o item “JWT sem validação de audience”: no código já existe `ValidateAudience = !isLocalEnv`; marcar como “verificar em produção” em vez de “não implementado”.
   - Revisar item “README desatualizado” após as últimas alterações na doc.

### Primeiro passo em testes

4. **Criar um projeto de testes no backend**
   - Ex.: `KitCerto.Tests` ou `KitCerto.API.Tests` (xUnit ou NUnit).
   - Adicionar pelo menos 1–2 testes unitários em um handler simples (ex.: GetSettings ou ListCategories) para servir de modelo e garantir que o pipeline de build possa rodar testes no futuro.

### Segurança (rápido)

5. **README: não expor senha real**
   - Trocar `Admin@123` por algo como `[senha do usuário admin]` ou “consultar variável X” e deixar claro que são contas de desenvolvimento.

---

## 6. Resumo

- **Projeto:** Bem organizado para um MVP/e-commerce: arquitetura clara, escopo grande (checkout, área cliente, dashboard, vendedor, suporte), documentação boa e centralizada em `docs/`.
- **Nota:** 6,5/10 no geral; mais alta em organização e funcionalidade, mais baixa em testes e preparação para produção.
- **Para produção:** é essencial tratar segurança (CORS, secrets, README), introduzir testes (ao menos unitários + 1 integração) e configurar CI/CD e ambiente (Keycloak, Mercado Pago, env).
- **Melhorias imediatas:** limpar arquivos/scripts soltos, atualizar checklist e README (senha), criar um projeto de testes com 1–2 testes como semente.

Com isso, o projeto fica mais fácil de manter e com um caminho claro para ficar pronto para produção.
