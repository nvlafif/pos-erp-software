import { BarChart3 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { formatRupiah } from '../../../utils/formatters';
import type { DailyRevenuePoint } from '../types/dashboard.types';

interface RevenueTrendChartProps {
  points: DailyRevenuePoint[];
}

export default function RevenueTrendChart({ points }: RevenueTrendChartProps) {
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 1);
  const totalSevenDays = points.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tren Omzet 7 Hari Terakhir
            </h3>
            <p className="text-xs text-slate-500">
              Akumulasi penjualan harian berdasarkan transaksi selesai
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total 7 Hari
          </p>
          <p className="text-sm font-bold text-blue-600">
            {formatRupiah(totalSevenDays)}
          </p>
        </div>
      </div>

      <div className="pt-6 pb-2">
        <div className="grid grid-cols-7 gap-2.5 sm:gap-4 items-end h-52">
          {points.map((point, index) => {
            const heightPercent =
              point.revenue > 0
                ? Math.max(Math.round((point.revenue / maxRevenue) * 100), 10)
                : 4;
            const isToday = index === points.length - 1;

            return (
              <div
                key={point.dateKey}
                className="flex flex-col items-center h-full justify-end group"
              >
                <span className="text-[11px] font-semibold text-slate-600 mb-1.5 opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                  {point.revenue > 0 ? formatRupiah(point.revenue) : 'Rp 0'}
                </span>

                <div className="w-full max-w-11 bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                  <div
                    title={`${point.label}: ${formatRupiah(point.revenue)} (${point.transactionCount} transaksi)`}
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      point.revenue === 0
                        ? 'bg-slate-200'
                        : isToday
                        ? 'bg-blue-600 group-hover:bg-blue-700'
                        : 'bg-blue-400/80 group-hover:bg-blue-600'
                    }`}
                  />
                </div>

                <p
                  className={`text-xs mt-2 font-medium ${
                    isToday ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  {isToday ? 'Hari Ini' : point.label}
                </p>
                <p className="text-[10px] text-slate-400">
                  {point.transactionCount} trx
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}