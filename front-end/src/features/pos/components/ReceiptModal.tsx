import { useEffect, useState } from 'react';
import { Printer, CheckCircle2, Store, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatRupiah } from '../../../utils/formatters';
import { dashboardService } from '../../dashboard/api/dashboardService';
import type {
  TransactionItemRecord,
  TransactionRecord,
} from '../../dashboard/types/dashboard.types';

interface ReceiptModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
  showSuccessBanner?: boolean;
}

export default function ReceiptModal({
  transaction,
  onClose,
  showSuccessBanner = false,
}: ReceiptModalProps) {
  const [items, setItems] = useState<TransactionItemRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!transaction) {
      setItems([]);
      return;
    }

    if (transaction.items.length > 0) {
      setItems(transaction.items);
      return;
    }

    let cancelled = false;
    setLoadingDetails(true);

    dashboardService
      .getTransactionDetails(transaction.id)
      .then((fetchedItems) => {
        if (!cancelled) setItems(fetchedItems);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });

    return () => {
      cancelled = true;
    };
  }, [transaction]);

  if (!transaction) return null;

  return (
    <Modal
      isOpen={Boolean(transaction)}
      onClose={onClose}
      title="Struk Transaksi Penjualan"
      subtitle={transaction.invoiceNumber}
      size="md"
    >
      <div className="p-6 space-y-5">
        {showSuccessBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Transaksi berhasil dicatat dan stok gudang telah diperbarui.</span>
          </div>
        )}

        {/* Area Kertas Struk */}
        <div className="rounded-xl border border-slate-300 bg-slate-50/70 p-5 space-y-4">
          <div className="text-center border-b border-dashed border-slate-300 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-2">
              <Store className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              POS &amp; ERP System
            </h4>
            <p className="text-[11px] text-slate-500">Bukti Pembayaran Resmi</p>
          </div>

          {/* Metadata Transaksi */}
          <div className="grid grid-cols-2 gap-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3.5">
            <span className="text-slate-500">No. Struk</span>
            <span className="text-right font-mono font-bold text-slate-900">
              {transaction.invoiceNumber}
            </span>

            <span className="text-slate-500">Waktu</span>
            <span className="text-right font-medium text-slate-800">
              {new Date(transaction.transactionDate).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            <span className="text-slate-500">Kasir</span>
            <span className="text-right font-medium text-slate-800">
              {transaction.cashierName}
            </span>

            <span className="text-slate-500">Metode Bayar</span>
            <span className="text-right">
              <Badge variant="info">{transaction.paymentMethod}</Badge>
            </span>
          </div>

          {/* Rincian Item */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rincian Pembelian
            </p>
            {loadingDetails ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Memuat rincian barang...</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Detail item tidak tersedia.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} {item.unitName} ×{' '}
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ringkasan Pembayaran */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-sm font-extrabold text-slate-900">
              <span>Total Tagihan</span>
              <span>{formatRupiah(transaction.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Dibayar</span>
              <span className="font-semibold">
                {formatRupiah(transaction.amountPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 font-bold">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Cetak Struk
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
}