// Script de teste para verificar se o seed funciona
use('kitcerto');

// Teste 1: Verificar se as categorias foram criadas
print("=== TESTE 1: CATEGORIAS ===");
const categories = db.categories.find().toArray();
print(`Total de categorias: ${categories.length}`);
categories.forEach(cat => {
  print(`- ${cat._id}: ${cat.Name}`);
});

// Teste 2: Verificar se os produtos foram criados
print("\n=== TESTE 2: PRODUTOS ===");
const products = db.products.find().toArray();
print(`Total de produtos: ${products.length}`);
products.forEach(prod => {
  print(`- ${prod._id}: ${prod.Name} (Estoque: ${prod.Stock})`);
});

// Teste 3: Verificar consistência de dados
print("\n=== TESTE 3: CONSISTÊNCIA ===");
const invalidProducts = products.filter(p => 
  !p._id || !p.Name || p.Price < 0 || p.Stock < 0 || p.Quantity < 0
);
if (invalidProducts.length === 0) {
  print("✅ Todos os produtos têm dados válidos");
} else {
  print(`❌ ${invalidProducts.length} produtos com dados inválidos`);
}

// Teste 4: Verificar referências de categoria
print("\n=== TESTE 4: REFERÊNCIAS ===");
const categoryIds = categories.map(c => c._id);
const orphanProducts = products.filter(p => !categoryIds.includes(p.CategoryId));
if (orphanProducts.length === 0) {
  print("✅ Todos os produtos têm categorias válidas");
} else {
  print(`❌ ${orphanProducts.length} produtos com categorias inválidas`);
}

print("\n=== TESTE CONCLUÍDO ===");
