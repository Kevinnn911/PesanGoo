// File: prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RestoQ Database...');

  // 1. Create Outlet
  const outlet = await prisma.outlet.upsert({
    where: { id: 'outlet-pusat-01' },
    update: {},
    create: {
      id: 'outlet-pusat-01',
      name: 'Mie Gacoan Pusat Surabaya',
      address: 'Jl. Pemuda No. 88, Surabaya',
      phone: '0812-3456-7890',
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
      name: 'Manager Restoran',
      username: 'admin',
      email: 'admin@gacoan.id',
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
      email: 'kasir@gacoan.id',
      passwordHash: kasirPassword,
      role: 'KASIR',
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'dapur' },
    update: {},
    create: {
      name: 'Chef Dapur',
      username: 'dapur',
      email: 'dapur@gacoan.id',
      passwordHash: dapurPassword,
      role: 'DAPUR',
      outletId: outlet.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'runner' },
    update: {},
    create: {
      name: 'Runner Pengantar',
      username: 'runner',
      email: 'runner@gacoan.id',
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

  // 4. Create Categories
  const catMie = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Mie Pedas', sortOrder: 1 },
  });
  const catDimsum = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Dimsum Lezat', sortOrder: 2 },
  });
  const catMinuman = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Minuman Segar', sortOrder: 3 },
  });
  const catEkstra = await prisma.category.create({
    data: { outletId: outlet.id, name: 'Ekstra & Toping', sortOrder: 4 },
  });

  // 5. Create Menu Items
  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: catMie.id,
        name: 'Mie Suit',
        description: 'Mie gurih tidak pedas dengan taburan ayam cincang & pangsit renyah',
        price: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 100,
      },
      {
        categoryId: catMie.id,
        name: 'Mie Hompimpa',
        description: 'Mie gurih pedas asin dengan tingkat level pedas 1 - 8',
        price: 10500,
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 150,
      },
      {
        categoryId: catMie.id,
        name: 'Mie Gacoan',
        description: 'Mie manis gurih pedas khas Mie Gacoan favorit level 1 - 8',
        price: 10500,
        imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 200,
      },
      {
        categoryId: catDimsum.id,
        name: 'Siomay Dimsum (4 pcs)',
        description: 'Siomay olahan daging ayam empuk disajikan panas',
        price: 9500,
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 80,
      },
      {
        categoryId: catDimsum.id,
        name: 'Udang Keju (3 pcs)',
        description: 'Dimsum olahan udang berlapis keju meleleh gurih',
        price: 10500,
        imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 90,
      },
      {
        categoryId: catDimsum.id,
        name: 'Udang Rambutan (3 pcs)',
        description: 'Bola udang renyah dengan baluran mie krispi menyerupai rambutan',
        price: 10500,
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 75,
      },
      {
        categoryId: catDimsum.id,
        name: 'Pangsit Goreng (3 pcs)',
        description: 'Pangsit renyah isian ayam gurih dengan saus asam manis',
        price: 9500,
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 120,
      },
      {
        categoryId: catMinuman.id,
        name: 'Es Gobak Sodor',
        description: 'Es buah segar dengan paduan jelly, buah tropical, dan cincau',
        price: 9000,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 100,
      },
      {
        categoryId: catMinuman.id,
        name: 'Es Tekek',
        description: 'Es segar manis perpaduan sirup khas dan rasa buah',
        price: 7000,
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 100,
      },
      {
        categoryId: catMinuman.id,
        name: 'Es Sluku Bathok',
        description: 'Es susu creamy nikmat dan menyegarkan',
        price: 7000,
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 80,
      },
      {
        categoryId: catEkstra.id,
        name: 'Kerupuk Pangsit Extra',
        description: 'Tambahan kerupuk pangsit renyah guriih 1 porsi',
        price: 3000,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        stock: 200,
      },
    ],
  });

  // 6. Create Promos
  await prisma.promo.upsert({
    where: { code: 'GACOAN10' },
    update: {},
    create: {
      code: 'GACOAN10',
      discountType: 'PERCENTAGE',
      discountValue: 10.0,
      minSpend: 30000,
      isActive: true,
    },
  });

  await prisma.promo.upsert({
    where: { code: 'DISKON5K' },
    update: {},
    create: {
      code: 'DISKON5K',
      discountType: 'FIXED',
      discountValue: 5000,
      minSpend: 25000,
      isActive: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
