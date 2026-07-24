// File: src/app/api/orders/[id]/status/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socketEmitter';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, cancelReason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID dan status wajib diisi' }, { status: 400 });
    }

    const validStatuses = [
      'PENDING_PAYMENT',
      'PAID',
      'QUEUE_KITCHEN',
      'COOKING',
      'READY',
      'DELIVERING',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status pesanan tidak valid' }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const updateData: any = { status };

    if (status === 'PAID') {
      updateData.paymentStatus = 'PAID';
      // Automatically advance to QUEUE_KITCHEN
      updateData.status = 'QUEUE_KITCHEN';
    }

    if (status === 'CANCELLED') {
      if (!cancelReason) {
        return NextResponse.json({ error: 'Alasan pembatalan wajib diisi' }, { status: 400 });
      }
      updateData.cancelReason = cancelReason;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
        payments: true,
      },
    });

    // Update payment record if status was updated to PAID
    if (status === 'PAID') {
      await prisma.payment.updateMany({
        where: { orderId: id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });
    }

    // Broadcast WebSocket event (non-blocking)
    emitSocketEvent('order:status_updated', updatedOrder);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}
