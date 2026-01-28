// Script de Seed Seguro (UTF-8)
// Execute com: docker compose -f infra/docker-compose.yml exec -T mongo mongosh kitcerto < frontend/seed_fixed.js

db.categories.deleteMany({});
db.categories.insertMany([
  { _id: "cat-1", Name: "Camisetas", Description: "Camisetas exclusivas e personalizadas" },
  { _id: "cat-2", Name: "Cal\u00e7as", Description: "Cal\u00e7as de diversos estilos" },
  { _id: "cat-3", Name: "Bones", Description: "Bon\u00e9s e acess\u00f3rios para cabe\u00e7a" },
  { _id: "cat-4", Name: "Rel\u00f3gios", Description: "Rel\u00f3gios de luxo e casuais" },
  { _id: "cat-5", Name: "Correntes", Description: "Correntes e colares premium" },
  { _id: "cat-6", Name: "Pulseiras", Description: "Pulseiras e braceletes" },
  { _id: "cat-7", Name: "An\u00e9is", Description: "An\u00e9is e joias finas" },
  { _id: "cat-8", Name: "Moletom", Description: "Moletons e agasalhos" },
  { _id: "cat-9", Name: "Shorts", Description: "Shorts e bermudas" },
  { _id: "cat-10", Name: "Touca", Description: "Toucas e gorrros" },
  { _id: "cat-11", Name: "Brincos", Description: "Brincos e piercings" },
  { _id: "cat-12", Name: "Oculos", Description: "\u00d3culos de sol e arma\u00e7\u00f5es" }
]);

print("Seed de categorias conclu\u00eddo com sucesso!");
