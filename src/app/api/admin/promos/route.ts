// File: src/app/api/admin/promos/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ promos });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil promo' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, minSpend } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Kode, tipe, dan nilai diskon wajib diisi' }, { status: 400 });
    }

    const newPromo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minSpend: minSpend ? parseFloat(minSpend) : 0.0,
      },
    });

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah promo' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID promo wajib diisi' }, { status: 400 });

    await prisma.promo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus promo' }, { status: 500 });
  }
}
