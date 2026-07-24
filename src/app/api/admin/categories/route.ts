// File: src/app/api/admin/categories/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const defaultOutlet = await prisma.outlet.findFirst();
    if (!defaultOutlet) {
      return NextResponse.json({ error: 'Outlet tidak ditemukan' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        outletId: defaultOutlet.id,
        name,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID kategori wajib diisi' }, { status: 400 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
