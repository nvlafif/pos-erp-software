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
  TransactionReportSummary,
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
  const now = new Date();
  const defaultDateStr = toLocalDateKey(now);

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [reportSummary, setReportSummary] =
    useState<TransactionReportSummary | null>(null);

  const [period, setPeriod] = useState<DashboardPeriod>('THIS_MONTH');
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [startDate, setStartDate] = useState<string>(defaultDateStr);
  const [endDate, setEndDate] = useState<string>(defaultDateStr);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [transactionNotice, setTransactionNotice] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    setTransactionNotice('');

    try {
      const [productResult, trxResult, reportResult] = await Promise.allSettled([
        productService.getAll(),
        dashboardService.getTransactions(),
        dashboardService.getTransactionReport({
          period,
          year: selectedYear,
          month: selectedMonth,
          startDate,
          endDate,
        }),
      ]);

      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value);
      } else {
        throw productResult.reason;
      }

      if (trxResult.status === 'fulfilled') {
        const headers = trxResult.value;
        const hydrated = await Promise.all(
          headers.map(async (trx) => {
            if (trx.items.length > 0) return trx;
            try {
              const details = await dashboardService.getTransactionDetails(trx.id);
              return { ...trx, items: details };
            } catch {
              return trx;
            }
          })
        );
        setTransactions(hydrated);
      } else {
        setTransactions([]);
        setTransactionNotice(
          'Data riwayat transaksi belum tersedia dari endpoint /api/transactions.'
        );
      }

      if (reportResult.status === 'fulfilled') {
        setReportSummary(reportResult.value);
      } else {
        setReportSummary(null);
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
  }, [period, selectedYear, selectedMonth, startDate, endDate]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const filteredTransactions = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    return transactions.filter((trx) => {
      const trxDate = new Date(trx.transactionDate);
      if (Number.isNaN(trxDate.getTime())) return true;
      const trxDay = new Date(trxDate);
      trxDay.setHours(0, 0, 0, 0);

      if (period === 'TODAY') {
        return trxDay.getTime() === current.getTime();
      }

      if (period === 'THIS_WEEK') {
        const dayOfWeek = current.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(current);
        monday.setDate(current.getDate() - diffToMonday);
        return trxDay.getTime() >= monday.getTime();
      }

      if (period === 'THIS_MONTH') {
        return (
          trxDate.getFullYear() === current.getFullYear() &&
          trxDate.getMonth() === current.getMonth()
        );
      }

      if (period === 'THIS_YEAR') {
        return trxDate.getFullYear() === current.getFullYear();
      }

      if (period === 'MONTH') {
        return (
          trxDate.getFullYear() === selectedYear &&
          trxDate.getMonth() + 1 === selectedMonth
        );
      }

      if (period === 'CUSTOM') {
        const key = toLocalDateKey(trxDate);
        if (startDate && key < startDate) return false;
        if (endDate && key > endDate) return false;
        return true;
      }

      return true;
    });
  }, [transactions, period, selectedYear, selectedMonth, startDate, endDate]);

  const kpiSummary = useMemo(() => {
    let computedRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;

    filteredTransactions.forEach((trx) => {
      computedRevenue += trx.totalAmount;

      trx.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const unitCost =
          item.costPrice ?? productMap.get(item.productId)?.costPrice ?? 0;
        totalCost += unitCost * item.quantity;
      });
    });

    const totalRevenue =
      reportSummary && reportSummary.totalRevenue > 0
        ? reportSummary.totalRevenue
        : computedRevenue;

    const transactionCount =
      reportSummary && reportSummary.transactionCount > 0
        ? reportSummary.transactionCount
        : filteredTransactions.length;

    const grossProfit = totalRevenue - totalCost;

    return {
      totalRevenue,
      grossProfit,
      transactionCount,
      totalItemsSold,
    };
  }, [filteredTransactions, productMap, reportSummary]);

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
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
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