// File: src/components/customer/CheckoutModal.tsx

'use client';

import { useState } from 'react';
import { X, User, Phone, QrCode, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSubmit: (data: { customerName: string; customerPhone?: string; paymentMethod: 'QRIS' | 'KASIR' }) => void;
  isSubmitting: boolean;
  tableNumber: string;
  totalAmount: number;
}

export default function CheckoutModal({
  onClose,
  onSubmit,
  isSubmitting,
  tableNumber,
  totalAmount,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'KASIR'>('QRIS');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setNameError('Nama pemesan wajib diisi');
      return;
    }
    onSubmit({
      customerName,
      customerPhone,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-[28px] p-4 sm:p-5 shadow-2xl space-y-3.5 animate-scale-in max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Checkout</h3>
            <p className="text-[11px] text-slate-500">Konfirmasi identitas & metode pembayaran</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all btn-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Table & Total Summary */}
          <div className="bg-gradient-to-r from-[#781215] to-[#9a1a1e] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between text-white shadow-sm shadow-[#781215]/20">
            <div>
              <span className="text-[10px] font-medium text-white/70 block">Nomor Meja</span>
              <span className="text-base font-extrabold">{tableNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-white/70 block">Total Tagihan</span>
              <span className="text-lg font-extrabold">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1">
              <User className="w-3.5 h-3.5 text-[#781215]" />
              Nama Pemesan <span className="text-[#781215]">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setNameError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#781215]"
            />
            {nameError && <p className="text-[10px] text-[#781215] font-semibold ml-3">{nameError}</p>}
          </div>

          {/* Customer Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1">
              <Phone className="w-3.5 h-3.5 text-[#781215]" />
              No. WhatsApp / HP
              <span className="text-slate-400 font-normal text-[10px]">(Opsional)</span>
            </label>
            <input
              type="tel"
              placeholder="0812xxxxxxx"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#781215]"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block ml-1">Metode Pembayaran</label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all btn-press ${
                  paymentMethod === 'QRIS'
                    ? 'bg-[#781215]/5 border-[#781215] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                  paymentMethod === 'QRIS' ? 'bg-[#781215]/10 text-[#781215]' : 'bg-slate-100 text-slate-400'
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold ${paymentMethod === 'QRIS' ? 'text-[#781215]' : 'text-slate-600'}`}>QRIS Dinamis</span>
                <span className="text-[9px] text-slate-400">GoPay, OVO, ShopeePay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('KASIR')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all btn-press ${
                  paymentMethod === 'KASIR'
                    ? 'bg-[#781215]/5 border-[#781215] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                  paymentMethod === 'KASIR' ? 'bg-[#781215]/10 text-[#781215]' : 'bg-slate-100 text-slate-400'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold ${paymentMethod === 'KASIR' ? 'text-[#781215]' : 'text-slate-600'}`}>Bayar di Kasir</span>
                <span className="text-[9px] text-slate-400">Tunai / Debit / EDC</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-2 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Pesanan langsung diproses ke dapur setelah dikonfirmasi.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#781215] hover:bg-[#600e11] text-white font-bold text-xs py-3 px-5 rounded-full shadow-md shadow-[#781215]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-press"
          >
            <span>{isSubmitting ? 'Membuat Pesanan...' : 'Konfirmasi & Kirim Pesanan'}</span>
            {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
