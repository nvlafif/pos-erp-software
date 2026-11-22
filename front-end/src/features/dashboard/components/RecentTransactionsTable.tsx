import { Link } from 'react-router-dom';
import { ReceiptText, ArrowUpRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge, { type BadgeVariant } from '../../../components/ui/Badge';
import { formatRupiah } from '../../../utils/formatters';
import type { TransactionRecord } from '../types/dashboard.types';

interface RecentTransactionsTableProps {
  transactions: TransactionRecord[];
}

function getPaymentBadgeVariant(method: string): BadgeVariant {
  if (method === 'CASH') return 'success';
  if (method === 'QRIS') return 'info';
  return 'neutral';
}

export default function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  return (
    <Card className="overflow-hidden border-slate-300">
      <div className="px-5 py-4 border-b border-slate-300 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
            <p className="text-xs text-slate-500">
              6 aktivitas penjualan terakhir pada periode terpilih
            </p>
          </div>
        </div>

        <Link
          to="/transactions"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          Semua Transaksi
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-14 text-center text-slate-400">
          <ReceiptText className="w-9 h-9 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-slate-600">
            Belum ada transaksi tercatat
          </p>
          <p className="text-xs mt-1">
            Transaksi dari Terminal Kasir POS akan langsung muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">No. Struk</th>
                <th className="py-3 px-4">Waktu & Kasir</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/80 text-sm">
              {transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="odd:bg-white even:bg-slate-200/50 hover:bg-blue-50/60 transition"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {trx.invoiceNumber}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {trx.customerName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-medium text-slate-800">
                      {new Date(trx.transactionDate).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-[11px] text-slate-500">{trx.cashierName}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={getPaymentBadgeVariant(trx.paymentMethod)}>
                      {trx.paymentMethod}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatRupiah(trx.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}