# Validação da área do cliente (conexão com a API)

## Como testar (resumo)

1. **Suba o projeto** (ex.: `docker compose -f docker-compose.dev.yml up -d`) e espere tudo subir.
2. **Abra o site** em `http://localhost:3000` e **faça login**.
3. **Teste cada tela** conforme abaixo. Se carregar sem erro e os dados baterem, passou.

---

## 1. Visão geral

| O que validar | Como |
|---------------|------|
| Dados reais | Abra `/meus-pedidos/visao-geral`. Os números (total de pedidos, total gasto, último pedido) devem bater com o que aparece em **Meus pedidos**. |
| API usada | A página chama `GET /api/orders` (mesmo endpoint de Meus pedidos). Se Meus pedidos já mostra seus pedidos, Visão geral usa a mesma fonte. |
| Link | Clique em **"Meus pedidos"** (botão no card) e confira se vai para `/meus-pedidos` e mostra a mesma lista. |

**Passou?** Se os totais e o último pedido batem com a lista em Meus pedidos, está conectado e funcionando.

---

## 2. Dados pessoais

| O que validar | Como |
|---------------|------|
| GET /api/me | Abra `/meus-pedidos/dados-pessoais`. A página deve carregar sem erro. Nome e e-mail (conta) vêm do login; nome completo, nome de exibição, CPF, data de nascimento, telefone e newsletter podem estar vazios na primeira vez. |
| Foto | Clique em **Foto**, escolha uma imagem (jpg, png, webp ou gif). Deve enviar e exibir a prévia. Clique em **Salvar alterações** para gravar. |
| Salvamento | Preencha **Nome completo**, **CPF**, **Data de nascimento**, **Telefone** e marque **Receber ofertas**. Clique em **Salvar alterações**. Deve aparecer toast de sucesso. |
| Persistência | Recarregue a página (F5). Os campos e a foto devem continuar preenchidos (vindos do banco via `GET /api/me`). |
| Endereço principal | Se houver endereço cadastrado em Endereços, o bloco **Endereço principal** deve mostrar o endereço padrão. O link **Gerenciar endereços** deve levar a `/meus-pedidos/enderecos`. |

**Passou?** Se a página carrega, foto e dados salvam e ao recarregar tudo permanece, a API está conectada e funcionando.

---

## 3. Meus pedidos (já existente)

| O que validar | Como |
|---------------|------|
| Lista | `/meus-pedidos` mostra seus pedidos (ou "Você ainda não possui pedidos" se não houver). |
| Filtros e busca | Filtros por status e período e busca por código/item alteram a lista. |
| Detalhes / Repetir compra | Botões **Detalhes** e **Repetir compra** funcionam. |

Se isso já funcionava antes, considere “passou”.

---

## 4. Endereços

| O que validar | Como |
|---------------|------|
| Lista | Abra `/meus-pedidos/enderecos`. Deve listar endereços ou "Nenhum endereço cadastrado". |
| Criar | **Novo endereço** → preencha CEP, rua, número, cidade, estado → **Adicionar**. Deve aparecer na lista. |
| Editar / Excluir | Ícones **Editar** e **Excluir**; **Estrela** define principal. |

## 5. Favoritos

| O que validar | Como |
|---------------|------|
| Lista | `/meus-pedidos/favoritos` mostra produtos favoritados (quando logado). |
| Adicionar | Na loja, clique no coração no produto; em Favoritos o item deve aparecer. |
| Remover | Em Favoritos, ícone lixeira remove o item. |

## 6. Cupons

| O que validar | Como |
|---------------|------|
| Lista | `/meus-pedidos/cupons` lista cupons ativos (código, desconto, validade) ou "Nenhum cupom ativo". |
| Copiar | Botão **Copiar** copia o código. Admin cria cupons via POST /api/coupons. |

## 7. Pagamentos

| O que validar | Como |
|---------------|------|
| Histórico | `/meus-pedidos/pagamentos` mostra **Histórico de pagamentos** (pedidos: id, data, status, valor). |
| Métodos salvos | Bloco explica que pagamento é no checkout (Mercado Pago). |

## 8. Suporte

| O que validar | Como |
|---------------|------|
| Contato | Se a loja tiver e-mail/telefone em Configurações (admin), o bloco **Contato da loja** aparece com link de e-mail e telefone (GET /api/settings). |
| FAQ | `/meus-pedidos/suporte` mostra **Perguntas frequentes** e **Meus chamados**. |
| Abrir chamado | **Abrir chamado** → assunto e mensagem → **Enviar**. Chamado aparece na lista. |

## Resumo

- **Visão geral:** API de pedidos.
- **Dados pessoais:** GET/PATCH /api/me, POST /api/me/avatar, bloco endereço (GET /api/addresses).
- **Endereços:** CRUD /api/addresses, POST /api/addresses/{id}/default.
- **Favoritos:** GET/POST/DELETE /api/favorites; coração na loja conectado à API quando logado.
- **Cupons:** GET /api/coupons (ativos); POST /api/coupons (admin).
- **Pagamentos:** Histórico via GET /api/orders.
- **Suporte:** GET/POST /api/tickets; FAQ estático no front.

Sempre que terminar uma nova categoria (ex.: Endereços, Favoritos), adicione aqui uma seção “4. Endereços”, etc., e valide antes de seguir.
