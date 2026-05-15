import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Normalize for accent/case/space-insensitive coupon matching. */
export const normalizeCouponCode = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();

export type PriceOption = { label: string; value: string };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  status: "available" | "sold_out";
  price_options?: PriceOption[] | null;
};

export type CartItem = {
  // unique line id (productId + selected option index/label)
  lineId: string;
  productId: string;
  name: string;
  description: string;
  image_url: string | null;
  selectedLabel: string;
  selectedValue: string; // raw stored value: "120.00" or "15%"
  unitPrice: number; // 0 for coupons
  isCoupon: boolean;
  discountPercent: number; // 0 for non-coupons
  quantity: number;
};

type AddPayload = {
  product: Product;
  option: PriceOption;
};

type CartContextType = {
  items: CartItem[];
  add: (payload: AddPayload) => { ok: boolean; reason?: string };
  remove: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  cashDiscount: boolean;
  setCashDiscount: (v: boolean) => void;
  subtotal: number; // sum of priced items
  couponItem: CartItem | null;
  couponDiscountAmount: number;
  cashDiscountAmount: number;
  total: number;
  count: number;
  applyCouponByCode: (code: string) => { ok: boolean; reason?: string };
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "orion-cart-v2";
const CASH_KEY = "orion-cart-cash-v1";

// ---- helpers ----------------------------------------------------------------

export const isPercentValue = (v: string) => /^\s*\d+(\.\d+)?\s*%\s*$/.test(v);

export const parsePercent = (v: string): number => {
  const m = v.match(/^\s*(\d+(?:\.\d+)?)\s*%\s*$/);
  return m ? parseFloat(m[1]) : 0;
};

export const parseNumericValue = (v: string): number => {
  const cleaned = v.replace(/[^\d.,-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Returns the canonical list of options for a product.
 * Falls back to a single option built from the legacy `price` column when
 * `price_options` is empty.
 */
export const getProductOptions = (product: Product): PriceOption[] => {
  const opts = product.price_options ?? [];
  if (Array.isArray(opts) && opts.length > 0) return opts;
  return [{ label: "Padrão", value: String(product.price ?? 0) }];
};

export type ProductKind = "informational" | "coupon" | "priced";

/**
 * Classifies a product based on its options.
 * - informational: every option resolves to 0 (and none are percentages)
 * - coupon: every option is a percentage string
 * - priced: anything else
 */
export const classifyProduct = (product: Product): ProductKind => {
  const opts = getProductOptions(product);
  const allPercent = opts.every((o) => isPercentValue(o.value));
  if (allPercent) return "coupon";
  const allZero = opts.every(
    (o) => !isPercentValue(o.value) && parseNumericValue(o.value) === 0,
  );
  if (allZero) return "informational";
  return "priced";
};

// ---- provider ---------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cashDiscount, setCashDiscountState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const cash = localStorage.getItem(CASH_KEY);
      if (cash === "1") setCashDiscountState(true);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CASH_KEY, cashDiscount ? "1" : "0");
  }, [cashDiscount, hydrated]);

  const setCashDiscount = (v: boolean) => setCashDiscountState(v);

  const add: CartContextType["add"] = ({ product, option }) => {
    const kind = classifyProduct(product);
    if (kind === "informational") {
      return { ok: false, reason: "Item informativo não pode ser adicionado." };
    }

    const isCoupon = isPercentValue(option.value);
    const discountPercent = isCoupon ? parsePercent(option.value) : 0;
    const unitPrice = isCoupon ? 0 : parseNumericValue(option.value);

    if (isCoupon && items.some((i) => i.isCoupon)) {
      return { ok: false, reason: "Apenas um cupom por pedido." };
    }

    const lineId = `${product.id}::${option.label}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        // coupons can't be stacked
        if (isCoupon) return prev;
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      const next: CartItem = {
        lineId,
        productId: product.id,
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        selectedLabel: option.label,
        selectedValue: option.value,
        unitPrice,
        isCoupon,
        discountPercent,
        quantity: 1,
      };
      return [...prev, next];
    });
    return { ok: true };
  };

  const remove = (lineId: string) =>
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));

  const updateQty = (lineId: string, qty: number) => {
    if (qty <= 0) return remove(lineId);
    setItems((prev) =>
      prev.map((i) =>
        i.lineId === lineId
          ? { ...i, quantity: i.isCoupon ? 1 : qty }
          : i,
      ),
    );
  };

  const clear = () => {
    setItems([]);
    setCashDiscountState(false);
  };

  const subtotal = items
    .filter((i) => !i.isCoupon)
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const couponItem = items.find((i) => i.isCoupon) ?? null;
  const couponDiscountAmount = couponItem
    ? subtotal * (couponItem.discountPercent / 100)
    : 0;

  const afterCoupon = subtotal - couponDiscountAmount;
  const cashDiscountAmount = cashDiscount ? afterCoupon * 0.1 : 0;
  const total = Math.max(0, afterCoupon - cashDiscountAmount);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        updateQty,
        clear,
        cashDiscount,
        setCashDiscount,
        subtotal,
        couponItem,
        couponDiscountAmount,
        cashDiscountAmount,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
