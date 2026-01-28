use('kitcerto');
db.categories.deleteMany({});
db.products.deleteMany({});

const cats = [
  // Roupas
  { _id: 'cat_camiseta', Name: 'Camiseta', Description: 'Camisetas casuais e streetwear' },
  { _id: 'cat_camisa', Name: 'Camisa', Description: 'Camisas sociais e casuais' },
  { _id: 'cat_regata', Name: 'Regata', Description: 'Regatas esportivas e casuais' },
  { _id: 'cat_moletom', Name: 'Moletom', Description: 'Moletons e Hoodies' },
  { _id: 'cat_jaqueta', Name: 'Jaqueta', Description: 'Jaquetas e Casacos' },
  { _id: 'cat_calca', Name: 'Calça', Description: 'Calças Jeans, Sarja e Jogger' },
  { _id: 'cat_shorts', Name: 'Shorts', Description: 'Shorts e Bermudas' },
  { _id: 'cat_conjunto', Name: 'Conjunto', Description: 'Conjuntos de roupas' },

  // Acessórios de Cabeça
  { _id: 'cat_bone', Name: 'Boné', Description: 'Bonés e Caps' },
  { _id: 'cat_touca', Name: 'Touca', Description: 'Toucas e Beanies' },
  { _id: 'cat_bucket', Name: 'Bucket Hat', Description: 'Chapéus estilo Bucket' },

  // Joias/Acessórios Premium
  { _id: 'cat_corrente', Name: 'Corrente', Description: 'Correntes e Colares' },
  { _id: 'cat_pingente', Name: 'Pingente', Description: 'Pingentes Cravejados' },
  { _id: 'cat_pulseira', Name: 'Pulseira', Description: 'Pulseiras' },
  { _id: 'cat_brinco', Name: 'Brinco', Description: 'Brincos' },
  { _id: 'cat_anel', Name: 'Anel', Description: 'Anéis' },
  { _id: 'cat_relogio', Name: 'Relógio', Description: 'Relógios Premium' },
  { _id: 'cat_piercing', Name: 'Piercing', Description: 'Piercings' },
  { _id: 'cat_grillz', Name: 'Grillz', Description: 'Grillz Cravejados' },

  // Outros
  { _id: 'cat_oculos', Name: 'Óculos', Description: 'Óculos de Sol e Armações' },
  { _id: 'cat_cinto', Name: 'Cinto', Description: 'Cintos' },
  { _id: 'cat_carteira', Name: 'Carteira', Description: 'Carteiras e Porta-cartões' },
  { _id: 'cat_meias', Name: 'Meias', Description: 'Meias' },
  { _id: 'cat_tenis', Name: 'Tênis', Description: 'Calçados e Tênis' },
  { _id: 'cat_chinelo', Name: 'Chinelo', Description: 'Chinelos e Sandálias' }
];
db.categories.insertMany(cats);

function D(x) { return NumberDecimal(x); }
const now = new Date();

const products = [
  { _id:'p_ex_1', Name:'Camiseta Oversized Neon', Description:'Camiseta 100% algodão premium', Price:D('129.90'), CategoryId:'cat_camiseta', Quantity:0, Stock:50, CreatedAtUtc:now },
  { _id:'p_ex_2', Name:'Corrente Cuban 12mm', Description:'Corrente cravejada banhada a ouro', Price:D('899.90'), CategoryId:'cat_corrente', Quantity:0, Stock:15, CreatedAtUtc:now },
  { _id:'p_ex_3', Name:'Relógio Iced Out', Description:'Relógio cravejado automático', Price:D('1499.00'), CategoryId:'cat_relogio', Quantity:0, Stock:10, CreatedAtUtc:now }
];

db.products.insertMany(products);
