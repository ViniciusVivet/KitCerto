# Cache e mudanças não refletindo (Docker dev)

Se as alterações no frontend ou na API não aparecem mesmo em janela anônima, é quase sempre **cache** (Next.js, browser ou Docker).

---

## O que foi ajustado no compose de dev

- O volume anônimo `/app/.next` do frontend foi **removido**. O cache do Next.js passa a ficar em `./frontend/.next` no seu PC.
- Assim você pode **apagar o cache à mão** quando quiser: apague a pasta `frontend/.next` e reinicie o container do frontend.

---

## Quando as mudanças não refletem

### 1. Só frontend (Next.js)

**Opção A – Limpar cache do Next (recomendado primeiro)**  
Na raiz do projeto:

```bash
# Parar o frontend
docker compose -f docker-compose.dev.yml stop frontend

# Apagar o cache (no PowerShell)
Remove-Item -Recurse -Force frontend\.next

# Subir de novo
docker compose -f docker-compose.dev.yml up -d frontend
```

**Opção B – Recriar o container (sem rebuild de imagem)**  
Recria o container do frontend (útil se ainda tiver volume antigo ou algo estranho):

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate frontend
```

### 2. Rebuild completo (tudo do zero)

Use quando quiser garantir que não sobrou nenhum cache (Docker, Next, etc.):

```bash
# Parar e remover containers + volumes anônimos
docker compose -f docker-compose.dev.yml down

# (Opcional) Limpar cache do Next no host
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue

# Subir de novo (imagens já existentes, containers novos)
docker compose -f docker-compose.dev.yml up -d
```

Não é necessário `build` no dev: o frontend usa a imagem `node:20-alpine` e o código vem do volume `./frontend:/app`.

### 3. Se estiver usando o compose da pasta infra (produção)

Aí o frontend é **buildado** na imagem. Qualquer mudança no código exige **rebuild**:

```bash
cd infra
docker compose build --no-cache frontend
docker compose up -d
```

---

## Resumo

| Situação                         | O que fazer |
|----------------------------------|-------------|
| Mudanças no frontend não aparecem | Parar frontend, apagar frontend/.next, up -d frontend |
| Continua igual                   | docker compose down depois up -d |
| Janela anônima ainda mostra antigo | Hard refresh (Ctrl+Shift+R) ou limpar cache do site em dev tools |

Não é bug do seu PC: o combo **volume anônimo + cache do Next** no container fazia o cache ficar "preso". Agora o cache está na pasta do projeto e você controla quando apagar.
