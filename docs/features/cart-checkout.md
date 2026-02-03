# Carrinho e Checkout — Pronto para produção?

## O que já está pronto

### Carrinho (context + UI)
- **Estado**: itens com id, name, price, qty; ações add, remove, inc, dec, clear.
- **Persistência**: localStorage `kitcerto:cart`; hidratação ao carregar a página.
- **Header**: ícone do carrinho com badge de quantidade; sheet lateral com lista, +/- por item, subtotal.
- **Empty state**: "Seu carrinho está vazio" + botão para continuar comprando.
- **Checkout**: modal em 4 passos (endereço, frete, pagamento, revisão); envia para API e redireciona para Mercado Pago.

### Backend
- **Checkout**: valida itens, estoque e produto; cria pedido; reserva estoque; gera preferência no Mercado Pago; retorna URL de pagamento.
- **Endereço**: aceita AddressLine, City, State (mínimo necessário).
- **Erros**: retorna códigos como `empty_items`, `product_not_found`, `insufficient_stock` e mensagem legível.

---

## O que falta ou pode melhorar

### Crítico para produção
| Item | Status | Observação |
|------|--------|------------|
| **Login antes do checkout** | Ajustado | Modal pode exigir login no passo 1; API já retorna 401 se não autenticado. |
| **Texto "Fluxo simulado"** | Ajustado | Trocar por descrição de produção no modal de checkout. |
| **Botão "Finalizar compra" no carrinho** | Ajustado | Era o que só fechava o sheet; renomear para "Continuar comprando" e deixar "Ir para checkout" como CTA principal. |
| **Erro da API no checkout** | Ajustado | Exibir mensagem do backend (ex.: estoque insuficiente) em vez de só "HTTP 400". |

### Recomendado
| Item | Status | Observação |
|------|--------|------------|
| **Endereço completo** | Implementado | Checkout com CEP, número, complemento, bairro; busca CEP via ViaCEP. |
| **Busca de CEP** | Implementado | ViaCEP no checkout para preencher rua, bairro e cidade. |
| **Frete** | Implementado | Calculado com base em `freeShippingThreshold` das settings da API. |
| **Cupom** | Implementado | Backend valida cupom, aplica desconto e incrementa uso no checkout. |

### Nice to have
| Item | Status | Observação |
|------|--------|------------|
| **Imagem do produto no carrinho** | Não feito | Adicionar `imageUrl` ao item ao adicionar (e exibir no sheet). |
| **Link para o produto** | Não feito | Cada item do carrinho pode linkar para a página do produto (ex.: `/produto/[id]`). |
| **Aviso de preço** | Não feito | "Preços confirmados no checkout" — o backend já usa o preço atual do produto ao criar o pedido. |
| **Estoque no add** | Não feito | Antes de adicionar, checar estoque (API) ou mostrar aviso no checkout se o backend retornar `insufficient_stock`. |
| **Contagem do badge** | Ok | Badge mostra quantidade de itens (linhas); pode alternar para "total de unidades" se quiser. |

---

## Resumo

- **Fluxo**: Carrinho → Checkout (endereço, frete, pagamento) → API → Mercado Pago está fechado e alinhado com o backend.
- **Ajustes feitos**: texto de produção no checkout, botão "Continuar comprando" no carrinho, exibição da mensagem de erro da API, e exigência de login no início do checkout.
- **Para produção**: endereço completo (CEP, ViaCEP), frete por settings e cupom na API já estão implementados. Validar fluxo com cupons e domínio real.
