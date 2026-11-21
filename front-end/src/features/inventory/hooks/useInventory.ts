import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError } from 'axios';
import { productService } from '../api/productService';
import { getDaysUntilDate } from '../../../utils/formatters';
import type {
  Category,
  InventoryTab,
  Product,
  ProductFormValues,
  Unit,
} from '../types/inventory.types';

export const EXPIRING_WARNING_DAYS = 7;

const UNIT_LOW_STOCK_THRESHOLDS: Record<string, number> = {
  pcs: 10,
  kg: 10,
  liter: 10,
  l: 10,
};

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export function getLowStockThreshold(unitName?: string): number {
  const normalized = String(unitName ?? '').trim().toLowerCase();
  return UNIT_LOW_STOCK_THRESHOLDS[normalized] ?? DEFAULT_LOW_STOCK_THRESHOLD;
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [expiringSoonProducts, setExpiringSoonProducts] = useState<Product[]>([]);
  const [expiredProducts, setExpiredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<InventoryTab>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allList, expiringRes, catRes, unitRes] = await Promise.allSettled([
        productService.getAll(),
        productService.getExpiring(String(EXPIRING_WARNING_DAYS)),
        productService.getCategories(),
        productService.getUnits(),
      ]);

      if (allList.status !== 'fulfilled') {
        throw allList.reason;
      }

      const fullProducts = allList.value;
      setProducts(fullProducts);

      const productById = new Map<number, Product>();
      const productBySku = new Map<string, Product>();
      fullProducts.forEach((p) => {
        if (p.id > 0) productById.set(p.id, p);
        if (p.sku) productBySku.set(p.sku, p);
      });

      const enrichProduct = (item: Product): Product => {
        const matched =
          (item.id > 0 ? productById.get(item.id) : undefined) ??
          (item.sku ? productBySku.get(item.sku) : undefined);

        if (!matched) return item;

        return {
          ...matched,
          expirationStatus: item.expirationStatus ?? matched.expirationStatus,
          daysRemaining: item.daysRemaining ?? matched.daysRemaining,
        };
      };

      const nextOutOfStock: Product[] = [];
      const nextLowStock: Product[] = [];

      fullProducts.forEach((product) => {
        if (product.stock <= 0) {
          nextOutOfStock.push(product);
        } else if (product.stock <= getLowStockThreshold(product.unitName)) {
          nextLowStock.push(product);
        }
      });

      setOutOfStockProducts(nextOutOfStock);
      setLowStockProducts(nextLowStock);

      const backendExpiringMap = new Map<number, Product>();
      if (expiringRes.status === 'fulfilled') {
        expiringRes.value.items.map(enrichProduct).forEach((item) => {
          if (item.id > 0) backendExpiringMap.set(item.id, item);
        });
      }

      const nextExpired: Product[] = [];
      const nextExpiringSoon: Product[] = [];

      fullProducts.forEach((product) => {
        if (!product.hasExpiration || !product.expirationDate) return;

        const meta = backendExpiringMap.get(product.id);
        const daysRemaining =
          meta?.daysRemaining ??
          product.daysRemaining ??
          getDaysUntilDate(product.expirationDate);
        const status = meta?.expirationStatus ?? product.expirationStatus;

        const merged: Product = {
          ...product,
          expirationStatus: status,
          daysRemaining,
        };

        if (status === 'EXPIRED' || daysRemaining < 0) {
          nextExpired.push(merged);
        } else if (
          status === 'EXPIRING_SOON' ||
          daysRemaining <= EXPIRING_WARNING_DAYS
        ) {
          nextExpiringSoon.push(merged);
        }
      });

      setExpiredProducts(nextExpired);
      setExpiringSoonProducts(nextExpiringSoon);

      if (catRes.status === 'fulfilled') setCategories(catRes.value);
      if (unitRes.status === 'fulfilled') setUnits(unitRes.value);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal memuat data produk dari endpoint /api/products.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const lowStockIdSet = useMemo(
    () => new Set(lowStockProducts.map((p) => p.id)),
    [lowStockProducts]
  );

  const expiringMap = useMemo(() => {
    const map = new Map<number, Product>();
    expiredProducts.forEach((p) => map.set(p.id, p));
    expiringSoonProducts.forEach((p) => map.set(p.id, p));
    return map;
  }, [expiredProducts, expiringSoonProducts]);

  const totalAssetValue = useMemo(
    () => products.reduce((sum, p) => sum + p.costPrice * p.stock, 0),
    [products]
  );

  const categoryFilterOptions = useMemo(() => {
    const unique = new Set(products.map((p) => p.categoryName).filter(Boolean));
    return ['ALL', ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const source =
      activeTab === 'LOW_STOCK'
        ? lowStockProducts
        : activeTab === 'OUT_OF_STOCK'
        ? outOfStockProducts
        : activeTab === 'EXPIRING_SOON'
        ? expiringSoonProducts
        : activeTab === 'EXPIRED'
        ? expiredProducts
        : products;

    const q = searchQuery.toLowerCase();
    return source.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCategory =
        selectedCategory === 'ALL' || p.categoryName === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [
    activeTab,
    products,
    lowStockProducts,
    outOfStockProducts,
    expiringSoonProducts,
    expiredProducts,
    searchQuery,
    selectedCategory,
  ]);

  const saveProduct = async (
    formData: ProductFormValues,
    editingId?: number
  ): Promise<boolean> => {
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await productService.update(editingId, formData);
      } else {
        await productService.create(formData);
      }
      await fetchAllData();
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal menyimpan produk. Pastikan SKU unik serta Kategori & Satuan valid.'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product): Promise<void> => {
    if (!window.confirm(`Hapus produk "${product.name}" dari inventaris?`)) return;
    setError('');
    try {
      await productService.remove(product.id);
      await fetchAllData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const quickRestock = async (
    targetProduct: Product,
    addedQty: string
  ): Promise<boolean> => {
    const added = Number(addedQty);
    if (added <= 0) return false;

    setSaving(true);
    setError('');
    try {
      await productService.update(targetProduct.id, {
        ...targetProduct,
        stock: targetProduct.stock + added,
      });
      await fetchAllData();
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || 'Gagal memperbarui stok masuk.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    products,
    lowStockProducts,
    outOfStockProducts,
    expiringSoonProducts,
    expiredProducts,
    categories,
    units,
    loading,
    saving,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    warningDays: EXPIRING_WARNING_DAYS,
    lowStockIdSet,
    expiringMap,
    totalAssetValue,
    categoryFilterOptions,
    filteredProducts,
    fetchAllData,
    saveProduct,
    deleteProduct,
    quickRestock,
  };
}