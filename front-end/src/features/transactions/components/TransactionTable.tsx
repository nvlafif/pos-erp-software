import { ReceiptText, Eye, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge, { type BadgeVariant } from '../../../components/ui/Badge';
import { formatRupiah } from '../../../utils/formatters';
import type { TransactionRecord } from '../../dashboard/types/dashboard.types';

interface TransactionTableProps {
  transactions: TransactionRecord[];
  loading: boolean;
  onViewReceipt: (transaction: TransactionRecord) => void;
}

function getPaymentBadgeVariant(method: string): BadgeVariant {
  if (method === 'CASH') return 'success';
  if (method === 'QRIS') return 'info';
  return 'neutral';
}

export default function TransactionTable({
  transactions,
  loading,
  onViewReceipt,
}: TransactionTableProps) {
  return (
    <Card className="overflow-hidden border-slate-300">
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <p className="text-sm">Memuat riwayat transaksi...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ReceiptText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-slate-600">
            Tidak ada data transaksi yang sesuai
          </p>
          <p className="text-xs mt-1">
            Sesuaikan filter pencarian atau lakukan transaksi baru di Terminal Kasir POS.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14">No.</th>
                <th className="py-3.5 px-4">No. Struk</th>
                <th className="py-3.5 px-4">Waktu Transaksi</th>
                <th className="py-3.5 px-4">Kasir &amp; Pelanggan</th>
                <th className="py-3.5 px-4 text-center">Item</th>
                <th className="py-3.5 px-4 text-center">Metode</th>
                <th className="py-3.5 px-4 text-right">Total Bayar</th>
                <th className="py-3.5 px-4 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/80 text-sm">
              {transactions.map((trx, index) => {
                const totalQty = trx.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <tr
                    key={trx.id}
                    className="odd:bg-white even:bg-slate-200/50 hover:bg-blue-50/60 transition"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded">
                        {trx.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {new Date(trx.transactionDate).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 text-xs">
                        {trx.customerName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Kasir: {trx.cashierName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">
                      {totalQty > 0 ? `${totalQty} item` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={getPaymentBadgeVariant(trx.paymentMethod)}>
                        {trx.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(trx)}
                        title="Lihat & Cetak Struk"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}