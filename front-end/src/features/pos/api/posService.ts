import api from '../../../api/axios';
import type {
  TransactionItemRecord,
  TransactionRecord,
} from '../../dashboard/types/dashboard.types';
import type { CreateTransactionPayload } from '../types/pos.types';

interface RawCreatedItem {
  productId?: number;
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    unitName?: string;
    unit?: { name?: string };
  };
  productName?: string;
  sku?: string;
  unitName?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  subtotal?: number;
}

interface RawCreatedTransaction {
  id?: number;
  invoiceNumber?: string;
  transactionCode?: string;
  code?: string;
  transactionDate?: string;
  createdAt?: string;
  cashierName?: string;
  cashier?: { name?: string; email?: string };
  user?: { name?: string; email?: string };
  customerName?: string;
  paymentMethod?: string;
  totalAmount?: number;
  total?: number;
  grandTotal?: number;
  payment?: number;
  amountPaid?: number;
  change?: number;
  changeAmount?: number;
  items?: RawCreatedItem[];
  transactionDetails?: RawCreatedItem[];
  details?: RawCreatedItem[];
}

export interface CheckoutItemMeta {
  name: string;
  sku: string;
  unitName: string;
  price: number;
}

export const posService = {
  async createTransaction(
    payload: CreateTransactionPayload,
    fallbackMeta: {
      cashierName: string;
      customerName: string;
      paymentMethod: string;
      totalAmount: number;
      itemMetaMap: Map<number, CheckoutItemMeta>;
    }
  ): Promise<TransactionRecord> {
    const res = await api.post('/transactions/checkout', payload);
    const raw: RawCreatedTransaction = res.data?.data ?? res.data ?? {};

    const rawItems =
      raw.items ?? raw.transactionDetails ?? raw.details ?? [];

    const normalizedItems: TransactionItemRecord[] =
      Array.isArray(rawItems) && rawItems.length > 0
        ? rawItems.map((item) => {
            const pId = Number(item.productId ?? item.product?.id ?? 0);
            const fallback = fallbackMeta.itemMetaMap.get(pId);
            const qty = Number(item.quantity ?? item.qty ?? 0);
            const price = Number(
              item.price ?? item.unitPrice ?? fallback?.price ?? 0
            );

            return {
              productId: pId,
              productName:
                item.productName ??
                item.product?.name ??
                fallback?.name ??
                'Produk',
              sku: item.sku ?? item.product?.sku ?? fallback?.sku ?? '-',
              unitName:
                item.unitName ??
                item.product?.unitName ??
                item.product?.unit?.name ??
                fallback?.unitName ??
                'pcs',
              quantity: qty,
              price,
              subtotal: Number(item.subtotal ?? qty * price),
            };
          })
        : payload.items.map((item) => {
            const fallback = fallbackMeta.itemMetaMap.get(item.productId);
            const price = fallback?.price ?? 0;
            return {
              productId: item.productId,
              productName: fallback?.name ?? 'Produk',
              sku: fallback?.sku ?? '-',
              unitName: fallback?.unitName ?? 'pcs',
              quantity: item.quantity,
              price,
              subtotal: price * item.quantity,
            };
          });

    const totalAmount = Number(
      raw.totalAmount ?? raw.total ?? raw.grandTotal ?? fallbackMeta.totalAmount
    );
    const amountPaid = Number(
      raw.payment ?? raw.amountPaid ?? payload.payment
    );
    const changeAmount = Number(
      raw.change ?? raw.changeAmount ?? Math.max(0, amountPaid - totalAmount)
    );

    return {
      id: Number(raw.id ?? Date.now()),
      invoiceNumber:
        raw.invoiceNumber ??
        raw.transactionCode ??
        raw.code ??
        `TRX-${String(raw.id ?? Date.now()).padStart(4, '0')}`,
      transactionDate:
        raw.transactionDate ?? raw.createdAt ?? new Date().toISOString(),
      cashierName:
        raw.cashierName ??
        raw.cashier?.name ??
        raw.user?.name ??
        fallbackMeta.cashierName,
      customerName:
        raw.customerName?.trim() ||
        fallbackMeta.customerName ||
        'Pelanggan Umum',
      paymentMethod: String(
        raw.paymentMethod ?? fallbackMeta.paymentMethod ?? 'CASH'
      ).toUpperCase(),
      totalAmount,
      amountPaid,
      changeAmount,
      items: normalizedItems,
    };
  },
};