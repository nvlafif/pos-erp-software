import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatRupiah } from '../../../utils/formatters';
import type { CartItem, PaymentMethod } from '../types/pos.types';

interface PosCartPanelProps {
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  amountPaidInput: string;
  onAmountPaidChange: (val: string) => void;
  parsedAmountPaid: number;
  changeAmount: number;
  isPaymentValid: boolean;
  submitting: boolean;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { id: 'CASH', label: 'Tunai', icon: Banknote },
  { id: 'QRIS', label: 'QRIS', icon: QrCode },
  { id: 'TRANSFER', label: 'Transfer', icon: Building2 },
];

const QUICK_CASH_AMOUNTS = [10000, 20000, 50000, 100000];

export default function PosCartPanel({
  cart,
  totalItems,
  totalAmount,
  paymentMethod,
  onPaymentMethodChange,
  amountPaidInput,
  onAmountPaidChange,
  parsedAmountPaid,
  changeAmount,
  isPaymentValid,
  submitting,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: PosCartPanelProps) {
  return (
    <Card className="border-slate-300 overflow-hidden flex flex-col sticky top-6">
      {/* Header Keranjang */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Keranjang Belanja</h3>
            <p className="text-[11px] text-slate-400">
              {cart.length} jenis · {totalItems} total item
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan
          </button>
        )}
      </div>

      {/* Daftar Item Keranjang */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 bg-white">
        {cart.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400">
            <ShoppingCart className="w-9 h-9 mx-auto mb-2 opacity-35" />
            <p className="text-xs font-medium text-slate-600">
              Keranjang masih kosong
            </p>
            <p className="text-[11px] mt-0.5">
              Klik produk di sebelah kiri untuk menambahkan ke transaksi.
            </p>
          </div>
        ) : (
          cart.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formatRupiah(product.price)} × {quantity} {product.unitName}
                </p>
                <p className="text-xs font-bold text-blue-600 mt-0.5">
                  {formatRupiah(product.price * quantity)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQty(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock}
                  onClick={() => onUpdateQty(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(product.id)}
                  title="Hapus Item"
                  className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Metode Pembayaran & Total */}
      <div className="p-4 bg-slate-50 border-t border-slate-300 space-y-4">
        {/* Pilihan Metode Pembayaran */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onPaymentMethodChange(id)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Uang Tunai jika Metode CASH */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Uang Diterima (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={amountPaidInput}
              onChange={(e) => onAmountPaidChange(e.target.value)}
              placeholder="Masukkan nominal bayar..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap gap-1.5">
              {totalAmount > 0 && (
                <button
                  type="button"
                  onClick={() => onAmountPaidChange(String(totalAmount))}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                >
                  Uang Pas
                </button>
              )}
              {QUICK_CASH_AMOUNTS.map((nominal) => (
                <button
                  key={nominal}
                  type="button"
                  onClick={() => onAmountPaidChange(String(nominal))}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {formatRupiah(nominal)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ringkasan Total & Kembalian */}
        <div className="pt-3 border-t border-slate-300 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Total Tagihan</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Kembalian</span>
              <span
                className={`font-bold ${
                  parsedAmountPaid < totalAmount && totalAmount > 0
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
                {parsedAmountPaid < totalAmount && totalAmount > 0
                  ? `Kurang ${formatRupiah(totalAmount - parsedAmountPaid)}`
                  : formatRupiah(changeAmount)}
              </span>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="emerald"
          size="lg"
          icon={CheckCircle2}
          disabled={!isPaymentValid}
          isLoading={submitting}
          onClick={onCheckout}
          className="w-full"
        >
          Proses Pembayaran
        </Button>
      </div>
    </Card>
  );
}