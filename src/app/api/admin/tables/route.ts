// File: src/app/api/admin/tables/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
      include: { outlet: true },
    });

    const tablesWithQR = await Promise.all(
      tables.map(async (table) => {
        const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/table/${table.qrToken}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl);
        return {
          ...table,
          qrUrl,
          qrDataUrl,
        };
      })
    );

    return NextResponse.json({ tables: tablesWithQR });
  } catch (error) {
    console.error('Fetch tables error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data meja' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableNumber, capacity, outletId } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Nomor meja wajib diisi' }, { status: 400 });
    }

    const defaultOutlet = await prisma.outlet.findFirst();
    const targetOutletId = outletId || defaultOutlet?.id;

    if (!targetOutletId) {
      return NextResponse.json({ error: 'Outlet tidak ditemukan' }, { status: 400 });
    }

    const qrToken = `TBL-${tableNumber.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString(36)}`;

    const newTable = await prisma.table.create({
      data: {
        tableNumber,
        capacity: capacity ? parseInt(capacity) : 4,
        qrToken,
        outletId: targetOutletId,
      },
    });

    return NextResponse.json({ success: true, table: newTable });
  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json({ error: 'Gagal membuat meja' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID meja wajib diisi' }, { status: 400 });
    }

    await prisma.table.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Meja berhasil dihapus' });
  } catch (error) {
    console.error('Delete table error:', error);
    return NextResponse.json({ error: 'Gagal menghapus meja' }, { status: 500 });
  }
}
