// File: src/components/customer/ItemModal.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, FileText, ShoppingBag } from 'lucide-react';

export interface MenuItemData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  stock: number;
}

export interface CartItem {
  menuItem: MenuItemData;
  quantity: number;
  notes: string;
}

interface ItemModalProps {
  item: MenuItemData;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ItemModal({ item, onClose, onAddToCart }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAddToCart({
      menuItem: item,
      quantity,
      notes,
    });
    onClose();
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Image */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-100 flex-shrink-0 overflow-hidden">
          <Image
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md backdrop-blur-sm transition-all btn-press"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Price badge on image */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md">
            <span className="text-base font-extrabold text-[#781215]">
              Rp {item.price.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto no-scrollbar">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{item.name}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description || 'Menu lezat siap disajikan untuk Anda.'}</p>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#781215]" />
              Catatan Khusus
              <span className="text-slate-400 font-normal text-[10px]">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Misal: Tanpa daun bawang, Pedas Level 3..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#781215]"
            />
          </div>

          {/* Quantity Controls & Add Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-full overflow-hidden p-0.5">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-30 btn-press"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-sm font-extrabold text-slate-900 tabular-nums">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 transition-colors btn-press"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 ml-3 bg-[#781215] hover:bg-[#600e11] text-white font-bold text-xs py-3 px-5 rounded-full shadow-md shadow-[#781215]/25 transition-all flex items-center justify-between gap-2 btn-press"
            >
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Tambah
              </span>
              <span className="font-extrabold">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
