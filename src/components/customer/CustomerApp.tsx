// File: src/components/customer/CustomerApp.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ItemModal, { MenuItemData, CartItem } from './ItemModal';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import { Search, ShoppingBag, Utensils, AlertCircle } from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  menuItems: MenuItemData[];
}

interface TableInfo {
  id: string;
  tableNumber: string;
  qrToken: string;
  outletId: string;
  outletName: string;
  taxRate: number;
  serviceRate: number;
}

export default function CustomerApp({ tableInfo }: { tableInfo: TableInfo }) {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Cart state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (c) => c.menuItem.id === newItem.menuItem.id && c.notes === newItem.notes
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prevCart, newItem];
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (checkoutData: {
    customerName: string;
    customerPhone?: string;
    paymentMethod: 'QRIS' | 'KASIR';
  }) => {
    try {
      setIsSubmittingOrder(true);
      const payload = {
        tableToken: tableInfo.qrToken,
        customerName: checkoutData.customerName,
        customerPhone: checkoutData.customerPhone,
        paymentMethod: checkoutData.paymentMethod,
        promoCode: appliedPromo || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
          notes: c.notes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal membuat pesanan');
        setIsSubmittingOrder(false);
        return;
      }

      setCart([]);
      setAppliedPromo(null);
      setIsCheckoutOpen(false);
      router.push(`/order/${data.order.id}`);
    } catch (err) {
      console.error('Checkout submit error:', err);
      alert('Terjadi kesalahan koneksi saat memproses pesanan.');
      setIsSubmittingOrder(false);
    }
  };

  const allMenuItems = categories.flatMap((cat) => cat.menuItems);
  const filteredItems = allMenuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      categories.find((c) => c.id === selectedCategory)?.menuItems.some((i) => i.id === item.id);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // Calculate display total for floating cart bar (must match CartDrawer logic)
  let cartDiscount = 0;
  if (appliedPromo === 'KEVINGANTENG') {
    cartDiscount = (cartSubtotal * 99) / 100;
  } else if (appliedPromo === 'MOSAC10' && cartSubtotal >= 200000) {
    cartDiscount = (cartSubtotal * 10) / 100;
  } else if (appliedPromo === 'VIP50K' && cartSubtotal >= 300000) {
    cartDiscount = 50000;
  }
  const cartTax = Math.round((cartSubtotal - cartDiscount) * (tableInfo.taxRate / 100));
  const cartService = Math.round((cartSubtotal - cartDiscount) * (tableInfo.serviceRate / 100));
  const cartDisplayTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax + cartService);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-28">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 rounded-b-[32px] p-4 shadow-md shadow-slate-200/40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#781215] flex items-center justify-center text-white shadow-md shadow-[#781215]/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">{tableInfo.outletName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-[#781215]/10 text-[#781215] border border-[#781215]/20 text-[11px] font-black px-2 py-0.5 rounded-md">
                  {tableInfo.tableNumber}
                </span>
                <span className="text-[11px] text-slate-500">Pesan Mandiri PWA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Cari Wagyu Steak, Salmon, Mocktail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#781215] focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-3xl mx-auto mt-3.5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#781215] text-white shadow-md shadow-[#781215]/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#781215] text-white shadow-md shadow-[#781215]/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-3xl mx-auto p-4 sm:p-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-[28px] h-64 border border-slate-200"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50 text-[#781215]" />
            <p className="text-sm font-semibold">Tidak ada menu yang ditemukan</p>
            <p className="text-xs mt-1">Coba kata kunci pencarian atau kategori lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white border ${
                  item.isAvailable
                    ? 'border-slate-200/80 hover:border-[#781215]/40 hover:shadow-lg'
                    : 'border-slate-200 opacity-60'
                } rounded-[28px] overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 group`}
              >
                <div className="relative h-36 sm:h-40 w-full bg-slate-100 overflow-hidden rounded-t-[28px]">
                  <Image
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[28px]"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700">
                        Habis
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-xs font-black text-[#781215]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <button
                      disabled={!item.isAvailable}
                      onClick={() => setSelectedMenuItem(item)}
                      className="bg-[#781215] hover:bg-[#600e11] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm shadow-[#781215]/20 transition-all active:scale-95"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-5 left-4 right-4 z-40 max-w-xl mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#781215] hover:bg-[#600e11] text-white font-bold py-3.5 px-6 rounded-full shadow-2xl shadow-[#781215]/40 flex items-center justify-between transition-all active:scale-[0.98] border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center text-[11px] font-black bg-white text-[#781215] px-3 py-1 rounded-full leading-none shadow-xs">
                  {cartTotalItems} Item
                </span>
                <span className="text-xs text-rose-100 font-semibold leading-none">Lihat Keranjang</span>
              </div>
            </div>

            <span className="text-base font-black">
              Rp {cartDisplayTotal.toLocaleString('id-ID')}
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedMenuItem && (
        <ItemModal
          item={selectedMenuItem}
          onClose={() => setSelectedMenuItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          appliedPromo={appliedPromo}
          onApplyPromo={(code) => setAppliedPromo(code)}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={handleProceedToCheckout}
          taxRate={tableInfo.taxRate}
          serviceRate={tableInfo.serviceRate}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          tableNumber={tableInfo.tableNumber}
          totalAmount={cartSubtotal}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handleCheckoutSubmit}
          isSubmitting={isSubmittingOrder}
        />
      )}
    </div>
  );
}
