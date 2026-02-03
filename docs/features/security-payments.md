# Segurança, cartão de crédito e produção

Este documento resume: (1) correção do erro ao salvar dados pessoais; (2) complexidade e como implementar “cartão salvo” na área de Pagamentos; (3) o que fazer para o site seguir leis e boas práticas de segurança (PCI-DSS, LGPD, etc.) e você se sentir seguro ao ir para o ar.

---

## 1. Erro ao salvar Dados Pessoais (birthDate)

**Problema:** Ao salvar o perfil em **Dados pessoais**, a API retornava 400 com:
- `"body": ["The body field is required."]`
- `"$.birthDate": ["The JSON value could not be converted to System.Nullable<System.DateTime>"]`

**Causa:** O valor da data (ex.: ano `20000` ou formato `12/12/20000`) não era aceito pelo backend como `DateTime` em JSON.

**O que foi feito:**
- **Frontend:** A data de nascimento é normalizada para ISO (`yyyy-MM-dd`) e validada (ano entre 1900 e o ano atual). Se estiver fora do intervalo ou inválida, é exibido um aviso e não é enviada.
- **Backend:** O endpoint PATCH `/api/me` passou a receber `birthDate` como **string** (opcional) e faz o parse manual para `DateTime?` (ISO), evitando falha de binding e mantendo a API estável.

Com isso, o formulário de Dados pessoais deve salvar normalmente. Use uma data válida (ex.: 12/12/1990).

---

## 2. Registrar cartão de crédito na área de Pagamentos

### Complexidade

- **Média**, se você **não** armazenar número de cartão no seu servidor.
- **Muito alta e arriscada**, se você armazenar ou trafegar dados completos do cartão no seu backend.

A regra de ouro: **nunca** guardar número completo do cartão, CVV ou dados da faixa magnética no seu banco ou logs. Quem pode guardar e processar isso é o **gateway de pagamento** (Mercado Pago, Stripe, PagSeguro, etc.), dentro do escopo deles (PCI-DSS).

### Como fazer com segurança (tokenização)

1. **Gateway com tokenização**
   - O cliente digita o cartão **só na tela** (ou em um iframe/componente do próprio gateway).
   - O **frontend** envia os dados do cartão **diretamente** para o gateway (via SDK/API deles no browser), não para o seu backend.
   - O gateway devolve um **token** (ou `payment_method_id`, “cartão salvo”).
   - Seu backend **só** recebe e guarda esse **token** + dados não sensíveis (ex.: últimos 4 dígitos, bandeira, apelido). Na hora da compra, você envia o token ao gateway para cobrar.

2. **Fluxo resumido**
   - Área **Pagamentos**: “Adicionar cartão” → frontend abre o formulário/componente do gateway → gateway retorna token → seu backend grava token + last4 + bandeira no perfil do usuário.
   - **Checkout**: Cliente escolhe “Cartão salvo” → seu backend envia o token ao gateway para cobrança; você nunca vê o número do cartão.

3. **Mercado Pago (exemplo)**
   - Eles oferecem **Checkout Pro**, **Checkout Bricks** e **APIs** para tokenizar cartão e salvar “cartões do cliente”.
   - Documentação: como criar um “payment method” salvo e como cobrar com esse método depois. A implementação da área “Métodos salvos” seria: tela de adicionar cartão (usando o JS/SDK do MP) → receber token → sua API criar/atualizar “método de pagamento” do usuário (token + last4 + bandeira).

Assim, a **complexidade** fica em: integrar o SDK/API do gateway na área de Pagamentos + um CRUD simples no seu backend para “métodos de pagamento” (token, last4, bandeira, userId). O difícil (PCI) fica com o gateway.

---

## 3. Segurança e leis: o que o site precisa para ir ao ar com segurança

### 3.1 PCI-DSS (cartão de crédito)

- **Não** trafegar nem armazenar número completo do cartão, CVV ou faixa magnética no seu servidor.
- Usar **sempre** um gateway que ofereça tokenização e, no frontend, enviar dados de cartão **direto** para o gateway (não para sua API).
- Em produção: **HTTPS** em todo o site; sem logs ou mensagens com dados de cartão.

Seguindo isso (tokenização + gateway), o escopo PCI do seu sistema fica bem reduzido.

### 3.2 LGPD (Brasil)

- **Política de privacidade** e **termos de uso** claros (o que você coleta, para que usa, com quem compartilha, direitos do titular).
- **Base legal** para tratamento (ex.: execução de contrato, consentimento para marketing).
- **Segurança** dos dados (HTTPS, acesso restrito, senhas hasheadas, etc.).
- Resposta a **direitos do titular** (acesso, correção, exclusão, portabilidade), com prazos definidos.

### 3.3 Checklist técnico de segurança (produção)

- [ ] **HTTPS** obrigatório (certificado válido; redirect HTTP → HTTPS).
- [ ] **CORS** restrito às origens do seu front (sem `AllowAnyOrigin` em produção).
- [ ] **Secrets** fora do código (variáveis de ambiente / vault); nunca commitar chaves de API ou senhas.
- [ ] **Rate limiting** na API (já existe um esboço no projeto) e, se possível, limites por usuário/IP em rotas sensíveis (login, pagamento, “adicionar cartão”).
- [ ] **Autenticação**: JWT com expiração adequada; renovação/refresh se necessário; logout invalida token onde aplicável.
- [ ] **Dados sensíveis**: não logar senhas, tokens de cartão ou dados completos de pagamento; não expor stack trace em respostas públicas.
- [ ] **Backups** do banco (MongoDB, etc.) e do que for crítico (Keycloak, configurações), com teste de restore.
- [ ] **Atualizações** de dependências e do servidor (correções de segurança).

### 3.4 Sentir-se seguro ao subir para produção

- Use **tokenização** para cartão (item 2) e **HTTPS + CORS + secrets** (item 3.3).
- Documente **política de privacidade** e **termos** e coloque links no site (LGPD).
- Mantenha o **checklist de produção** do projeto (`CHECKLIST_PRODUCAO.md`) e vá marcando itens (webhooks de pagamento, estoque, frete, backups, etc.).

Com isso, você cobre o essencial de segurança e compliance para um e-commerce ir ao ar de forma responsável. A parte pesada de PCI fica com o gateway; a sua aplicação só lida com tokens e metadados não sensíveis.
