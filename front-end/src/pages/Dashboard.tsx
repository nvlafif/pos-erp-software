import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Coins,
  ReceiptText,
  Wallet,
  RefreshCw,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AlertBanner from '../components/ui/AlertBanner';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatRupiah } from '../utils/formatters';
import { useOwnerDashboard } from '../features/dashboard/hooks/useOwnerDashboard';
import type { DashboardPeriod } from '../features/dashboard/types/dashboard.types';
import RevenueTrendChart from '../features/dashboard/components/RevenueTrendChart';
import PaymentMethodCard from '../features/dashboard/components/PaymentMethodCard';
import RecentTransactionsTable from '../features/dashboard/components/RecentTransactionsTable';
import TopProductsCard from '../features/dashboard/components/TopProductsCard';
import InventoryRiskPanel from '../features/dashboard/components/InventoryRiskPanel';

const PERIOD_OPTIONS: { id: DashboardPeriod; label: string }[] = [
  { id: 'TODAY', label: 'Hari Ini' },
  { id: 'THIS_WEEK', label: 'Minggu Ini' },
  { id: 'THIS_MONTH', label: 'Bulan Ini' },
  { id: 'THIS_YEAR', label: 'Tahun Ini' },
  { id: 'MONTH', label: 'Pilih Bulan' },
  { id: 'CUSTOM', label: 'Rentang Tanggal' },
];

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const dash = useOwnerDashboard();
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Eksekutif Owner"
        subtitle="Ringkasan performa penjualan, estimasi laba kotor, dan kesehatan stok gudang"
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              isLoading={dash.loading}
              onClick={dash.fetchDashboardData}
            >
              Muat Ulang
            </Button>

            <Button
              variant="primary"
              icon={ShoppingCart}
              onClick={() => navigate('/pos')}
            >
              Buka Kasir
            </Button>
          </>
        }
      />

      {/* Bar Filter Laporan Periode (/api/transactions/report) */}
      <Card className="p-3.5 border-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => dash.setPeriod(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                dash.period === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {dash.period === 'MONTH' && (
          <div className="flex items-center gap-2">
            <select
              value={dash.selectedMonth}
              onChange={(e) => dash.setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="2020"
              max="2100"
              value={dash.selectedYear}
              onChange={(e) =>
                dash.setSelectedYear(Number(e.target.value) || currentYear)
              }
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {dash.period === 'CUSTOM' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={dash.startDate}
              onChange={(e) => dash.setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400 font-medium">s/d</span>
            <input
              type="date"
              value={dash.endDate}
              onChange={(e) => dash.setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </Card>

      {(dash.error || dash.transactionNotice) && (
        <div className="space-y-2.5">
          <AlertBanner variant="error" message={dash.error} />
          <AlertBanner variant="info" message={dash.transactionNotice} />
        </div>
      )}

      {dash.loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Menyiapkan ringkasan performa bisnis...</p>
        </div>
      ) : (
        <>
          {/* Kartu KPI Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Total Omzet Penjualan"
              value={formatRupiah(dash.kpiSummary.totalRevenue)}
              variant="emerald"
              valueSize="md"
            />
            <StatCard
              icon={Coins}
              label="Estimasi Laba Kotor"
              value={formatRupiah(dash.kpiSummary.grossProfit)}
              variant="blue"
              valueSize="md"
            />
            <StatCard
              icon={ReceiptText}
              label="Total Transaksi"
              value={dash.kpiSummary.transactionCount}
              suffix={`(${dash.kpiSummary.totalItemsSold} item)`}
              variant="purple"
            />
            <StatCard
              icon={Wallet}
              label="Nilai Aset Gudang"
              value={formatRupiah(dash.inventoryRisk.totalAssetValue)}
              variant="amber"
              valueSize="md"
              onClick={() => navigate('/inventory')}
            />
          </div>

          {/* Grafik Tren Omzet & Distribusi Pembayaran */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8">
              <RevenueTrendChart points={dash.dailyTrend} />
            </div>
            <div className="lg:col-span-4">
              <PaymentMethodCard items={dash.paymentBreakdown} />
            </div>
          </div>

          {/* Tabel Transaksi Terbaru, Produk Terlaris & Kesehatan Gudang */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7">
              <RecentTransactionsTable transactions={dash.recentTransactions} />
            </div>
            <div className="lg:col-span-5 space-y-5">
              <TopProductsCard products={dash.topProducts} />
              <InventoryRiskPanel summary={dash.inventoryRisk} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}