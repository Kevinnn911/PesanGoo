// File: src/app/api/payments/webhook/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketEmitter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionStatus, gatewayRef } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (transactionStatus === 'settlement' || transactionStatus === 'capture' || transactionStatus === 'PAID') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'QUEUE_KITCHEN',
        },
        include: {
          table: true,
          items: {
            include: { menuItem: true },
          },
        },
      });

      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'SUCCESS',
          gatewayRef: gatewayRef || `MOCK-GW-${Date.now()}`,
          paidAt: new Date(),
        },
      });

      // Notify WebSocket clients (non-blocking)
      emitSocketEvent('order:status_updated', updatedOrder);

      return NextResponse.json({ success: true, message: 'Pembayaran berhasil dikonfirmasi', order: updatedOrder });
    }

    return NextResponse.json({ success: true, message: 'Status webhook diterima' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Gagal memproses webhook' }, { status: 500 });
  }
}
