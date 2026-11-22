import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError } from 'axios';
import { dashboardService } from '../../dashboard/api/dashboardService';
import type { TransactionRecord } from '../../dashboard/types/dashboard.types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = await dashboardService.getTransactions();
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
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal memuat riwayat transaksi dari server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return transactions.filter((trx) => {
      const matchMethod =
        selectedMethod === 'ALL' || trx.paymentMethod === selectedMethod;

      let matchDate = true;
      if (selectedDate) {
        const d = new Date(trx.transactionDate);
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          matchDate = `${yyyy}-${mm}-${dd}` === selectedDate;
        }
      }

      const matchQuery =
        !q ||
        trx.invoiceNumber.toLowerCase().includes(q) ||
        trx.cashierName.toLowerCase().includes(q) ||
        trx.customerName.toLowerCase().includes(q) ||
        trx.items.some((item) => item.productName.toLowerCase().includes(q));

      return matchMethod && matchDate && matchQuery;
    });
  }, [transactions, searchQuery, selectedMethod, selectedDate]);

  const summary = useMemo(() => {
    const count = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce(
      (sum, trx) => sum + trx.totalAmount,
      0
    );
    const totalItemsSold = filteredTransactions.reduce(
      (sum, trx) =>
        sum + trx.items.reduce((itemSum, i) => itemSum + i.quantity, 0),
      0
    );
    const averageOrder = count > 0 ? Math.round(totalRevenue / count) : 0;

    return {
      count,
      totalRevenue,
      totalItemsSold,
      averageOrder,
    };
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMethod('ALL');
    setSelectedDate('');
  };

  return {
    filteredTransactions,
    summary,
    searchQuery,
    setSearchQuery,
    selectedMethod,
    setSelectedMethod,
    selectedDate,
    setSelectedDate,
    resetFilters,
    loading,
    error,
    fetchTransactions,
  };
}