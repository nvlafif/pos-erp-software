import { Banknote, QrCode, Building2, CreditCard } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { formatRupiah } from '../../../utils/formatters';
import type { PaymentBreakdownItem } from '../types/dashboard.types';

interface PaymentMethodCardProps {
  items: PaymentBreakdownItem[];
}

const METHOD_META: Record<
  string,
  { label: string; bar: string; badge: string; icon: typeof Banknote }
> = {
  CASH: {
    label: 'Tunai (Cash)',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    icon: Banknote,
  },
  QRIS: {
    label: 'QRIS Digital',
    bar: 'bg-blue-600',
    badge: 'bg-blue-50 text-blue-700',
    icon: QrCode,
  },
  TRANSFER: {
    label: 'Transfer Bank',
    bar: 'bg-purple-600',
    badge: 'bg-purple-50 text-purple-700',
    icon: Building2,
  },
};

export default function PaymentMethodCard({ items }: PaymentMethodCardProps) {
  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Metode Pembayaran</h3>
          <p className="text-xs text-slate-500">Distribusi kanal pembayaran pelanggan</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Belum ada data transaksi pada periode ini.
        </div>
      ) : (
        <div className="space-y-4 my-auto pt-4">
          {items.map((item) => {
            const meta = METHOD_META[item.method] ?? {
              label: item.method,
              bar: 'bg-slate-600',
              badge: 'bg-slate-100 text-slate-700',
              icon: CreditCard,
            };
            const Icon = meta.icon;

            return (
              <div key={item.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.badge}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{meta.label}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.count} transaksi
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatRupiah(item.total)}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {item.percentage}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${meta.bar}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}