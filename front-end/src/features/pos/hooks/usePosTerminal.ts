import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError } from 'axios';
import { productService } from '../../inventory/api/productService';
import type { Product } from '../../inventory/types/inventory.types';
import { getDaysUntilDate } from '../../../utils/formatters';
import { getStoredUser } from '../../auth/utils/authStorage';
import type { TransactionRecord } from '../../dashboard/types/dashboard.types';
import { posService } from '../api/posService';
import type { CartItem, PaymentMethod } from '../types/pos.types';

export function isProductExpired(product: Product): boolean {
  if (!product.hasExpiration || !product.expirationDate) return false;
  const days =
    product.daysRemaining ?? getDaysUntilDate(product.expirationDate);
  return product.expirationStatus === 'EXPIRED' || days < 0;
}

export function usePosTerminal() {
  const currentUser = getStoredUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [completedReceipt, setCompletedReceipt] =
    useState<TransactionRecord | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await productService.getAll();
      setProducts(list);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal memuat katalog produk dari server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) names.add(p.categoryName);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' || p.categoryName === selectedCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartQuantityMap = useMemo(() => {
    const map = new Map<number, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setError('');

    if (product.stock <= 0) {
      setError(`Stok produk "${product.name}" sedang habis.`);
      return;
    }

    if (isProductExpired(product)) {
      setError(
        `Produk "${product.name}" telah kedaluwarsa (${product.expirationDate}) dan tidak dapat dijual.`
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setError(
            `Jumlah "${product.name}" mencapai batas stok tersedia (${product.stock} ${product.unitName}).`
          );
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleBarcodeEnter = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const exactSkuMatch = products.find(
      (p) => p.sku && p.sku.toLowerCase() === q
    );
    if (exactSkuMatch) {
      addToCart(exactSkuMatch);
      setSearchQuery('');
    }
  }, [searchQuery, products, addToCart]);

  const updateCartQuantity = useCallback((productId: number, nextQty: number) => {
    setError('');
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const clamped = Math.min(nextQty, item.product.stock);
        if (nextQty > item.product.stock) {
          setError(
            `Maksimal stok "${item.product.name}" adalah ${item.product.stock} ${item.product.unitName}.`
          );
        }
        return { ...item, quantity: clamped };
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerName('');
    setAmountPaidInput('');
    setPaymentMethod('CASH');
    setError('');
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cart]
  );

  const parsedAmountPaid = useMemo(() => {
    if (paymentMethod !== 'CASH') return totalAmount;
    const digits = amountPaidInput.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
  }, [paymentMethod, amountPaidInput, totalAmount]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0;
    return Math.max(0, parsedAmountPaid - totalAmount);
  }, [paymentMethod, parsedAmountPaid, totalAmount]);

  const isPaymentValid =
    cart.length > 0 &&
    (paymentMethod !== 'CASH' || parsedAmountPaid >= totalAmount);

  const submitCheckout = async () => {
    if (!isPaymentValid || submitting) return;

    setSubmitting(true);
    setError('');

    const itemMetaMap = new Map<
      number,
      { name: string; sku: string; unitName: string; price: number }
    >();
    cart.forEach((item) => {
      itemMetaMap.set(item.product.id, {
        name: item.product.name,
        sku: item.product.sku,
        unitName: item.product.unitName,
        price: item.product.price,
      });
    });

    try {
      const receipt = await posService.createTransaction(
        {
          payment: parsedAmountPaid,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
        {
          cashierName: currentUser?.name || currentUser?.email || 'Kasir',
          customerName: customerName.trim() || 'Pelanggan Umum',
          paymentMethod,
          totalAmount,
          itemMetaMap,
        }
      );

      setCompletedReceipt(receipt);
      clearCart();
      await fetchProducts();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Transaksi gagal diproses. Periksa kembali ketersediaan stok atau koneksi server.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    filteredProducts,
    categories,
    cart,
    cartQuantityMap,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    amountPaidInput,
    setAmountPaidInput,
    totalItems,
    totalAmount,
    parsedAmountPaid,
    changeAmount,
    isPaymentValid,
    loading,
    submitting,
    error,
    completedReceipt,
    setCompletedReceipt,
    fetchProducts,
    addToCart,
    handleBarcodeEnter,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    submitCheckout,
  };
}