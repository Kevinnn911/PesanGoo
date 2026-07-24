// File: src/app/(dashboard)/dapur/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSocket } from '@/lib/socketClient';
import { ChefHat, Clock, Play, CheckCircle2, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

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

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());

  const fetchKitchenOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        const active = (data.orders || []).filter(
          (o: OrderData) => o.status === 'QUEUE_KITCHEN' || o.status === 'COOKING'
        );
        setOrders(active);
      }
    } catch (err) {
      console.error('Fetch kitchen orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    const timer = setInterval(() => setNow(new Date()), 10000);

    const socket = getSocket();
    socket.on('order:created', () => fetchKitchenOrders());
    socket.on('order:status_updated', () => fetchKitchenOrders());

    return () => {
      clearInterval(timer);
      socket.off('order:created');
      socket.off('order:status_updated');
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: 'COOKING' | 'READY') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        fetchKitchenOrders();
      } else {
        alert('Gagal mengosongkan status masakan');
      }
    } catch (err) {
      alert('Error mengupdate status masakan');
    }
  };

  const getElapsedTimeInMinutes = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / 60000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top KDS Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-b-[32px] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md shadow-slate-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#781215] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#781215]/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-500">Antrean Pesanan Dapur & Pengaturan Memasak Real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-[#781215]/10 text-[#781215] border border-[#781215]/20 text-xs font-black px-3.5 py-1.5 rounded-full">
            {orders.length} Pesanan Harus Dimasak
          </span>

          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all btn-press"
            title="Refresh"
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

      {/* Main KDS Grid */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-[28px] h-64"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-slate-400 bg-white border border-slate-200 rounded-[28px] p-6 shadow-xs">
            <ChefHat className="w-16 h-16 mx-auto mb-3 opacity-30 text-[#781215]" />
            <h3 className="text-lg font-extrabold text-slate-800">Antrean Dapur Bersih!</h3>
            <p className="text-xs text-slate-500 mt-1">Tidak ada pesanan yang perlu dimasak saat ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => {
              const elapsedMins = getElapsedTimeInMinutes(order.createdAt);
              const isLate = elapsedMins >= 10;
              const isCooking = order.status === 'COOKING';

              return (
                <div
                  key={order.id}
                  className={`rounded-[28px] p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                    isLate
                      ? 'bg-rose-50/80 border-[#781215] ring-4 ring-[#781215]/20'
                      : isCooking
                      ? 'bg-amber-50/80 border-amber-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#781215]">{order.table.tableNumber}</span>
                        <span className="text-xs font-bold text-slate-500">({order.orderNumber})</span>
                      </div>
                      <span className="text-xs text-slate-500">Pemesan: {order.customerName}</span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                          isLate
                            ? 'bg-[#781215] text-white border-[#781215] animate-pulse'
                            : 'bg-slate-100 text-amber-700 border-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsedMins} Menit</span>
                      </div>
                      {isLate && (
                        <p className="text-[10px] text-[#781215] font-extrabold flex items-center gap-1 justify-end mt-1">
                          <AlertTriangle className="w-3 h-3" /> Lewat SLA 10m!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Item List */}
                  <div className="space-y-2.5 flex-1 max-h-56 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-slate-900">{item.menuItem.name}</span>
                          <span className="bg-[#781215] text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                            x {item.quantity}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-amber-800 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                            CATATAN: {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100">
                    {!isCooking ? (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COOKING')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 btn-press"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Mulai Masak</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 btn-press"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai (Siap Diantar)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
