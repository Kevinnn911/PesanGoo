// File: scripts/setup-supabase.js

const { execSync } = require('child_process');

console.log('====================================================');
console.log('RestoQ (PesenGo) - Supabase Database Setup Helper');
console.log('====================================================\n');

try {
  console.log('1. Pushing Prisma Schema to Supabase PostgreSQL...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('\n2. Seeding initial outlet, menu, tables, and staff users to Supabase...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('SUCCESS! Database Supabase berhasil dikoneksikan & di-seed!');
  console.log('Aplikasi RestoQ PesenGo siap diakses dari mana saja!');
  console.log('====================================================');
} catch (error) {
  console.error('\nERROR: Gagal menghubungkan ke Supabase.');
  console.error('Pastikan DATABASE_URL pada file .env sudah diisi dengan benar.');
}
