// File: src/app/(dashboard)/runner/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socketClient';
import { Bike, CheckCircle2, RefreshCw, LogOut, Utensils } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  notes?: string | null;
  menuItem: { name: string };
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  table: { tableNumber: string };
  items: OrderItem[];
}

export default function RunnerDashboard() {
  const [readyOrders, setReadyOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        const ready = (data.orders || []).filter((o: OrderData) => o.status === 'READY' || o.status === 'DELIVERING');
        setReadyOrders(ready);
      }
    } catch (err) {
      console.error('Fetch runner orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();

    const socket = getSocket();
    socket.on('order:status_updated', () => fetchReadyOrders());
    socket.on('order:created', () => fetchReadyOrders());

    return () => {
      socket.off('order:status_updated');
      socket.off('order:created');
    };
  }, []);

  const handleDelivered = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        fetchReadyOrders();
      } else {
        alert('Gagal memperbarui status pengantaran');
      }
    } catch (err) {
      alert('Error memperbarui status');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-b-[32px] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md shadow-slate-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#781215] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#781215]/20">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Dashboard Runner PesenGo</h1>
            <p className="text-xs text-slate-500">Pengantar Makanan ke Meja Pelanggan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReadyOrders}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all btn-press"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-[#781215]/10 hover:bg-[#781215]/20 text-[#781215] border border-[#781215]/20 rounded-2xl transition-all btn-press"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 p-4 sm:p-6 max-w-xl mx-auto w-full space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-[28px] h-48"></div>
            ))}
          </div>
        ) : readyOrders.length === 0 ? (
          <div className="text-center py-24 text-slate-400 bg-white border border-slate-200 rounded-[28px] p-6 shadow-xs">
            <Bike className="w-16 h-16 mx-auto mb-3 opacity-30 text-[#781215]" />
            <h3 className="text-base font-extrabold text-slate-800">Semua Makanan Sudah Diantar!</h3>
            <p className="text-xs text-slate-500 mt-1">Tidak ada pesanan siap antar di dapur saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-[#781215] rounded-[28px] p-6 shadow-md space-y-4 flex flex-col justify-between transition-all hover:shadow-lg"
              >
                {/* Meja Badge Extra Large */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs text-[#781215] font-black uppercase tracking-wider block">
                      Tujuan Pengantaran
                    </span>
                    <h2 className="text-3xl font-black text-slate-900">{order.table.tableNumber}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">{order.orderNumber}</span>
                    <span className="text-xs text-slate-700 font-extrabold">{order.customerName}</span>
                  </div>
                </div>

                {/* Items checklist */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Menu yang Harus Diantar:</span>
                  {order.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center text-slate-800">
                      <span className="font-bold">• {i.menuItem.name}</span>
                      <span className="bg-[#781215]/10 text-[#781215] text-xs font-black px-2.5 py-0.5 rounded-lg border border-[#781215]/20">
                        x {i.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Confirm Delivered Button */}
                <button
                  onClick={() => handleDelivered(order.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 btn-press"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sudah Diantar ke Meja</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
