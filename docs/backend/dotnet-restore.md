# 📦 Guia Completo: `dotnet restore` - Quando e Por Que Usar

## 🎯 O Que É `dotnet restore`?

`dotnet restore` é o comando que **baixa e instala** todos os pacotes NuGet declarados nos seus arquivos `.csproj`.

**Analogia simples:**
- `.csproj` = lista de compras 📝
- `dotnet restore` = ir ao mercado e comprar tudo 🛒
- Código = usar o que você comprou ✅

---

## 🔍 Como Funciona?

### **1. Você Declara no `.csproj`**

```xml
<ItemGroup>
  <PackageReference Include="MongoDB.Driver" Version="2.25.0" />
  <PackageReference Include="Microsoft.Extensions.Http" Version="9.0.0" />
</ItemGroup>
```

Isso significa: "Eu quero usar esses pacotes"

### **2. Você Roda `dotnet restore`**

```powershell
dotnet restore
```

O que acontece:
1. Lê todos os `.csproj` do projeto
2. Vai ao NuGet.org (repositório de pacotes)
3. Baixa os pacotes declarados
4. Salva em `~/.nuget/packages` (cache local)
5. Cria arquivos de "lock" (`project.assets.json`)

### **3. Agora Você Pode Usar**

```csharp
using MongoDB.Driver;  // ✅ Funciona!
using Microsoft.Extensions.Http;  // ✅ Funciona!
```

---

## ⏰ Quando Usar `dotnet restore`?

### **✅ SEMPRE Use Nestas Situações:**

#### **1. Quando Clonar um Projeto Novo**

```powershell
git clone https://github.com/seu-projeto.git
cd seu-projeto
dotnet restore  # ← PRIMEIRA COISA A FAZER!
```

**Por quê?** O Git não baixa os pacotes, só o código. Você precisa restaurar.

#### **2. Quando Adicionar um Pacote Novo**

```powershell
# Você adicionou manualmente no .csproj:
<PackageReference Include="NovoPacote" Version="1.0.0" />

# Agora precisa restaurar:
dotnet restore
```

**Por quê?** O IDE precisa saber que o pacote existe.

#### **3. Quando Mudar de Máquina/IDE**

```powershell
# Você abriu o projeto em outro computador
dotnet restore  # ← Baixa os pacotes nesta máquina
```

**Por quê?** Cada máquina precisa ter os pacotes localmente.

#### **4. Quando o IDE Mostra Erros de "Não Encontrado"**

```powershell
# Erro: "The type or namespace name 'MongoDB' could not be found"
dotnet restore  # ← Resolve na maioria dos casos
```

**Por quê?** O IDE não encontrou os pacotes.

#### **5. Quando Atualizar Versões de Pacotes**

```xml
<!-- Você mudou de versão no .csproj -->
<PackageReference Include="MongoDB.Driver" Version="2.26.0" />
```

```powershell
dotnet restore  # ← Baixa a nova versão
```

---

## ❌ Quando NÃO Precisa Usar?

### **1. Quando Usa `dotnet build` ou `dotnet run`**

Esses comandos **já fazem restore automaticamente**:

```powershell
dotnet build    # ← Faz restore automaticamente se necessário
dotnet run      # ← Faz restore automaticamente se necessário
```

**Mas atenção:** O IDE pode não fazer isso automaticamente!

### **2. Quando os Pacotes Já Estão Restaurados**

Se você acabou de rodar `dotnet restore`, não precisa rodar de novo imediatamente.

**Como saber se precisa?**
- Se o IDE mostra erros de "não encontrado" → precisa
- Se você mudou o `.csproj` → precisa
- Se mudou de máquina → precisa

---

## 🔄 Fluxo Completo de Desenvolvimento

### **Cenário 1: Projeto Novo**

```powershell
# 1. Clonar projeto
git clone ...

# 2. Restaurar pacotes
cd projeto
dotnet restore

# 3. Compilar
dotnet build

# 4. Rodar
dotnet run
```

### **Cenário 2: Adicionar Pacote Novo**

```powershell
# Opção A: Via CLI (recomendado)
dotnet add package MongoDB.Driver --version 2.25.0
# ← Já faz restore automaticamente!

# Opção B: Manualmente no .csproj
# 1. Editar .csproj e adicionar <PackageReference>
# 2. Rodar restore
dotnet restore
```

### **Cenário 3: IDE Mostrando Erros**

```powershell
# 1. Restaurar pacotes
dotnet restore

# 2. Recarregar IDE
# Ctrl+Shift+P → "Reload Window"

# 3. Verificar se erro sumiu
```

---

## 🎓 Conceitos Importantes

### **O Que São Pacotes NuGet?**

São **bibliotecas prontas** escritas por outras pessoas/empresas que você pode usar.

**Exemplos:**
- `MongoDB.Driver` = conectar com MongoDB
- `Microsoft.AspNetCore.Mvc` = criar APIs web
- `Newtonsoft.Json` = trabalhar com JSON
- `Serilog` = fazer logs

### **Onde Ficam os Pacotes?**

**Cache Local:**
```
Windows: C:\Users\SEU_USUARIO\.nuget\packages\
Linux/Mac: ~/.nuget/packages/
```

**No Projeto:**
- Não ficam no projeto (só referências)
- Ficam no cache global
- Cada projeto referencia do cache

### **O Que É `project.assets.json`?**

Arquivo gerado pelo `dotnet restore` que lista **todas** as dependências (incluindo dependências de dependências).

**Exemplo:**
- Você pede: `MongoDB.Driver`
- Ele precisa de: `MongoDB.Bson`, `MongoDB.LibBSON`, etc.
- O `project.assets.json` lista tudo isso

---

## 🛠️ Comandos Relacionados

### **`dotnet restore`**
Baixa pacotes do NuGet.org

### **`dotnet add package NomePacote`**
Adiciona pacote E já faz restore:
```powershell
dotnet add package MongoDB.Driver --version 2.25.0
# ← Equivale a:
# 1. Adicionar no .csproj
# 2. dotnet restore
```

### **`dotnet remove package NomePacote`**
Remove pacote do `.csproj`:
```powershell
dotnet remove package MongoDB.Driver
```

### **`dotnet list package`**
Lista todos os pacotes instalados:
```powershell
dotnet list package
```

### **`dotnet clean`**
Limpa arquivos compilados (não remove pacotes):
```powershell
dotnet clean
dotnet restore  # ← Depois de clean, pode precisar restaurar
```

---

## 🐛 Problemas Comuns

### **Problema 1: "Package not found"**

**Causa:** Pacote não existe ou versão errada

**Solução:**
```powershell
# Verificar se pacote existe
# Acesse: https://www.nuget.org/packages/NomeDoPacote

# Verificar versão correta
dotnet list package
```

### **Problema 2: "Restore failed"**

**Causa:** Problema de rede ou cache corrompido

**Solução:**
```powershell
# Limpar cache
dotnet nuget locals all --clear

# Tentar restaurar novamente
dotnet restore
```

### **Problema 3: "IDE ainda mostra erro"**

**Causa:** IDE não atualizou

**Solução:**
1. `dotnet restore` (já rodou)
2. Recarregar IDE (`Ctrl+Shift+P` → "Reload Window")
3. Se não funcionar, fechar e abrir IDE

---

## 📊 No Seu Projeto KitCerto

### **Pacotes Principais:**

1. **MongoDB.Driver** (2.25.0)
   - Para conectar com MongoDB
   - Usado em: `MongoProductsRepo`, `MongoOrdersRepo`, etc.

2. **Microsoft.Extensions.Http** (9.0.0)
   - Para fazer requisições HTTP
   - Usado em: integrações externas

3. **AWSSDK.S3** (4.0.17.3)
   - Para trabalhar com AWS S3
   - Usado em: upload de arquivos

### **Quando Você Precisa Restaurar:**

✅ **Sempre que:**
- Clonar projeto em máquina nova
- Adicionar pacote novo
- IDE mostrar erros de "não encontrado"
- Mudar versão de pacote

❌ **Não precisa quando:**
- Já rodou recentemente
- Usa `dotnet build` ou `dotnet run` (fazem automaticamente)

---

## 💡 Dica de Ouro

**Sempre que tiver dúvida se precisa restaurar:**

```powershell
dotnet restore
```

**Não faz mal rodar várias vezes!** É rápido e garante que tudo está atualizado.

---

## 🎯 Resumo Rápido

| Situação | Precisa `dotnet restore`? |
|----------|---------------------------|
| Clonar projeto novo | ✅ SIM |
| Adicionar pacote novo | ✅ SIM |
| IDE mostra erro | ✅ SIM |
| Mudar versão de pacote | ✅ SIM |
| Usar `dotnet build` | ❌ NÃO (faz sozinho) |
| Usar `dotnet run` | ❌ NÃO (faz sozinho) |
| Já restaurou há pouco | ❌ NÃO |

---

## 🔗 Links Úteis

- **NuGet.org:** https://www.nuget.org/
- **Documentação:** https://learn.microsoft.com/dotnet/core/tools/dotnet-restore
- **Listar pacotes:** `dotnet list package`

---

**Lembre-se:** `dotnet restore` é como "instalar dependências" em outros projetos. Sem ele, o código não compila! 🚀
