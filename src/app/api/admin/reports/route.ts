// File: src/app/api/admin/reports/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today'; // today, week, month, all

    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const totalTransactions = orders.length;
    const qrisCount = orders.filter((o) => o.paymentMethod === 'QRIS').length;
    const kasirCount = orders.filter((o) => o.paymentMethod === 'KASIR').length;

    // Top selling items aggregation
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.menuItem.name;
        if (!itemMap[name]) {
          itemMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemMap[name].quantity += item.quantity;
        itemMap[name].revenue += item.subtotal;
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTransactions,
        qrisCount,
        kasirCount,
        averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
      },
      topItems: topItems.slice(0, 5),
      orders,
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Gagal mengambil laporan' }, { status: 500 });
  }
}
