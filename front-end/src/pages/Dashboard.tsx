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
  { id: '7D', label: '7 Hari' },
  { id: '30D', label: '30 Hari' },
  { id: 'ALL', label: 'Semua' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const dash = useOwnerDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Eksekutif Owner"
        subtitle="Ringkasan performa penjualan, estimasi laba kotor, dan kesehatan stok gudang"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-white">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => dash.setPeriod(opt.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    dash.period === opt.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

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
          </div>
        }
      />

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