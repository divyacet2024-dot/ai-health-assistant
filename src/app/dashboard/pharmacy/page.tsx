'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Check, IndianRupee, Package, Star, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { MEDICINE_SHOP, MedicineItem, MEDICINE_CATEGORIES_LIST, searchMedicines } from '@/lib/disease-db';
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, getCartTotal, CartItem } from '@/lib/communication';

export default function PharmacyPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); refreshCart(); }, []);

  function refreshCart() { setCartState(getCart()); }

  const filtered = useMemo(() => searchMedicines(search, category), [search, category]);

  function handleAddToCart(med: MedicineItem) {
    addToCart({ medicineId: med.id, name: med.name, price: med.price, quantity: 1, image: med.image });
    refreshCart();
  }

  function handleUpdateQty(medicineId: string, qty: number) {
    updateCartQuantity(medicineId, qty);
    refreshCart();
  }

  function handleRemove(medicineId: string) {
    removeFromCart(medicineId);
    refreshCart();
  }

  function handleCheckout() {
    setCheckout(true);
    setTimeout(() => {
      clearCart();
      refreshCart();
      setCheckout(false);
      setOrderPlaced(true);
      setTimeout(() => { setOrderPlaced(false); setShowCart(false); }, 3000);
    }, 2000);
  }

  if (!mounted) return null;

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Pharmacy</h1>
            <p className="text-muted-foreground mt-1">Browse medicines, add to cart, and order online.</p>
          </div>
          <button onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
            <ShoppingCart className="w-4 h-4" /> Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* Search + Categories */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines by name, generic name, or usage..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setCategory('')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap',
                !category ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted')}>All</button>
            {MEDICINE_CATEGORIES_LIST.map((c) => (
              <button key={c} onClick={() => setCategory(category === c ? '' : c)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap',
                  category === c ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted')}>{c}</button>
            ))}
          </div>
        </div>

        {/* Medicine Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 50).map((med, i) => {
            const inCart = cart.find((c) => c.medicineId === med.id);
            return (
              <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{med.image}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{med.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{med.genericName}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{med.usage}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{med.category}</span>
                  <span className="text-[10px] text-muted-foreground">{med.manufacturer}</span>
                  {med.prescription && <span className="text-[10px] px-1.5 py-0.5 rounded bg-chart-5/10 text-chart-5 font-medium">Rx</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-primary flex items-center"><IndianRupee className="w-3.5 h-3.5" />{med.price}</span>
                    <div className="flex items-center gap-0.5 ml-2">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="text-[10px] text-muted-foreground">{med.rating}</span>
                    </div>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleUpdateQty(med.id, inCart.quantity - 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{inCart.quantity}</span>
                      <button onClick={() => handleUpdateQty(med.id, inCart.quantity + 1)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleAddToCart(med)}
                      disabled={!med.inStock}
                      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition',
                        med.inStock ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
                      {med.inStock ? <><Plus className="w-3 h-3" /> Add</> : 'Out of Stock'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)}>
              <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                transition={{ type: 'spring', damping: 25 }}
                className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Cart ({cartCount})
                  </h2>
                  <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>

                {orderPlaced ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-chart-3" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-chart-3">Order Placed!</h3>
                      <p className="text-sm text-muted-foreground mt-2">Your medicines will be delivered soon.</p>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground">
                    <div>
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Your cart is empty</p>
                      <p className="text-xs mt-1">Browse medicines and add them to cart</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      {cart.map((item) => (
                        <div key={item.medicineId} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <span className="text-xl">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-primary font-bold flex items-center"><IndianRupee className="w-3 h-3" />{item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleUpdateQty(item.medicineId, item.quantity - 1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.medicineId, item.quantity + 1)} className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => handleRemove(item.medicineId)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="p-5 border-t border-border space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-bold flex items-center"><IndianRupee className="w-3.5 h-3.5" />{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium text-chart-3">Free</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary flex items-center"><IndianRupee className="w-4 h-4" />{cartTotal.toLocaleString()}</span>
                      </div>
                      <button onClick={handleCheckout} disabled={checkout}
                        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                        {checkout ? (
                          <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Processing...</>
                        ) : (
                          <><CreditCard className="w-4 h-4" /> Place Order — ₹{cartTotal.toLocaleString()}</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
