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
  { _id:'p_1', Name:'Relógio Esmeralda Clássic Cravejado', Description:'Relógio clássico cravejado com detalhes esmeralda. Banhado a ouro, caixa cravejada de strass e pulseira de aço inox.', Price:D('249.95'), CategoryId:'cat_relogio', Quantity:0, Stock:12, CreatedAtUtc:now },
  { _id:'p_2', Name:'Corrente Spike', Description:'Corrente modelo Spike com pingentes pontiagudos. Acabamento banhado a ouro 18k, estilo street e hip-hop.', Price:D('124.95'), CategoryId:'cat_corrente', Quantity:0, Stock:20, CreatedAtUtc:now },
  { _id:'p_3', Name:'Corrente Miami Dourada', Description:'Corrente Miami Cuban Link banhada a ouro 18k. Alta durabilidade e brilho intenso, ideal para o estilo street.', Price:D('149.95'), CategoryId:'cat_corrente', Quantity:0, Stock:18, CreatedAtUtc:now },
  { _id:'p_4', Name:'Corrente Poças', Description:'Corrente modelo Poças com elos arredondados e acabamento espelhado. Banhada a ouro 18k.', Price:D('99.95'), CategoryId:'cat_corrente', Quantity:0, Stock:25, CreatedAtUtc:now },
  { _id:'p_5', Name:'Brinco de Pérola', Description:'Brinco com pérola sintética de alta qualidade. Peça clássica e elegante, perfeita para qualquer ocasião.', Price:D('44.95'), CategoryId:'cat_brinco', Quantity:0, Stock:30, CreatedAtUtc:now },
  { _id:'p_6', Name:'Corrente Ninepac Elegante', Description:'Corrente Ninepac com design elegante e acabamento premium. Banhada a prata 925, ideal para looks sofisticados.', Price:D('174.95'), CategoryId:'cat_corrente', Quantity:0, Stock:14, CreatedAtUtc:now },
  { _id:'p_7', Name:'Corrente Miami Cravejada', Description:'Corrente Miami Cuban Link totalmente cravejada com strass. Banhada a ouro 18k, máximo brilho e estilo.', Price:D('199.95'), CategoryId:'cat_corrente', Quantity:0, Stock:10, CreatedAtUtc:now },
  { _id:'p_8', Name:'Relógio Desert Clássic Cravejado', Description:'Relógio Desert com mostrador clássico e caixa cravejada. Pulseira de aço com acabamento champagne, estilo luxo.', Price:D('274.95'), CategoryId:'cat_relogio', Quantity:0, Stock:8, CreatedAtUtc:now },
  { _id:'p_9', Name:'Relógio Clássic Cravejado Cyclop', Description:'Relógio clássico com lente Cyclop cravejada de strass. Design inspirado nos grandes clássicos, reinterpretado com brilho street.', Price:D('224.95'), CategoryId:'cat_relogio', Quantity:0, Stock:15, CreatedAtUtc:now }
];

db.products.insertMany(products);
