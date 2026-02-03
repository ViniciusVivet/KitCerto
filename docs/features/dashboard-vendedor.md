# Dashboard e área do vendedor

> **Status:** Implementado. O vendedor vê no dashboard: Minha loja, Meus produtos, Pedidos e Chamados. Admin vê o menu completo + Chamados (todos).

## Visão: um dashboard, dois modos

O **dashboard** (`/dashboard`) hoje é usado pela **administração da plataforma** (produtos, categorias, pedidos, configurações, etc.). A ideia é **reaproveitar o mesmo dashboard** para a **área do vendedor (loja)**:

- **Admin** (role `admin`): vê o menu completo da plataforma + **Chamados** (todos os tickets, para atender ou inspecionar).
- **Vendedor** (loja aprovada): vê **Minha loja** (resumo), **Meus produtos**, **Pedidos** (com produtos da loja) e **Chamados** (tickets da sua loja).

Assim, não há uma “área do vendedor” separada: é o **mesmo dashboard**, com **menu e dados filtrados por role**:

| Role     | O que vê no dashboard                                      |
|----------|------------------------------------------------------------|
| Admin    | Tudo (Produtos, Categorias, Estoque, Pedidos, Clientes, Relatórios, Configurações, Ajuda) + **Chamados** (todos). |
| Seller   | **Minha loja**, **Meus produtos**, **Pedidos**, **Chamados** (só os da minha loja). |

O vendedor é identificado assim: quando um **SellerRequest** é aprovado, criamos um **Seller** (loja) vinculado ao `UserId` do solicitante. No backend, “quem é seller” é quem tem um **Seller** com aquele `UserId`. No front, podemos usar role `seller` (se o Keycloak passar a atribuir ao aprovar) ou um endpoint “sou vendedor?” que consulta se existe Seller para o usuário.

## Fluxo da fase 2 do suporte

1. Cliente abre chamado e opcionalmente vincula a um **pedido**.
2. Backend, ao criar o ticket, pega o primeiro item do pedido, busca o **Product** e seu **SellerId** (se houver) e grava em **SupportTicket.SellerId**.
3. Quando o cliente envia uma **nova mensagem** nesse ticket, o backend envia um **e-mail para a loja** (Seller.Email) avisando que há nova mensagem.
4. O **vendedor** entra no **Dashboard → Chamados**, vê só os tickets da sua loja, abre um e **responde** (POST em mensagens). O backend permite resposta se o usuário for o dono do ticket **ou** o Seller daquele ticket.

Assim, o “chatzinho” continua sendo o mesmo (ticket + thread de mensagens); a diferença é que (a) o ticket fica **atribuído à loja** do produto do pedido, (b) a **loja é notificada por e-mail** quando o cliente manda mensagem, e (c) a **loja responde pelo dashboard** (mesmo lugar que o admin, mas vendo só os seus chamados).
