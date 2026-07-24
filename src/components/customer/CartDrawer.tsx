// File: src/components/customer/CartDrawer.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartItem } from './ItemModal';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  appliedPromo: string | null;
  onApplyPromo: (code: string | null) => void;
  onClose: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  taxRate: number;
  serviceRate: number;
}

export default function CartDrawer({
  cart,
  appliedPromo,
  onApplyPromo,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  taxRate,
  serviceRate,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState(appliedPromo || '');
  const [promoError, setPromoError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // Dynamic discount calculation so quantity updates automatically recalculate the discount
  let discountAmount = 0;
  if (appliedPromo === 'KEVINGANTENG') {
    discountAmount = (subtotal * 99) / 100;
  } else if (appliedPromo === 'MOSAC10') {
    if (subtotal >= 200000) {
      discountAmount = (subtotal * 10) / 100;
    }
  } else if (appliedPromo === 'VIP50K') {
    if (subtotal >= 300000) {
      discountAmount = 50000;
    }
  }

  const handleApplyPromo = () => {
    setPromoError(null);
    if (!promoCode.trim()) return;

    const code = promoCode.trim().toUpperCase();
    if (code === 'KEVINGANTENG') {
      onApplyPromo('KEVINGANTENG');
    } else if (code === 'MOSAC10') {
      if (subtotal < 200000) {
        setPromoError('Min. transaksi Rp 200.000 untuk MOSAC10');
        return;
      }
      onApplyPromo('MOSAC10');
    } else if (code === 'VIP50K') {
      if (subtotal < 300000) {
        setPromoError('Min. transaksi Rp 300.000 untuk VIP50K');
        return;
      }
      onApplyPromo('VIP50K');
    } else {
      setPromoError('Kode promo tidak valid');
    }
  };

  const tax = Math.round((subtotal - discountAmount) * (taxRate / 100));
  const serviceCharge = Math.round((subtotal - discountAmount) * (serviceRate / 100));
  const total = Math.max(0, subtotal - discountAmount + tax + serviceCharge);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-scale-in border border-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#781215]/10 text-[#781215] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Keranjang Belanja</h2>
              <p className="text-[11px] text-slate-500">{cart.length} pesanan dipilih</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all btn-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">Keranjang Anda masih kosong</p>
              <p className="text-[10px] mt-0.5">Pilih menu favorit Anda untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3 flex flex-col gap-2.5 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Item Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      <Image
                        src={item.menuItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                        alt={item.menuItem.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.menuItem.name}</h4>
                      <p className="text-[11px] font-extrabold text-[#781215] mt-0.5">
                        Rp {item.menuItem.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-slate-400 hover:text-[#781215] p-1.5 hover:bg-rose-50 rounded-full transition-all btn-press flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-[10px] text-amber-700 italic bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                      Catatan: {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <div className="flex items-center bg-white border border-slate-200 rounded-full overflow-hidden p-0.5 shadow-2xs">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors btn-press"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors btn-press"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo & Total Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/90 backdrop-blur-sm p-4 sm:p-5 space-y-3 flex-shrink-0">
            {/* Promo Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Kode Promo (cth: KEVINGANTENG)"
                    value={promoCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPromoCode(val);
                      if (val.trim() === '' && appliedPromo) {
                        onApplyPromo(null);
                        setPromoError(null);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-2 text-xs text-slate-900 uppercase placeholder:normal-case transition-all focus:outline-none focus:border-[#781215]"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors btn-press"
                >
                  Pakai
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Promo {appliedPromo} berhasil digunakan!
                </p>
              )}
              {promoError && <p className="text-[10px] text-[#781215] font-bold ml-1">{promoError}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1 text-xs border-t border-slate-200/80 pt-2.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Promo</span>
                  <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Pajak ({taxRate}%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service ({serviceRate}%)</span>
                <span>Rp {serviceCharge.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200/80 pt-2 mt-1">
                <span>Total Tagihan</span>
                <span className="text-[#781215]">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full bg-[#781215] hover:bg-[#600e11] text-white font-bold text-xs py-3 px-5 rounded-full shadow-md shadow-[#781215]/25 transition-all flex items-center justify-center gap-2 btn-press"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
