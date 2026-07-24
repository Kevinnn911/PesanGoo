// File: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mosac Fine Dining Database (Fixing Image URLs)...');

  // 1. Create Outlet
  const outlet = await prisma.outlet.upsert({
    where: { id: 'outlet-pusat-01' },
    update: {
      name: 'Mosac Fine Dining',
      address: 'Jl. Senopati No. 45, Jakarta Selatan',
      phone: '021-555-8899',
    },
    create: {
      id: 'outlet-pusat-01',
      name: 'Mosac Fine Dining',
      address: 'Jl. Senopati No. 45, Jakarta Selatan',
      phone: '021-555-8899',
      taxRate: 10.0,
      serviceRate: 5.0,
    },
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const kasirPassword = await bcrypt.hash('kasir123', 10);
  const dapurPassword = await bcrypt.hash('dapur123', 10);
  const runnerPassword = await bcrypt.hash('runner123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Manager Mosac',
      username: 'admin',
      email: 'admin@mosac.id',
      passwordHash: passwordHash,
      role: 'ADMIN',
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      name: 'Kasir Utama',
      username: 'kasir',
      email: 'kasir@mosac.id',
      passwordHash: kasirPassword,
      role: 'KASIR',
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'dapur' },
    update: {},
    create: {
      name: 'Executive Chef',
      username: 'dapur',
      email: 'chef@mosac.id',
      passwordHash: dapurPassword,
      role: 'DAPUR',
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'runner' },
    update: {},
    create: {
      name: 'Sommelier & Runner',
      username: 'runner',
      email: 'runner@mosac.id',
      passwordHash: runnerPassword,
      role: 'RUNNER',
      outletId: outlet.id,
    },
  });

  // 3. Create Tables
  for (let i = 1; i <= 10; i++) {
    const tableNum = i < 10 ? `0${i}` : `${i}`;
    await prisma.table.upsert({
      where: { qrToken: `TBL-${tableNum}-TOKEN` },
      update: {},
      create: {
        outletId: outlet.id,
        tableNumber: `Meja ${tableNum}`,
        qrToken: `TBL-${tableNum}-TOKEN`,
        capacity: 4,
        status: 'AVAILABLE',
      },
    });
  }

  // Clear existing items & categories to re-seed clean
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});

  // 4. Create Categories
  const catStarters = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Appetizers & Starters', sortOrder: 1 },
  });
  const catMains = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Main Courses', sortOrder: 2 },
  });
  const catDesserts = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Signature Desserts', sortOrder: 3 },
  });
  const catDrinks = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Artisanal Drinks', sortOrder: 4 },
  });

  // 5. Create Menu Items (6 Verified Items per Category)
  await prisma.menuItem.createMany({
    data: [
      // --- KATEGORI 1: Appetizers & Starters (6 Opsi) ---
      {
        categoryId: catStarters.id,
        name: 'Hokkaido Scallop Carpaccio',
        description: 'Fresh Hokkaido scallops, citrus ponzu reduction, caviar, and microgreens',
        price: 145000,
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 50,
      },
      {
        categoryId: catStarters.id,
        name: 'Foie Gras Poêlé',
        description: 'Pan-seared duck liver, artisanal brioche toast, and caramelized fig compote',
        price: 195000,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 30,
      },
      {
        categoryId: catStarters.id,
        name: 'French Onion Soup Gratinée',
        description: 'Rich caramelized onion broth topped with toasted baguette and melted Gruyère cheese',
        price: 95000,
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 40,
      },
      {
        categoryId: catStarters.id,
        name: 'Truffle Burrata & Heirloom',
        description: 'Creamy Italian burrata, heirloom tomatoes, 12-year aged balsamic reduction, and fresh basil oil',
        price: 135000,
        imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 45,
      },
      {
        categoryId: catStarters.id,
        name: 'Wagyu Beef Tartare',
        description: 'Hand-cut A5 Wagyu beef, cured egg yolk, capers, shallots, and toasted sourdough crostini',
        price: 165000,
        imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 35,
      },
      {
        categoryId: catStarters.id,
        name: 'Lobster Bisque Velouté',
        description: 'Velvety Maine lobster broth, Cognac infusion, poached lobster meat, and chive oil',
        price: 125000,
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 40,
      },

      // --- KATEGORI 2: Main Courses (6 Opsi) ---
      {
        categoryId: catMains.id,
        name: 'Wagyu A5 Striploin Steak 200g',
        description: 'Japanese A5 Wagyu striploin, black truffle butter, pomme purée & rich red wine jus reduction',
        price: 480000,
        imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 40,
      },
      {
        categoryId: catMains.id,
        name: 'Pan-Seared Duck Confit',
        description: 'Slow-cooked duck leg with crispy skin, dark cherry reduction, and roasted garlic potato purée',
        price: 220000,
        imageUrl: 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 35,
      },
      {
        categoryId: catMains.id,
        name: 'Atlantic Salmon en Croûte',
        description: 'Fresh Atlantic salmon wrapped in golden puff pastry with spinach and herb butter sauce',
        price: 260000,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 45,
      },
      {
        categoryId: catMains.id,
        name: 'Truffle Mushroom Risotto',
        description: 'Arborio rice cooked in rich vegetable stock with wild forest mushrooms and shaved black truffle',
        price: 175000,
        imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 60,
      },
      {
        categoryId: catMains.id,
        name: 'Grilled Chilean Sea Bass',
        description: 'Pan-roasted Chilean sea bass, saikyo miso glaze, baby bok choy, and dashi reduction',
        price: 340000,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 30,
      },
      {
        categoryId: catMains.id,
        name: 'Rack of Lamb Provençale',
        description: 'Herb-crusted roasted New Zealand lamb rack, ratatouille tartlet, and rosemary garlic jus',
        price: 390000,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 25,
      },

      // --- KATEGORI 3: Signature Desserts (6 Opsi) ---
      {
        categoryId: catDesserts.id,
        name: 'Valrhona Chocolate Lava Cake',
        description: 'Warm molten French Valrhona dark chocolate cake served with Madagascar vanilla bean gelato',
        price: 110000,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 50,
      },
      {
        categoryId: catDesserts.id,
        name: 'Madagascar Vanilla Crème Brûlée',
        description: 'Rich custard base infused with real vanilla bean, topped with a crisp layer of caramelized sugar',
        price: 85000,
        imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 50,
      },
      {
        categoryId: catDesserts.id,
        name: 'Classic Mille-Feuille Vanilla',
        description: 'Flaky caramelized puff pastry layers filled with delicate vanilla diplomat cream and fresh berries',
        price: 95000,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 40,
      },
      {
        categoryId: catDesserts.id,
        name: 'Deconstructed Matchamisu',
        description: 'Uji Matcha espresso soaked ladyfingers, light mascarpone cream, and edible 24k gold leaf',
        price: 90000,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 45,
      },
      {
        categoryId: catDesserts.id,
        name: 'Artisanal Cheese Selection',
        description: 'Curated French & Italian cheeses served with natural honeycomb, organic grapes, and artisan crackers',
        price: 150000,
        imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 30,
      },
      {
        categoryId: catDesserts.id,
        name: 'Parisian Macaron Box (6 pcs)',
        description: 'Assorted hand-crafted macarons: Pistachio, Salted Caramel, Raspberry, Truffle, Dark Chocolate, Yuzu',
        price: 105000,
        imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 60,
      },

      // --- KATEGORI 4: Artisanal Drinks (6 Opsi) ---
      {
        categoryId: catDrinks.id,
        name: 'Mosac Signature Elixir',
        description: 'Artisanal passion fruit, French elderflower syrup, sparkling tonic water & dehydrated citrus',
        price: 65000,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 100,
      },
      {
        categoryId: catDrinks.id,
        name: 'Sparkling Yuzu Cold Brew',
        description: 'Single-origin Ethiopian cold brew coffee infused with Japanese Yuzu syrup and sparkling water',
        price: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 100,
      },
      {
        categoryId: catDrinks.id,
        name: 'Earl Grey Lavender Spritz',
        description: 'Brewed Earl Grey tea, French lavender honey, fresh lemon juice, and chilled sparkling soda',
        price: 60000,
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 90,
      },
      {
        categoryId: catDrinks.id,
        name: 'Matcha Cloud Oat Latte',
        description: 'Ceremonial grade Uji matcha, velvety oat milk foam, and organic agave nectar',
        price: 58000,
        imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 80,
      },
      {
        categoryId: catDrinks.id,
        name: 'Berry Hibiscus Infusion',
        description: 'Wild hibiscus tea, crushed fresh organic raspberries, mint leaves, and elderflower soda',
        price: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 90,
      },
      {
        categoryId: catDrinks.id,
        name: 'Smoked Cinnamon Espresso Tonic',
        description: 'Double shot espresso, aromatic smoked cinnamon stick, and Fever-Tree premium Indian tonic',
        price: 60000,
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 80,
      },
    ],
  });

  // 6. Create Promos
  await prisma.promo.upsert({
    where: { code: 'KEVINGANTENG' },
    update: {
      discountType: 'PERCENTAGE',
      discountValue: 99.0,
      minSpend: 0,
      isActive: true,
    },
    create: {
      code: 'KEVINGANTENG',
      discountType: 'PERCENTAGE',
      discountValue: 99.0,
      minSpend: 0,
      isActive: true,
    },
  });

  await prisma.promo.upsert({
    where: { code: 'MOSAC10' },
    update: {},
    create: {
      code: 'MOSAC10',
      discountType: 'PERCENTAGE',
      discountValue: 10.0,
      minSpend: 200000,
      isActive: true,
    },
  });

  await prisma.promo.upsert({
    where: { code: 'VIP50K' },
    update: {},
    create: {
      code: 'VIP50K',
      discountType: 'FIXED',
      discountValue: 50000,
      minSpend: 300000,
      isActive: true,
    },
  });

  console.log('Seeding Mosac (Fixing Image URLs) completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
