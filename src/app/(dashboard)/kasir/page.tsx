// File: src/app/(dashboard)/kasir/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSocket } from '@/lib/socketClient';
import { printThermalReceipt } from '@/lib/thermalPrinter';
import { Receipt, CheckCircle2, XCircle, Printer, Filter, LogOut, RefreshCw, DollarSign, Utensils, AlertCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  menuItem: { name: string };
}

interface OrderData {
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
  cancelReason?: string | null;
  table: { tableNumber: string };
  items: OrderItem[];
}

export default function KasirDashboard() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const [cancellingOrder, setCancellingOrder] = useState<OrderData | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch cashier orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();

    socket.on('order:created', (newOrder: OrderData) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    socket.on('order:status_updated', (updatedOrder: OrderData) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    });

    return () => {
      socket.off('order:created');
      socket.off('order:status_updated');
    };
  }, []);

  const handleConfirmCashPayment = async (orderId: string) => {
    if (!confirm('Konfirmasi pembayaran tunai untuk pesanan ini?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Gagal mengonfirmasi pembayaran');
      }
    } catch (err) {
      alert('Error mengonfirmasi pembayaran');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder || !cancelReason.trim()) {
      alert('Alasan pembatalan wajib diisi');
      return;
    }
    try {
      setIsSubmittingCancel(true);
      const res = await fetch(`/api/orders/${cancellingOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancelReason,
        }),
      });

      if (res.ok) {
        setCancellingOrder(null);
        setCancelReason('');
        fetchOrders();
      } else {
        alert('Gagal membatalkan pesanan');
      }
    } catch (err) {
      alert('Error membatalkan pesanan');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handlePrintReceipt = (order: OrderData) => {
    printThermalReceipt({
      orderNumber: order.orderNumber,
      tableNumber: order.table.tableNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
        notes: i.notes,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      serviceCharge: order.serviceCharge,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      outletName: 'Mosac Fine Dining',
      outletAddress: 'Jl. Senopati No. 45, Jakarta Selatan',
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return o.status === 'PENDING_PAYMENT';
    if (selectedFilter === 'ACTIVE') return ['PAID', 'QUEUE_KITCHEN', 'COOKING', 'READY', 'DELIVERING'].includes(o.status);
    if (selectedFilter === 'COMPLETED') return o.status === 'COMPLETED';
    if (selectedFilter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const totalOmzetHariIni = orders
    .filter((o) => o.status !== 'CANCELLED' && o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const totalPendingCash = orders.filter((o) => o.status === 'PENDING_PAYMENT' && o.paymentMethod === 'KASIR').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-b-[32px] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md shadow-slate-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#781215] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#781215]/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Dashboard Kasir PesenGo</h1>
            <p className="text-xs text-slate-500">Konfirmasi Pembayaran & Cetak Struk Real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Omzet Hari Ini</span>
              <span className="text-sm font-black text-emerald-600">
                Rp {totalOmzetHariIni.toLocaleString('id-ID')}
              </span>
            </div>
            {totalPendingCash > 0 && (
              <span className="bg-[#781215] text-white text-[11px] font-bold px-2.5 py-1 rounded-full animate-bounce shadow-sm">
                {totalPendingCash} Pending Bayar
              </span>
            )}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all btn-press"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-[#781215]/10 hover:bg-[#781215]/20 text-[#781215] border border-[#781215]/20 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all btn-press"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'ALL', label: 'Semua Pesanan' },
            { key: 'PENDING', label: `Pending Bayar (${orders.filter((o) => o.status === 'PENDING_PAYMENT').length})` },
            { key: 'ACTIVE', label: 'Sedang Diproses' },
            { key: 'COMPLETED', label: 'Selesai' },
            { key: 'CANCELLED', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all btn-press ${
                selectedFilter === tab.key
                  ? 'bg-[#781215] text-white shadow-md shadow-[#781215]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-[28px] h-56"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-[28px] shadow-xs">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#781215]" />
            <p className="text-sm font-bold text-slate-600">Tidak ada pesanan pada kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white border ${
                  order.status === 'PENDING_PAYMENT'
                    ? 'border-amber-400 ring-4 ring-amber-400/15'
                    : 'border-slate-200'
                } rounded-[28px] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{order.orderNumber}</span>
                      <span className="bg-[#781215]/10 text-[#781215] border border-[#781215]/20 text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                        {order.table.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pelanggan: <strong className="text-slate-800">{order.customerName}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      order.status === 'PENDING_PAYMENT'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : order.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-50 text-[#781215] border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 flex-1 max-h-36 overflow-y-auto pr-1 text-xs">
                  {order.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-start text-slate-700">
                      <div>
                        <span>
                          {i.menuItem.name} x <strong>{i.quantity}</strong>
                        </span>
                        {i.notes && <p className="text-[10px] text-amber-700 italic">Note: {i.notes}</p>}
                      </div>
                      <span className="font-bold">Rp {i.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                {/* Totals & Payment Info */}
                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      Metode: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                    </span>
                    <span className="text-base font-black text-[#781215]">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {order.cancelReason && (
                    <p className="text-[11px] text-[#781215] bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                      Alasan Batal: {order.cancelReason}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {order.status === 'PENDING_PAYMENT' && (
                      <button
                        onClick={() => handleConfirmCashPayment(order.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 btn-press"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Bayar</span>
                      </button>
                    )}

                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold p-2.5 rounded-2xl border border-slate-200 transition-colors btn-press"
                      title="Cetak Struk Thermal"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="bg-rose-50 hover:bg-rose-100 text-[#781215] text-xs font-bold p-2.5 rounded-2xl border border-rose-200 transition-colors btn-press"
                        title="Batalkan Transaksi"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-extrabold text-slate-900">Pembatalan Transaksi</h3>
            <p className="text-xs text-slate-600">
              Batalkan pesanan <strong className="text-[#781215]">{cancellingOrder.orderNumber}</strong> ({cancellingOrder.table.tableNumber}).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Alasan Pembatalan <span className="text-[#781215]">*</span>
              </label>
              <textarea
                placeholder="Masukkan alasan pembatalan (misal: Pelanggan batal pesan, item stok habis)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancelReason('');
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-200 transition-colors btn-press"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2.5 bg-[#781215] text-white text-xs font-extrabold rounded-2xl hover:bg-[#600e11] shadow-md transition-all btn-press"
              >
                {isSubmittingCancel ? 'Membatalkan...' : 'Konfirmasi Batal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
