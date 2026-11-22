import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError } from 'axios';
import { productService } from '../../inventory/api/productService';
import {
  EXPIRING_WARNING_DAYS,
  getLowStockThreshold,
} from '../../inventory/hooks/useInventory';
import type { Product } from '../../inventory/types/inventory.types';
import { getDaysUntilDate } from '../../../utils/formatters';
import { dashboardService } from '../api/dashboardService';
import type {
  DailyRevenuePoint,
  DashboardPeriod,
  InventoryRiskSummary,
  PaymentBreakdownItem,
  TopProductItem,
  TransactionRecord,
} from '../types/dashboard.types';

function toLocalDateKey(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useOwnerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [period, setPeriod] = useState<DashboardPeriod>('7D');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [transactionNotice, setTransactionNotice] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    setTransactionNotice('');

    try {
      const [productResult, trxResult] = await Promise.allSettled([
        productService.getAll(),
        dashboardService.getTransactions(),
      ]);

      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value);
      } else {
        throw productResult.reason;
      }

      if (trxResult.status === 'fulfilled') {
        setTransactions(trxResult.value);
      } else {
        setTransactions([]);
        setTransactionNotice(
          'Data riwayat transaksi belum tersedia dari endpoint /api/transactions. Menampilkan ringkasan aset & inventaris.'
        );
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal memuat data ringkasan dashboard dari server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const filteredTransactions = useMemo(() => {
    if (period === 'ALL') return transactions;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const daysBack = period === 'TODAY' ? 0 : period === '7D' ? 6 : 29;
    const startThreshold = new Date(now);
    startThreshold.setDate(now.getDate() - daysBack);

    return transactions.filter((trx) => {
      const trxDate = new Date(trx.transactionDate);
      if (Number.isNaN(trxDate.getTime())) return true;
      trxDate.setHours(0, 0, 0, 0);
      return trxDate.getTime() >= startThreshold.getTime();
    });
  }, [transactions, period]);

  const kpiSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;

    filteredTransactions.forEach((trx) => {
      totalRevenue += trx.totalAmount;

      trx.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const unitCost =
          item.costPrice ?? productMap.get(item.productId)?.costPrice ?? 0;
        totalCost += unitCost * item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const transactionCount = filteredTransactions.length;
    const averageBasket =
      transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

    return {
      totalRevenue,
      grossProfit,
      transactionCount,
      totalItemsSold,
      averageBasket,
    };
  }, [filteredTransactions, productMap]);

  const dailyTrend = useMemo<DailyRevenuePoint[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = new Map<string, DailyRevenuePoint>();
    const orderedKeys: string[] = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const key = toLocalDateKey(d);
      const label = d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      });
      buckets.set(key, {
        dateKey: key,
        label,
        revenue: 0,
        transactionCount: 0,
      });
      orderedKeys.push(key);
    }

    transactions.forEach((trx) => {
      const key = toLocalDateKey(trx.transactionDate);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += trx.totalAmount;
        bucket.transactionCount += 1;
      }
    });

    return orderedKeys.map((key) => buckets.get(key)!);
  }, [transactions]);

  const paymentBreakdown = useMemo<PaymentBreakdownItem[]>(() => {
    const totals = new Map<string, { count: number; total: number }>();

    filteredTransactions.forEach((trx) => {
      const method = trx.paymentMethod || 'CASH';
      const existing = totals.get(method) ?? { count: 0, total: 0 };
      existing.count += 1;
      existing.total += trx.totalAmount;
      totals.set(method, existing);
    });

    const grandTotal = filteredTransactions.reduce(
      (sum, trx) => sum + trx.totalAmount,
      0
    );

    return Array.from(totals.entries())
      .map(([method, stat]) => ({
        method,
        count: stat.count,
        total: stat.total,
        percentage: grandTotal > 0 ? Math.round((stat.total / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  const topProducts = useMemo<TopProductItem[]>(() => {
    const map = new Map<number, TopProductItem>();

    filteredTransactions.forEach((trx) => {
      trx.items.forEach((item) => {
        const productInfo = productMap.get(item.productId);
        const current = map.get(item.productId) ?? {
          productId: item.productId,
          name: item.productName || productInfo?.name || 'Produk',
          sku: item.sku || productInfo?.sku || '-',
          unitName: item.unitName || productInfo?.unitName || 'pcs',
          qtySold: 0,
          revenue: 0,
        };

        current.qtySold += item.quantity;
        current.revenue += item.subtotal;
        map.set(item.productId, current);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qtySold - a.qtySold || b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions, productMap]);

  const inventoryRisk = useMemo<InventoryRiskSummary>(() => {
    let totalAssetValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    products.forEach((product) => {
      totalAssetValue += product.costPrice * product.stock;

      if (product.stock <= 0) {
        outOfStockCount += 1;
      } else if (product.stock <= getLowStockThreshold(product.unitName)) {
        lowStockCount += 1;
      }

      if (product.hasExpiration && product.expirationDate) {
        const days =
          product.daysRemaining ?? getDaysUntilDate(product.expirationDate);
        if (product.expirationStatus === 'EXPIRED' || days < 0) {
          expiredCount += 1;
        } else if (
          product.expirationStatus === 'EXPIRING_SOON' ||
          days <= EXPIRING_WARNING_DAYS
        ) {
          expiringSoonCount += 1;
        }
      }
    });

    return {
      totalSku: products.length,
      totalAssetValue,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredCount,
    };
  }, [products]);

  const recentTransactions = useMemo(
    () => filteredTransactions.slice(0, 6),
    [filteredTransactions]
  );

  return {
    period,
    setPeriod,
    loading,
    error,
    transactionNotice,
    kpiSummary,
    dailyTrend,
    paymentBreakdown,
    topProducts,
    inventoryRisk,
    recentTransactions,
    fetchDashboardData,
  };
}