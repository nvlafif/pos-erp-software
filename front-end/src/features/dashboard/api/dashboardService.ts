import api from '../../../api/axios';
import type {
  TransactionItemRecord,
  TransactionRecord,
} from '../types/dashboard.types';

interface RawTransactionItem {
  productId?: number;
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    costPrice?: number;
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
  costPrice?: number;
  subtotal?: number;
}

interface RawTransaction {
  id?: number;
  invoiceNumber?: string;
  transactionCode?: string;
  transactionDate?: string;
  createdAt?: string;
  cashierName?: string;
  cashier?: { name?: string; email?: string };
  user?: { name?: string; email?: string };
  customerName?: string;
  paymentMethod?: string;
  totalAmount?: number;
  grandTotal?: number;
  amountPaid?: number;
  changeAmount?: number;
  items?: RawTransactionItem[];
  transactionDetails?: RawTransactionItem[];
  details?: RawTransactionItem[];
}

function normalizeItem(raw: RawTransactionItem): TransactionItemRecord {
  const qty = Number(raw.quantity ?? raw.qty ?? 0);
  const price = Number(raw.price ?? raw.unitPrice ?? 0);
  const productObj = raw.product;

  return {
    productId: Number(raw.productId ?? productObj?.id ?? 0),
    productName: raw.productName ?? productObj?.name ?? 'Produk',
    sku: raw.sku ?? productObj?.sku ?? '',
    unitName: raw.unitName ?? productObj?.unitName ?? productObj?.unit?.name ?? 'pcs',
    quantity: qty,
    price,
    costPrice:
      raw.costPrice !== undefined
        ? Number(raw.costPrice)
        : productObj?.costPrice !== undefined
        ? Number(productObj.costPrice)
        : undefined,
    subtotal: Number(raw.subtotal ?? qty * price),
  };
}

function normalizeTransaction(raw: RawTransaction, index: number): TransactionRecord {
  const rawItems = raw.items ?? raw.transactionDetails ?? raw.details ?? [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeItem) : [];

  const computedTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = Number(raw.totalAmount ?? raw.grandTotal ?? computedTotal);

  return {
    id: Number(raw.id ?? index + 1),
    invoiceNumber:
      raw.invoiceNumber ?? raw.transactionCode ?? `TRX-${String(raw.id ?? index + 1).padStart(4, '0')}`,
    transactionDate: raw.transactionDate ?? raw.createdAt ?? new Date().toISOString(),
    cashierName:
      raw.cashierName ??
      raw.cashier?.name ??
      raw.user?.name ??
      'Kasir',
    customerName: raw.customerName?.trim() || 'Pelanggan Umum',
    paymentMethod: String(raw.paymentMethod ?? 'CASH').toUpperCase(),
    totalAmount,
    amountPaid: Number(raw.amountPaid ?? totalAmount),
    changeAmount: Number(raw.changeAmount ?? 0),
    items,
  };
}

export const dashboardService = {
  async getTransactions(): Promise<TransactionRecord[]> {
    const res = await api.get('/transactions');
    const list: RawTransaction[] =
      res.data?.data ?? res.data?.content ?? res.data ?? [];

    if (!Array.isArray(list)) return [];

    return list
      .map(normalizeTransaction)
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
  },
};