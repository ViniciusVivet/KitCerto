# 📚 Documentação do KitCerto

Índice da documentação do projeto, organizada por tema.

---

## 📊 Avaliação do projeto

| Documento | Descrição |
|-----------|-----------|
| [Avaliação do projeto](AVALIACAO_PROJETO.md) | Revisão crítica: organização, nota, o que falta para produção e melhorias imediatas. |

---

## 🚀 Começando

| Documento | Descrição |
|-----------|-----------|
| [Guia de desenvolvimento](getting-started/dev-guide.md) | Estrutura do projeto, commits e comandos para rodar local. |

---

## 🐳 Docker e infraestrutura

| Documento | Descrição |
|-----------|-----------|
| [Comandos Docker](docker/commands.md) | Subir, parar, reiniciar, logs e derrubar tudo. |
| [Cache e mudanças não refletindo](docker/cache-dev.md) | Limpar cache do Next.js e do Docker quando alterações não aparecem. |
| [Debug e problemas comuns](docker/debug.md) | Como rodar o projeto e solução para API, auth, CORS e dados. |
| [Frontend no Docker (SWC)](docker/frontend-container.md) | Download do SWC no container e como acompanhar. |

---

## ⚙️ Backend (.NET)

| Documento | Descrição |
|-----------|-----------|
| [Quando usar dotnet restore](backend/dotnet-restore.md) | O que é e quando rodar `dotnet restore`. |
| [Erro do IDE no MongoDB.Driver](backend/ide-mongodb-errors.md) | Por que o IDE acusa erro e como resolver. |
| [Plano de índices MongoDB](backend/mongodb-indexes.md) | Índices recomendados por collection. |

---

## 📋 Checklists e status

| Documento | Descrição |
|-----------|-----------|
| [Status do projeto](status/project-status.md) | O que está pronto, o que falta e prioridades. |
| [Checklist de problemas](checklists/problems.md) | Lista de problemas conhecidos (segurança, performance, etc.). |
| [Problemas conhecidos (detalhado)](checklists/known-issues.md) | Mesmos itens com descrição e plano de ação. |
| [Checklist MVP → produção](checklists/production-evolution.md) | Evolução do MVP para e-commerce em produção. |

---

## 🌐 Produção

| Documento | Descrição |
|-----------|-----------|
| [O que falta para produção](production/whats-missing.md) | Crítico, importante e recomendado antes de subir. |

---

## 🧩 Funcionalidades e especificações

| Documento | Descrição |
|-----------|-----------|
| [Carrinho e checkout](features/cart-checkout.md) | O que está pronto e o que falta no fluxo de compra. |
| [Segurança e pagamentos](features/security-payments.md) | Dados pessoais, cartão, PCI-DSS e LGPD. |
| [Validação da área do cliente](features/area-cliente-validation.md) | Como testar cada tela da área logada. |
| [Suporte: ticket e chat](features/support-chat.md) | Fase 1 e 2 (ticket, chat, loja/vendedor). |
| [Dashboard e área do vendedor](features/dashboard-vendedor.md) | Visão admin vs seller e fluxo de chamados. |

---

## 🔧 Troubleshooting

| Documento | Descrição |
|-----------|-----------|
| [Diagnóstico de rebuild](troubleshooting/rebuild.md) | Por que MongoDB/Keycloak/API demoram ao subir. |

---

## 📁 Documentação junto ao código

- **Raiz:** [README.md](../README.md) — visão geral, como subir com Docker, endpoints e estrutura.
- **Backend:** `backend/ReadmeBACKEND.md`, `backend/KitCerto.API/ReadmeAPI.md`, `backend/KitCerto.Application/ReadmeAPPLICATION.md`, `backend/KitCerto.Domain/ReadmeDOMAIN.md`, `backend/KitCerto.Infrastructure/ReadmeINFRA.MD`
- **Frontend:** `frontend/ReadmeFRONTEND.md`
