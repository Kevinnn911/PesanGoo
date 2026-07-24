// File: src/app/(customer)/table/[token]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import CustomerApp from '@/components/customer/CustomerApp';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TableInfo {
  id: string;
  tableNumber: string;
  qrToken: string;
  outletId: string;
  outletName: string;
  taxRate: number;
  serviceRate: number;
}

export default function TablePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  useEffect(() => {
    async function validateTable() {
      try {
        setLoading(true);
        const res = await fetch(`/api/table/validate?token=${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setError(data.error || 'QR Code meja tidak valid atau kedaluwarsa');
          return;
        }

        setTableInfo(data.table);
      } catch (err) {
        setError('Gagal menghubungkan ke server. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      validateTable();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-medium">Memindai QR Code & Memuat Menu...</p>
      </div>
    );
  }

  if (error || !tableInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl mb-4 max-w-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-rose-400">QR Code Tidak Valid</h2>
          <p className="text-xs text-slate-300 mt-1">{error}</p>
        </div>
        <p className="text-xs text-slate-400">Silakan minta bantuan staf restoran untuk memindai ulang QR Code meja Anda.</p>
      </div>
    );
  }

  return <CustomerApp tableInfo={tableInfo} />;
}
