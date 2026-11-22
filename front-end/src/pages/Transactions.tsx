import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReceiptText,
  TrendingUp,
  ShoppingBag,
  Calculator,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AlertBanner from '../components/ui/AlertBanner';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import { formatRupiah } from '../utils/formatters';
import type { TransactionRecord } from '../features/dashboard/types/dashboard.types';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import TransactionFilterBar from '../features/transactions/components/TransactionFilterBar';
import TransactionTable from '../features/transactions/components/TransactionTable';
import ReceiptModal from '../features/pos/components/ReceiptModal';

export default function Transactions() {
  const navigate = useNavigate();
  const trxState = useTransactions();
  const [selectedReceipt, setSelectedReceipt] =
    useState<TransactionRecord | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Transaksi Penjualan"
        subtitle="Daftar seluruh struk penjualan, metode pembayaran, dan rincian item terjual"
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              isLoading={trxState.loading}
              onClick={trxState.fetchTransactions}
            >
              Muat Ulang
            </Button>
            <Button
              variant="primary"
              icon={ShoppingCart}
              onClick={() => navigate('/pos')}
            >
              Transaksi Baru
            </Button>
          </>
        }
      />

      {trxState.error && (
        <AlertBanner variant="error" message={trxState.error} />
      )}

      {/* Kartu Ringkasan KPI Transaksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={ReceiptText}
          label="Jumlah Transaksi"
          value={trxState.summary.count}
          suffix="struk"
          variant="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Nilai Penjualan"
          value={formatRupiah(trxState.summary.totalRevenue)}
          variant="emerald"
          valueSize="md"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Unit Terjual"
          value={trxState.summary.totalItemsSold}
          suffix="item"
          variant="purple"
        />
        <StatCard
          icon={Calculator}
          label="Rata-rata per Struk"
          value={formatRupiah(trxState.summary.averageOrder)}
          variant="amber"
          valueSize="md"
        />
      </div>

      {/* Filter Pencarian, Tanggal & Metode Bayar */}
      <TransactionFilterBar
        searchQuery={trxState.searchQuery}
        onSearchChange={trxState.setSearchQuery}
        selectedMethod={trxState.selectedMethod}
        onMethodChange={trxState.setSelectedMethod}
        selectedDate={trxState.selectedDate}
        onDateChange={trxState.setSelectedDate}
        onReset={trxState.resetFilters}
      />

      {/* Tabel Daftar Transaksi */}
      <TransactionTable
        transactions={trxState.filteredTransactions}
        loading={trxState.loading}
        onViewReceipt={setSelectedReceipt}
      />

      {/* Modal Detail Struk */}
      <ReceiptModal
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}