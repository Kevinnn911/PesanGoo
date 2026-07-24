// File: src/app/page.tsx

import Link from 'next/link';
import { Utensils, QrCode, Shield, ChefHat, Bike, Receipt, ArrowRight, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const sampleTables = [
    { number: 'Meja 01', token: 'TBL-01-TOKEN' },
    { number: 'Meja 02', token: 'TBL-02-TOKEN' },
    { number: 'Meja 03', token: 'TBL-03-TOKEN' },
    { number: 'Meja 04', token: 'TBL-04-TOKEN' },
    { number: 'Meja 05', token: 'TBL-05-TOKEN' },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#781215]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#781215]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Pesan<span className="text-[#781215]">Go</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mt-4">
            Sistem pemesanan restoran mandiri via QR Code, integrasi QRIS dinamis, Kitchen Display System, dan dashboard operasional terpadu.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['QR Code Scan', 'QRIS Payment', 'Real-time KDS', 'Multi-role RBAC'].map((f) => (
              <span key={f} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* QR Table Simulator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-lg shadow-slate-200/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#781215]/10 text-[#781215] rounded-2xl flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Simulasi Scan QR Meja</h2>
              <p className="text-xs text-slate-500">Klik meja untuk membuka halaman pemesanan pelanggan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {sampleTables.map((tbl) => (
              <Link
                key={tbl.token}
                href={`/table/${tbl.token}`}
                className="group flex flex-col items-center justify-center p-5 bg-slate-50 hover:bg-[#781215] border border-slate-200 hover:border-[#781215] rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#781215]/20 btn-press"
              >
                <QrCode className="w-8 h-8 text-[#781215] group-hover:text-white transition-colors mb-2" />
                <span className="font-extrabold text-sm text-slate-900 group-hover:text-white transition-colors">{tbl.number}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white/70 flex items-center gap-1 mt-1.5 font-medium transition-colors">
                  Buka Menu <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Dashboard Links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Dashboard Staf</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              href: '/kasir',
              icon: Receipt,
              iconBg: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
              title: 'Dashboard Kasir',
              desc: 'Konfirmasi pembayaran, cetak struk thermal, batalkan pesanan.',
            },
            {
              href: '/dapur',
              icon: ChefHat,
              iconBg: 'bg-amber-50',
              iconColor: 'text-amber-600',
              title: 'Kitchen KDS',
              desc: 'Antrean dapur real-time, timer masak, dan status kontrol.',
            },
            {
              href: '/runner',
              icon: Bike,
              iconBg: 'bg-blue-50',
              iconColor: 'text-blue-600',
              title: 'Dashboard Runner',
              desc: 'Daftar pesanan siap antar dan nomor meja tujuan.',
            },
            {
              href: '/admin',
              icon: Shield,
              iconBg: 'bg-purple-50',
              iconColor: 'text-purple-600',
              title: 'Dashboard Admin',
              desc: 'Menu, QR meja, pengguna RBAC, laporan PDF/Excel.',
            },
          ].map((card) => {
            const IconComp = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#781215]/30 p-5 rounded-[24px] text-left transition-all shadow-sm hover:shadow-lg btn-press"
              >
                <div className={`p-3 ${card.iconBg} ${card.iconColor} rounded-2xl w-fit mb-4 border border-white`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#781215] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>PesenGo PWA v1.0 &mdash; Smart Restaurant Platform</span>
          </div>
          <Link href="/login" className="text-[#781215] font-bold hover:underline">
            Login Staf
          </Link>
        </div>
      </footer>
    </main>
  );
}
