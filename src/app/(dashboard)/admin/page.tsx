// File: src/app/(dashboard)/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { exportToExcel, exportToPDF, ReportItem } from '@/lib/exportReports';
import {
  Shield,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  QrCode,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Tag,
  Settings,
  Utensils,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENU' | 'TABLES' | 'USERS' | 'PROMOS' | 'REPORTS'>('OVERVIEW');

  const [reportSummary, setReportSummary] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [reportOrders, setReportOrders] = useState<any[]>([]);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');

  const [tables, setTables] = useState<any[]>([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState('4');

  const [users, setUsers] = useState<any[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('KASIR');

  const [promos, setPromos] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState('PERCENTAGE');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoMin, setNewPromoMin] = useState('0');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'OVERVIEW' || activeTab === 'REPORTS') {
        const res = await fetch('/api/admin/reports?range=month');
        const data = await res.json();
        if (res.ok) {
          setReportSummary(data.summary);
          setTopItems(data.topItems);
          setReportOrders(data.orders);
        }
      }

      if (activeTab === 'MENU') {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories || []);
          const all = (data.categories || []).flatMap((c: any) => c.menuItems);
          setMenuItems(all);
        }
      }

      if (activeTab === 'TABLES') {
        const res = await fetch('/api/admin/tables');
        const data = await res.json();
        if (res.ok) setTables(data.tables || []);
      }

      if (activeTab === 'USERS') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (res.ok) setUsers(data.users || []);
      }

      if (activeTab === 'PROMOS') {
        const res = await fetch('/api/admin/promos');
        const data = await res.json();
        if (res.ok) setPromos(data.promos || []);
      }
    } catch (e) {
      console.error('Fetch admin data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || !newMenuPrice || !newMenuCategory) return;
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMenuName,
          price: newMenuPrice,
          categoryId: newMenuCategory,
          description: newMenuDesc,
        }),
      });
      if (res.ok) {
        setNewMenuName('');
        setNewMenuPrice('');
        setNewMenuDesc('');
        fetchData();
      }
    } catch (e) {
      alert('Gagal menambah menu');
    }
  };

  const handleToggleMenuAvailability = async (item: any) => {
    try {
      await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
      });
      fetchData();
    } catch (e) {
      alert('Gagal memperbarui ketersediaan');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum) return;
    const res = await fetch('/api/admin/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber: `Meja ${newTableNum}`, capacity: newTableCap }),
    });
    if (res.ok) {
      setNewTableNum('');
      fetchData();
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Hapus meja ini?')) return;
    await fetch(`/api/admin/tables?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserPassword) return;
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUserName,
        username: newUserUsername,
        password: newUserPassword,
        role: newUserRole,
      }),
    });
    if (res.ok) {
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      fetchData();
    } else {
      const d = await res.json();
      alert(d.error || 'Gagal menambah user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Hapus pengguna ini?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newPromoCode,
        discountType: newPromoType,
        discountValue: newPromoValue,
        minSpend: newPromoMin,
      }),
    });
    if (res.ok) {
      setNewPromoCode('');
      setNewPromoValue('');
      fetchData();
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return;
    await fetch(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleExportPDF = () => {
    const reports: ReportItem[] = reportOrders.map((o) => ({
      orderNumber: o.orderNumber,
      tableNumber: o.table.tableNumber,
      customerName: o.customerName,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    }));
    exportToPDF(reports, 'Bulan Ini');
  };

  const handleExportExcel = () => {
    const reports: ReportItem[] = reportOrders.map((o) => ({
      orderNumber: o.orderNumber,
      tableNumber: o.table.tableNumber,
      customerName: o.customerName,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    }));
    exportToExcel(reports, 'Bulan Ini');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col sm:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full sm:w-64 bg-white border-b sm:border-b-0 sm:border-r border-slate-200 p-4 sm:p-5 space-y-4 sm:space-y-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between sm:justify-start gap-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#781215] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#781215]/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">PesenGo Admin</h2>
              <p className="text-[10px] text-slate-500">Panel Kelola Restoran</p>
            </div>
          </div>
        </div>

        <nav className="flex sm:flex-col overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0">
          {[
            { key: 'OVERVIEW', label: 'Ringkasan Analytics', icon: TrendingUp },
            { key: 'MENU', label: 'Manajemen Menu', icon: Utensils },
            { key: 'TABLES', label: 'Manajemen Meja & QR', icon: QrCode },
            { key: 'USERS', label: 'Pengguna & Role (RBAC)', icon: Users },
            { key: 'PROMOS', label: 'Voucher & Promo', icon: Tag },
            { key: 'REPORTS', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`whitespace-nowrap flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all btn-press ${
                  isActive
                    ? 'bg-[#781215] text-white shadow-md shadow-[#781215]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[#781215]/10 text-[#781215] hover:bg-[#781215]/20 border border-[#781215]/20 rounded-2xl text-xs font-bold transition-all btn-press"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Ringkasan Performa & Analytics</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-xs">
                <span className="text-xs text-slate-500 font-bold block mb-1">Total Omzet (Bulan Ini)</span>
                <span className="text-2xl font-black text-[#781215]">
                  Rp {reportSummary?.totalRevenue?.toLocaleString('id-ID') || 0}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-xs">
                <span className="text-xs text-slate-500 font-bold block mb-1">Total Transaksi</span>
                <span className="text-2xl font-black text-emerald-600">
                  {reportSummary?.totalTransactions || 0} Pesanan
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-xs">
                <span className="text-xs text-slate-500 font-bold block mb-1">Metode QRIS vs Kasir</span>
                <span className="text-base font-black text-slate-800">
                  QRIS: {reportSummary?.qrisCount || 0} | Kasir: {reportSummary?.kasirCount || 0}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-xs">
                <span className="text-xs text-slate-500 font-bold block mb-1">Rata-rata Nilai Pesanan</span>
                <span className="text-xl font-black text-amber-600">
                  Rp {reportSummary?.averageOrderValue?.toLocaleString('id-ID') || 0}
                </span>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900">5 Menu Terlaris</h3>
              <div className="space-y-3">
                {topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#781215] text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 block">
                        Terjual: {item.quantity} Porsi
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Total Rp {item.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Menu & Stok</h2>

            {/* Form Add Menu */}
            <form onSubmit={handleAddMenu} className="bg-white border border-slate-200 p-6 rounded-[28px] space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-[#781215]">+ Tambah Menu Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nama Menu"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Harga (Rp)"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <select
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Deskripsi singkat menu"
                value={newMenuDesc}
                onChange={(e) => setNewMenuDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
              />
              <button
                type="submit"
                className="bg-[#781215] hover:bg-[#600e11] text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-sm btn-press transition-all"
              >
                Simpan Menu
              </button>
            </form>

            {/* Menu List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] font-black text-[#781215]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-[#781215]'
                      }`}
                    >
                      {item.isAvailable ? 'Tersedia' : 'Stok Habis'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMenuAvailability(item)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 btn-press transition-all"
                    >
                      Toggle Stok
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item.id)}
                      className="text-[#781215] hover:text-[#600e11] p-1.5 btn-press"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TABLES & QR */}
        {activeTab === 'TABLES' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Meja & QR Code</h2>

            {/* Add Table Form */}
            <form onSubmit={handleAddTable} className="bg-white border border-slate-200 p-5 rounded-[28px] flex gap-3 shadow-xs">
              <input
                type="text"
                placeholder="Nomor Meja (misal: 11)"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
              />
              <button type="submit" className="bg-[#781215] text-white text-xs font-bold px-5 py-2.5 rounded-2xl btn-press shadow-sm">
                + Tambah Meja
              </button>
            </form>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tables.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200 p-5 rounded-[24px] text-center space-y-3 shadow-xs hover:shadow-md transition-all">
                  <h4 className="font-extrabold text-slate-900">{t.tableNumber}</h4>
                  {t.qrDataUrl && (
                    <div className="bg-white p-2 rounded-2xl inline-block border border-slate-200 shadow-inner">
                      <Image src={t.qrDataUrl} alt="QR Code" width={100} height={100} />
                    </div>
                  )}
                  <div className="flex justify-center gap-2">
                    <a
                      href={t.qrDataUrl}
                      download={`${t.tableNumber}-QR.png`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 transition-all btn-press"
                    >
                      Unduh QR
                    </a>
                    <button onClick={() => handleDeleteTable(t.id)} className="text-[#781215] p-1.5 btn-press">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS (RBAC) */}
        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengguna & Hak Akses (RBAC)</h2>

            <form onSubmit={handleAddUser} className="bg-white border border-slate-200 p-6 rounded-[28px] space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-[#781215]">+ Tambah Akun Staf Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                >
                  <option value="KASIR">Kasir</option>
                  <option value="DAPUR">Dapur (KDS)</option>
                  <option value="RUNNER">Runner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="bg-[#781215] text-white text-xs font-bold px-5 py-2.5 rounded-2xl btn-press shadow-sm">
                Simpan User
              </button>
            </form>

            <div className="space-y-2.5">
              {users.map((u) => (
                <div key={u.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{u.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">(@{u.username})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#781215]/10 text-[#781215] text-[10px] font-black px-3 py-1 rounded-full border border-[#781215]/20">
                      {u.role}
                    </span>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-[#781215] btn-press">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROMOS */}
        {activeTab === 'PROMOS' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Voucher & Promo</h2>

            <form onSubmit={handleAddPromo} className="bg-white border border-slate-200 p-6 rounded-[28px] space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Kode (cth: DISKON10)"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 uppercase"
                />
                <select
                  value={newPromoType}
                  onChange={(e) => setNewPromoType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
                <input
                  type="number"
                  placeholder="Nilai (10 / 5000)"
                  value={newPromoValue}
                  onChange={(e) => setNewPromoValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Min Spend (Rp)"
                  value={newPromoMin}
                  onChange={(e) => setNewPromoMin(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900"
                />
              </div>
              <button type="submit" className="bg-[#781215] text-white text-xs font-bold px-5 py-2.5 rounded-2xl btn-press shadow-sm">
                + Tambah Promo
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promos.map((p) => (
                <div key={p.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-extrabold text-[#781215] text-sm">{p.code}</h4>
                    <p className="text-xs text-slate-800">
                      Diskon: {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `Rp ${p.discountValue}`}
                    </p>
                    <p className="text-[10px] text-slate-500">Min Spend: Rp {p.minSpend.toLocaleString('id-ID')}</p>
                  </div>
                  <button onClick={() => handleDeletePromo(p.id)} className="text-[#781215] btn-press">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & EXPORT */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Laporan Penjualan & Ekspor</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 bg-[#781215] hover:bg-[#600e11] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm btn-press transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ekspor PDF</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm btn-press transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[28px] p-6 space-y-4 overflow-x-auto shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">No. Order</th>
                    <th className="p-3.5">Meja</th>
                    <th className="p-3.5">Pelanggan</th>
                    <th className="p-3.5">Metode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right rounded-r-xl">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {reportOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900">{o.orderNumber}</td>
                      <td className="p-3.5">{o.table.tableNumber}</td>
                      <td className="p-3.5">{o.customerName}</td>
                      <td className="p-3.5">{o.paymentMethod}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-[#781215]">
                        Rp {o.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
