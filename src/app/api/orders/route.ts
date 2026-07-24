// File: src/app/api/orders/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketEmitter';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          table: true,
          outlet: true,
          items: {
            include: {
              menuItem: true,
            },
          },
          payments: true,
        },
      });

      if (!order) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableToken, customerName, customerPhone, paymentMethod, items, promoCode, notes } = body;

    if (!tableToken || !customerName || !items || !items.length) {
      return NextResponse.json({ error: 'Data pesanan tidak lengkap' }, { status: 400 });
    }

    // 1. Find table by token
    const table = await prisma.table.findUnique({
      where: { qrToken: tableToken },
      include: { outlet: true },
    });

    if (!table) {
      return NextResponse.json({ error: 'Meja tidak ditemukan' }, { status: 404 });
    }

    // 2. Calculate prices
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json({ error: `Menu ${menuItem?.name || ''} tidak tersedia` }, { status: 400 });
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal: itemSubtotal,
        notes: item.notes || null,
      });
    }

    // 3. Handle promo discount
    let discount = 0;
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode },
      });

      if (promo && promo.isActive && subtotal >= promo.minSpend) {
        if (promo.discountType === 'PERCENTAGE') {
          discount = (subtotal * promo.discountValue) / 100;
        } else {
          discount = promo.discountValue;
        }
      }
    }

    const tax = Math.round((subtotal - discount) * (table.outlet.taxRate / 100));
    const serviceCharge = Math.round((subtotal - discount) * (table.outlet.serviceRate / 100));
    const total = Math.max(0, subtotal - discount + tax + serviceCharge);

    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Status logic:
    // If paymentMethod is QRIS: PENDING_PAYMENT, UNPAID
    // If paymentMethod is KASIR: PENDING_PAYMENT, UNPAID
    const initialStatus = 'PENDING_PAYMENT';
    const paymentStatus = 'UNPAID';

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        outletId: table.outletId,
        customerName,
        customerPhone: customerPhone || null,
        status: initialStatus,
        paymentMethod,
        paymentStatus,
        subtotal,
        tax,
        serviceCharge,
        discount,
        total,
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    // Generate mock QRIS URL if QRIS selected
    let qrCodeUrl = null;
    if (paymentMethod === 'QRIS') {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=RESTOQ-QRIS-${newOrder.id}-${total}`;
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: newOrder.id,
        method: paymentMethod,
        status: 'PENDING',
        qrCodeUrl,
      },
    });

    // Notify Socket.IO server (non-blocking)
    emitSocketEvent('order:created', newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
      payment,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}
