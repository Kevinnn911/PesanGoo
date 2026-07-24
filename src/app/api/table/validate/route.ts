// File: src/app/api/table/validate/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token meja tidak ditemukan' }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { qrToken: token },
      include: { outlet: true },
    });

    if (!table) {
      return NextResponse.json({ valid: false, error: 'Meja tidak ditemukan atau QR Code tidak valid' }, { status: 444 });
    }

    return NextResponse.json({
      valid: true,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        qrToken: table.qrToken,
        outletId: table.outletId,
        outletName: table.outlet.name,
        taxRate: table.outlet.taxRate,
        serviceRate: table.outlet.serviceRate,
      },
    });
  } catch (error) {
    console.error('Table validation error:', error);
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
