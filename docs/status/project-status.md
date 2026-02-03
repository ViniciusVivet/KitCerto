# Status do projeto KitCerto

Resumo do estado atual, do que falta para colocar no ar e do que já funciona bem.

---

## Como está o projeto

- **Backend (API .NET):** Funcional; endpoints de produtos, categorias, pedidos, estoque, configurações, sellers, tickets e webhook Mercado Pago. MongoDB com índices.
- **Dashboard admin:** Fluxo completo: Dashboard, Produtos, Categorias, Estoque, Pedidos, Clientes, Relatórios, **Chamados**, Configurações e Ajuda.
- **Dashboard vendedor:** Para lojas aprovadas (Seller): Minha loja, **Meus produtos**, **Pedidos** (com produtos da loja), **Chamados** (tickets da loja). Mesmo `/dashboard`, menu e dados filtrados por role.
- **Área do cliente (Meus pedidos):**
  - **Visão geral** – totais e último pedido (dados reais da API).
  - **Meus pedidos** – lista, filtros, repetir compra.
  - **Endereços** – CRUD e seleção no checkout.
  - **Pagamentos** – métodos salvos (Mercado Pago) e remoção.
  - **Cupons** – validação e uso no checkout (backend aplica desconto).
  - **Dados pessoais** – perfil, foto, CPF, data nascimento, newsletter.
  - **Suporte** – abrir chamado (opcionalmente vinculado a pedido), chat com mensagens, resposta do admin/seller.
  - **Favoritos** – persistência e lista (se implementado na API).

---

## O que já desempenha bem

- API estável e integrada ao frontend.
- Gráficos e KPIs do dashboard consumindo dados reais.
- Carrinho e checkout com endereço (CEP/ViaCEP), frete por settings, cupom na API, redirecionamento ao Mercado Pago.
- Webhook do Mercado Pago atualizando status do pedido.
- Suporte com ticket + chat; seller pode listar e responder chamados da sua loja.
- Área do vendedor: Meus produtos (CRUD), Pedidos com meus produtos, Chamados.
- Autenticação e proteção de rotas (admin x cliente x seller).

---

## O que ainda falta ou pode melhorar

1. **Produção e segurança**
   - JWT audience, HTTPS em produção, CORS restrito, secrets em variáveis de ambiente.
   - Keycloak e Mercado Pago configurados para o domínio de produção.

2. **Qualidade e operação**
   - Revisar valores exibidos e garantir consistência com a API.
   - Testes E2E e tratamento de erros/feedback.
   - Logs estruturados e healthchecks alinhados às dependências.

3. **Funcionalidades opcionais**
   - Notificação por e-mail real para o seller (hoje stub).
   - Favoritos e visão geral da área do cliente com mais dados agregados.

Para lista detalhada de problemas conhecidos e checklist de produção, veja [checklists/problems.md](../checklists/problems.md) e [production/whats-missing.md](../production/whats-missing.md).
