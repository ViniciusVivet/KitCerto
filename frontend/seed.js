use('kitcerto');
db.categories.deleteMany({});
db.products.deleteMany({});

const cats = [
  { Id: 'cat_cuban', Name: 'Correntes Cuban Cravejadas', Description: 'Correntes cubanas cravejadas com brilho premium' },
  { Id: 'cat_cuban_formats', Name: 'Correntes Cravejadas (formatos)', Description: 'Vários formatos cravejados: Figaro, Grumet, Miami' },
  { Id: 'cat_watches', Name: 'Relógios Cravejados', Description: 'Relógios com banho e cravação' },
  { Id: 'cat_bracelets', Name: 'Pulseiras', Description: 'Pulseiras cravejadas e lisas' },
  { Id: 'cat_rings', Name: 'Anéis', Description: 'Anéis com cravação e design street' },
  { Id: 'cat_accessories', Name: 'Acessórios Street', Description: 'Acessórios urbanos e moda streetwear' }
];
db.categories.insertMany(cats);

function D(x) { return NumberDecimal(x); }
const now = new Date();

const products = [
  { Id:'p_cuban_12mm', Name:'Corrente Cuban 12mm Cravejada', Description:'Banho a ouro 18k, micro cravação, fecho caixa', Price:D('1299.90'), CategoryId:'cat_cuban', Quantity:1, Stock:25, CreatedAtUtc:now },
  { Id:'p_cuban_8mm', Name:'Corrente Cuban 8mm Cravejada', Description:'Brilho intenso, estilo street premium', Price:D('899.90'), CategoryId:'cat_cuban', Quantity:1, Stock:40, CreatedAtUtc:now },
  { Id:'p_cuban_iced_box', Name:'Corrente Cuban Iced Box Clasp', Description:'Fecho caixa cravejado, acabamento espelhado', Price:D('1499.00'), CategoryId:'cat_cuban', Quantity:1, Stock:15, CreatedAtUtc:now },
  { Id:'p_figaro_iced', Name:'Corrente Figaro Cravejada', Description:'Formato figaro com cravação completa', Price:D('749.50'), CategoryId:'cat_cuban_formats', Quantity:1, Stock:35, CreatedAtUtc:now },
  { Id:'p_grumet_iced', Name:'Corrente Grumet Cravejada', Description:'Grumet com brilho, banho ouro 18k', Price:D('829.00'), CategoryId:'cat_cuban_formats', Quantity:1, Stock:28, CreatedAtUtc:now },
  { Id:'p_miami_iced', Name:'Corrente Miami Cuban Iced', Description:'Miami cuban cravejada, estilo trap', Price:D('1599.90'), CategoryId:'cat_cuban_formats', Quantity:1, Stock:12, CreatedAtUtc:now },
  { Id:'p_watch_iced_gold', Name:'Relógio Cravejado Gold', Description:'Maquinário quartzo, banho ouro, pulseira aço', Price:D('1999.00'), CategoryId:'cat_watches', Quantity:1, Stock:10, CreatedAtUtc:now },
  { Id:'p_watch_iced_silver', Name:'Relógio Cravejado Silver', Description:'Aço inox, brilho gelado, display analógico', Price:D('1699.00'), CategoryId:'cat_watches', Quantity:1, Stock:14, CreatedAtUtc:now },
  { Id:'p_watch_iced_bicolor', Name:'Relógio Cravejado Bicolor', Description:'Detalhes ouro/prata, bezel cravejado', Price:D('2199.90'), CategoryId:'cat_watches', Quantity:1, Stock:8, CreatedAtUtc:now },
  { Id:'p_bracelet_cuban', Name:'Pulseira Cuban Cravejada', Description:'Pulseira estilo cuban com micro cravação', Price:D('499.90'), CategoryId:'cat_bracelets', Quantity:1, Stock:50, CreatedAtUtc:now },
  { Id:'p_bracelet_tennis', Name:'Pulseira Tennis', Description:'Cravação linear, brilho contínuo', Price:D('559.00'), CategoryId:'cat_bracelets', Quantity:1, Stock:45, CreatedAtUtc:now },
  { Id:'p_ring_iced_square', Name:'Anel Cravejado Quadrado', Description:'Design imponente, pedra central', Price:D('389.00'), CategoryId:'cat_rings', Quantity:1, Stock:60, CreatedAtUtc:now },
  { Id:'p_ring_iced_round', Name:'Anel Cravejado Redondo', Description:'Cravação circular, acabamento premium', Price:D('349.90'), CategoryId:'cat_rings', Quantity:1, Stock:55, CreatedAtUtc:now },
  { Id:'p_accessory_grillz', Name:'Grillz Cravejado', Description:'Acessório dental removível cravejado', Price:D('299.00'), CategoryId:'cat_accessories', Quantity:1, Stock:30, CreatedAtUtc:now },
  { Id:'p_accessory_pendant_cross', Name:'Pingente Cruz Cravejado', Description:'Pingente com cravação e banho ouro', Price:D('229.90'), CategoryId:'cat_accessories', Quantity:1, Stock:70, CreatedAtUtc:now }
];

db.products.insertMany(products);
