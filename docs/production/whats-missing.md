# O que falta para produção

Resumo do que ainda precisa ser feito ou revisado antes de considerar o KitCerto pronto para produção. Baseado no [checklist de problemas](../checklists/problems.md), no [carrinho/checkout](../features/cart-checkout.md) e no estado atual do projeto.

---

## Crítico (fazer antes de produção)

### Segurança
- [ ] **JWT**: Habilitar validação de audience (`ValidateAudience = true`) e configurar o audience correto no Keycloak e no `Program.cs`.
- [ ] **HTTPS**: Em produção, usar `RequireHttpsMetadata = true` e certificado válido.
- [ ] **CORS**: Não usar `AllowAnyOrigin()` em produção; listar origens permitidas (ex.: frontend da loja).
- [ ] **Secrets**: Remover senhas e tokens de exemplo do README e usar variáveis de ambiente ou vault.

### Dados e integrações
- [ ] **Mercado Pago**: Configurar URLs de sucesso/falha/pendente para produção; **webhook** para atualizar status do pedido já existe (`POST /api/webhooks/mercadopago`). Em localhost usar túnel (ngrok).
- [ ] **Keycloak**: Configurar client, roles e redirect URIs para o domínio de produção.

### Funcionalidade
- [ ] **Settings GET**: Decidir se `GET /api/settings` deve ser público (hoje é) ou exigir auth; em produção pode ser público para exibir dados da loja no front.
- [ ] **Cupom no checkout**: Já implementado (backend aplica desconto e incrementa uso). Validar fluxo com cupons reais.

---

## Importante (recomendado)

### Performance
- [ ] **Dashboard**: Evitar carregar muitas categorias de uma vez; paginar ou limitar.
- [ ] **Cache**: Avaliar cache para listagens (produtos, categorias, settings) se o tráfego crescer.
- [ ] **Rate limiting**: Manter ou ajustar limites por IP/usuário para evitar abuso.

### Operação
- [ ] **Logs**: Manter Serilog e adicionar logs estruturados para erros e eventos importantes (checkout, webhook, login).
- [ ] **Tratamento de erro global**: Padronizar respostas de erro (ProblemDetails) e mensagens amigáveis no front.
- [ ] **Healthchecks**: Ajustar healthchecks do Nginx e da API para refletir dependências (Mongo, Keycloak).

### Documentação e configuração
- [ ] **README**: Atualizar com modo de uso real (API + Keycloak), sem “mock-first” se não for mais o caso.
- [ ] **Configuração**: Unificar env.example / appsettings e documentar variáveis obrigatórias para produção.
- [ ] **Docker**: Revisar volumes persistentes e, se possível, multi-stage build para imagens menores.

---

## Desejável (melhoria contínua)

### Frontend
- [ ] **Error boundaries**: Evitar tela branca em erros não tratados.
- [ ] **Acessibilidade**: Revisar labels, contraste e navegação por teclado.
- [ ] **SEO**: Meta tags e títulos por página (já parcialmente coberto pelo Next.js).

### Suporte e loja
- [x] **Chat com a loja**: Fase 1 e 2 implementadas (ticket + pedido + thread, SellerId no ticket, área Chamados no dashboard para admin e seller). Opcional: e-mail real para o seller (hoje stub).

### Código e DevOps
- [ ] **Testes**: Testes automatizados para fluxos críticos (checkout, cupom, webhook, login).
- [ ] **CI/CD**: Pipeline de build, testes e deploy para homologação/produção.

---

## Checklist rápido pré-deploy

1. Variáveis de ambiente de produção configuradas (API, Keycloak, Mongo, Mercado Pago).
2. HTTPS e CORS configurados para o domínio real.
3. Webhook do Mercado Pago apontando para a API em produção (ou túnel em testes).
4. Nenhum secret ou senha de exemplo no código ou em arquivos versionados.
5. README e documentação alinhados com o fluxo atual (auth, checkout, suporte).

Quando esses itens estiverem cobertos, o projeto estará em condições muito melhores para produção. Os itens de “Desejável” podem ser feitos em seguida.
