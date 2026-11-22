import { Award } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { formatRupiah } from '../../../utils/formatters';
import type { TopProductItem } from '../types/dashboard.types';

interface TopProductsCardProps {
  products: TopProductItem[];
}

export default function TopProductsCard({ products }: TopProductsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Produk Terlaris</h3>
          <p className="text-xs text-slate-500">Top 5 berdasarkan unit terjual</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          Belum ada data penjualan produk pada periode ini.
        </div>
      ) : (
        <div className="divide-y divide-slate-200/80 mt-2">
          {products.map((item, idx) => (
            <div
              key={`${item.productId}-${item.sku}`}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">{item.sku}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-900">
                  {item.qtySold} {item.unitName}
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  {formatRupiah(item.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}