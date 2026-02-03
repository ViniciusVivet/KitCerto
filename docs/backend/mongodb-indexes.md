# 📋 Plano de Índices MongoDB - KitCerto

## 🔍 Análise das Queries

### **Products Collection**

#### Queries Identificadas:
1. **SearchAsync** - Busca por nome (Regex) e/ou categoria
   - Filtro: `Name` (Regex case-insensitive) + `CategoryId` (Eq)
   - Uso: Busca de produtos na loja
   - **Índice necessário:** Composto `{ CategoryId: 1, Name: 1 }` + Text Index em `Name`

2. **CountAsync** - Conta produtos com filtros
   - Filtro: `Name` (Regex) + `CategoryId` (Eq)
   - Uso: Paginação e contagem
   - **Índice necessário:** Mesmo do SearchAsync

3. **LowStockCountAsync** - Conta produtos com estoque baixo
   - Filtro: `Stock < threshold`
   - Uso: Dashboard
   - **Índice necessário:** `{ Stock: 1 }`

4. **ListLowStockAsync** - Lista produtos com estoque baixo
   - Filtro: `Stock < threshold`
   - Uso: Dashboard
   - **Índice necessário:** `{ Stock: 1 }`

5. **PriceBucketsAsync** - Conta produtos por faixa de preço
   - Filtro: `Price >= min AND Price < max`
   - Uso: Dashboard/gráficos
   - **Índice necessário:** `{ Price: 1 }`

6. **ListAsync** - Lista paginada (sem filtro)
   - Filtro: Nenhum, apenas Skip/Limit
   - Uso: Listagem geral
   - **Índice necessário:** Nenhum específico (usa _id)

7. **TopProductsByValueAsync** - Top produtos por valor (Price * Stock)
   - Ordenação: Calculado em pipeline
   - Uso: Dashboard
   - **Índice necessário:** `{ Price: 1, Stock: 1 }` (composto pode ajudar)

8. **CountByCategoryAsync** - Agregação por categoria
   - Agrupa por: `CategoryId`
   - Uso: Dashboard
   - **Índice necessário:** `{ CategoryId: 1 }`

9. **ValueByCategoryAsync** - Soma valor por categoria
   - Agrupa por: `CategoryId`
   - Uso: Dashboard
   - **Índice necessário:** `{ CategoryId: 1 }`

---

### **Orders Collection**

#### Queries Identificadas:
1. **ListByUserAsync** - Lista pedidos do usuário
   - Filtro: `UserId` (Eq)
   - Ordenação: `CreatedAtUtc` (descendente)
   - Uso: Histórico de pedidos
   - **Índice necessário:** Composto `{ UserId: 1, CreatedAtUtc: -1 }`

2. **ListAllAsync** - Lista todos os pedidos
   - Filtro: Nenhum
   - Ordenação: `CreatedAtUtc` (descendente)
   - Uso: Admin dashboard
   - **Índice necessário:** `{ CreatedAtUtc: -1 }`

---

### **Categories Collection**

#### Queries Identificadas:
1. **GetByIdAsync** - Busca por ID
   - Filtro: `Id` (Eq)
   - Uso: Busca individual
   - **Índice necessário:** Já existe (`_id`)

2. **GetByIdsAsync** - Busca múltiplos IDs
   - Filtro: `Id` IN (array)
   - Uso: Enriquecimento de dados
   - **Índice necessário:** Já existe (`_id`)

---

## ✅ Índices Propostos

### **Products:**
1. `{ Name: "text" }` - Text index para busca por nome (Regex)
2. `{ CategoryId: 1 }` - Índice simples para filtros por categoria
3. `{ Stock: 1 }` - Índice para filtros de estoque baixo
4. `{ Price: 1 }` - Índice para filtros de preço
5. `{ CategoryId: 1, Name: 1 }` - Índice composto para busca comum
6. `{ Price: 1, Stock: 1 }` - Índice composto para ordenação por valor

### **Orders:**
1. `{ UserId: 1, CreatedAtUtc: -1 }` - Índice composto para busca por usuário ordenada
2. `{ CreatedAtUtc: -1 }` - Índice para ordenação geral

### **Categories:**
- Nenhum adicional necessário (usa `_id` que já existe)

---

## 🎯 Prioridade de Implementação

### **Alta Prioridade (Impacto Imediato):**
1. Products: `{ CategoryId: 1 }` - Usado em várias queries
2. Products: `{ Stock: 1 }` - Dashboard usa muito
3. Orders: `{ UserId: 1, CreatedAtUtc: -1 }` - Histórico de pedidos

### **Média Prioridade:**
4. Products: `{ Name: "text" }` - Melhora busca por nome
5. Products: `{ Price: 1 }` - Dashboard gráficos
6. Orders: `{ CreatedAtUtc: -1 }` - Admin dashboard

### **Baixa Prioridade (Otimização):**
7. Products: `{ CategoryId: 1, Name: 1 }` - Otimização adicional
8. Products: `{ Price: 1, Stock: 1 }` - Otimização adicional

---

## 📝 Implementação

**Arquivo:** `backend/KitCerto.Infrastructure/Data/MongoContext.cs`

**Estratégia:**
- Criar índices de forma assíncrona (background: true)
- Tratar erros silenciosamente (índices já existem)
- Criar apenas índices de alta/média prioridade inicialmente
- Monitorar performance após implementação

---

## ⚠️ Considerações

1. **Text Index vs Regex:**
   - Text index é mais rápido que Regex
   - Mas Text index requer busca diferente (não é case-insensitive por padrão)
   - Para manter Regex, podemos usar índice simples em `Name` (menos eficiente mas compatível)

2. **Índices Compostos:**
   - Ordem importa: `{ CategoryId: 1, Name: 1 }` ajuda queries que filtram por ambos
   - Mas não ajuda queries que filtram só por `Name`

3. **Background Index Creation:**
   - Criar índices em background não bloqueia operações
   - Mas pode demorar mais para criar

4. **Impacto em Escrita:**
   - Mais índices = mais lentidão em INSERT/UPDATE
   - Mas benefício em leitura compensa

---

## 🚀 Próximos Passos

1. ✅ Analisar queries (FEITO)
2. ⏳ Implementar índices de alta prioridade
3. ⏳ Rebuildar projeto
4. ⏳ Monitorar logs e performance
5. ⏳ Ajustar conforme necessário
