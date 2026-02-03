## Checklist de evolucao: MVP -> ecommerce real

### 1) Pagamentos e pedidos (core)
- [ ] Webhook do Mercado Pago para confirmar pagamento
- [ ] Atualizar status do pedido (paid, failed, cancelled)
- [ ] Reverter estoque quando pagamento falhar/cancelar
- [ ] Conciliacao de pagamentos (status vs gateway)
- [ ] Email/Notificacao ao cliente com status do pedido

### 2) Carrinho e precos
- [ ] Carrinho persistido no backend por usuario
- [ ] Validar preco no backend (evitar manipulacao)
- [ ] Validar estoque no momento do checkout
- [ ] Reservar estoque com timeout (expirar reserva)

### 3) Logistica
- [ ] Endereco completo (CEP, numero, complemento, bairro)
- [ ] Calculo de frete real (Correios/transportadora)
- [ ] Etiqueta/envio e codigo de rastreio
- [ ] Historico de status de entrega

### 4) Catalogo e administracao
- [ ] CRUD de produtos com imagens reais (upload)
- [ ] Variacoes (tamanho, cor) se necessario
- [ ] Regras de preco/promocao/cupom
- [ ] Auditoria basica (quem alterou o que)

### 5) Seguranca e compliance
- [ ] HTTPS obrigatorio em producao
- [ ] CORS restrito por ambiente
- [ ] Secrets fora do codigo (env/secrets)
- [ ] Rate limit por usuario/IP e antifraude basico
- [ ] LGPD: politica de privacidade e termos

### 6) Observabilidade
- [ ] Logs persistentes (ex: CloudWatch/ELK)
- [ ] Monitoramento e alertas (erros, latencia)
- [ ] Dashboard de saude (uptime, fila, erros)

### 7) Infra e backups
- [ ] Backup automatico do MongoDB
- [ ] Backup do Keycloak/Postgres
- [ ] Teste de restore
- [ ] Configurar dominio e DNS

### 8) Experiencia do usuario
- [ ] Paginas de sucesso/falha do checkout
- [ ] Area do cliente com pedidos reais
- [ ] FAQ, politica de troca/devolucao
- [ ] Contato/atendimento
