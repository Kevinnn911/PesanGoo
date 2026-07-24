// File: src/app/(customer)/order/[id]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSocket } from '@/lib/socketClient';
import { CheckCircle2, Clock, Utensils, ArrowLeft, QrCode, CreditCard, RefreshCw, ChefHat, Bike, Check } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  menuItem: {
    name: string;
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  createdAt: string;
  table: {
    tableNumber: string;
  };
  items: OrderItem[];
  payments: {
    qrCodeUrl?: string | null;
  }[];
}

const statusSteps = [
  { key: 'PENDING_PAYMENT', label: 'Menunggu Bayar', icon: Clock },
  { key: 'PAID', label: 'Terbayar', icon: CheckCircle2 },
  { key: 'QUEUE_KITCHEN', label: 'Antrean Dapur', icon: ChefHat },
  { key: 'COOKING', label: 'Sedang Dimasak', icon: Utensils },
  { key: 'READY', label: 'Siap Diantar', icon: Bike },
  { key: 'DELIVERING', label: 'Diantar', icon: Bike },
  { key: 'COMPLETED', label: 'Selesai', icon: Check },
];

export default function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const socket = getSocket();
    socket.on('order:status_updated', (updatedOrder: OrderDetail) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.off('order:status_updated');
    };
  }, [orderId]);

  const handleSimulateQrisPayment = async () => {
    try {
      setIsSimulatingPayment(true);
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          transactionStatus: 'PAID',
          gatewayRef: `MOCK-QRIS-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchOrder();
      } else {
        alert(data.error || 'Gagal mensimulasikan pembayaran');
      }
    } catch (err) {
      alert('Error mensimulasikan pembayaran QRIS');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-[#781215] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Memuat status pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-[#781215]">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">ID pesanan tidak valid atau sudah dihapus.</p>
        <Link href="/" className="bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl btn-press">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;
  const qrUrl = order.payments?.[0]?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PESENGO-QRIS-${order.id}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 max-w-xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-6 bg-white border border-slate-200/80 rounded-[28px] shadow-sm">
        <Link href="/" className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-[#781215] hover:border-[#781215]/30 transition-all btn-press shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Status Pesanan Real-time</span>
          <span className="text-sm font-extrabold text-[#781215]">{order.orderNumber}</span>
        </div>
      </div>

      {/* Status Headline Card */}
      <div className="bg-white border border-slate-200 rounded-[28px] p-6 mb-6 text-center shadow-sm animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-[#781215]/10 border border-[#781215]/20 text-[#781215] text-xs font-extrabold px-4 py-1.5 rounded-full mb-4">
          {order.table.tableNumber}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {order.status === 'PENDING_PAYMENT' && 'Menunggu Pembayaran'}
          {order.status === 'PAID' && 'Pembayaran Berhasil!'}
          {order.status === 'QUEUE_KITCHEN' && 'Masuk Antrean Dapur'}
          {order.status === 'COOKING' && 'Sedang Dimasak oleh Chef'}
          {order.status === 'READY' && 'Pesanan Siap Diantar!'}
          {order.status === 'DELIVERING' && 'Runner Sedang Mengantar'}
          {order.status === 'COMPLETED' && 'Pesanan Selesai'}
          {order.status === 'CANCELLED' && 'Pesanan Dibatalkan'}
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          Halaman ini otomatis memperbarui status pesanan Anda tanpa perlu refresh.
        </p>
      </div>

      {/* QRIS Payment Box */}
      {order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'QRIS' && (
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 mb-6 text-center space-y-5 shadow-sm animate-slide-up">
          <div className="flex items-center justify-center gap-2 text-[#781215] text-sm font-extrabold">
            <QrCode className="w-5 h-5" />
            <span>Pindai QRIS di Bawah Ini</span>
          </div>

          <div className="bg-white p-4 rounded-3xl w-52 h-52 mx-auto shadow-inner border border-slate-100">
            <Image src={qrUrl} alt="Kode QRIS" width={200} height={200} className="w-full h-full object-contain" />
          </div>

          <div className="text-sm text-slate-600">
            Total: <strong className="text-[#781215] text-xl">Rp {order.total.toLocaleString('id-ID')}</strong>
          </div>

          <button
            onClick={handleSimulateQrisPayment}
            disabled={isSimulatingPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 btn-press"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSimulatingPayment ? 'Memproses...' : 'Simulasi Bayar QRIS (Bayar Sekarang)'}</span>
          </button>
        </div>
      )}

      {/* Cashier Payment Instructions */}
      {order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'KASIR' && (
        <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-6 mb-6 text-center space-y-3 animate-slide-up">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-sm font-extrabold text-amber-800">Silakan Bayar di Kasir</h3>
          <p className="text-xs text-slate-600">
            Sebutkan nomor pesanan <strong className="text-slate-900">{order.orderNumber}</strong> atau nomor meja{' '}
            <strong className="text-slate-900">{order.table.tableNumber}</strong> kepada petugas kasir.
          </p>
        </div>
      )}

      {/* Visual Timeline Tracker */}
      <div className="bg-white border border-slate-200 rounded-[28px] p-6 mb-6 space-y-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progres Pesanan</h3>

        <div className="space-y-1">
          {statusSteps.map((step, idx) => {
            const isDone = idx <= activeStep && order.status !== 'CANCELLED';
            const isCurrent = idx === activeStep && order.status !== 'CANCELLED';
            const IconComp = step.icon;

            return (
              <div key={step.key} className="flex items-center gap-4 py-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-[#781215] text-white shadow-lg shadow-[#781215]/30 animate-pulse-ring'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isCurrent ? 'text-[#781215]' : isDone ? 'text-slate-800' : 'text-slate-300'}`}>
                    {step.label}
                  </p>
                </div>
                {isDone && !isCurrent && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Item Summary */}
      <div className="bg-white border border-slate-200 rounded-[28px] p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rincian Item</h3>

        <div className="space-y-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between text-sm">
              <div>
                <span className="font-semibold text-slate-900">
                  {item.menuItem.name} <span className="text-slate-400">x{item.quantity}</span>
                </span>
                {item.notes && <p className="text-xs text-amber-600 italic mt-0.5">{item.notes}</p>}
              </div>
              <span className="font-bold text-slate-900 tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%)</span>
            <span>Rp {order.tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Service (5%)</span>
            <span>Rp {order.serviceCharge.toLocaleString('id-ID')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Diskon Promo</span>
              <span>- Rp {order.discount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-3">
            <span>Total</span>
            <span className="text-[#781215]">Rp {order.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
