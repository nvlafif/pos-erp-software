import api from '../../../api/axios';
import type {
  ReportFilterParams,
  TransactionItemRecord,
  TransactionRecord,
  TransactionReportSummary,
} from '../types/dashboard.types';

interface RawTransactionItem {
  id?: number;
  productId?: number;
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    costPrice?: number;
    price?: number;
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
  items?: RawTransactionItem[];
  transactionDetails?: RawTransactionItem[];
  details?: RawTransactionItem[];
}

export function normalizeTransactionItem(
  raw: RawTransactionItem
): TransactionItemRecord {
  const qty = Number(raw.quantity ?? raw.qty ?? 0);
  const productObj = raw.product;
  const price = Number(
    raw.price ?? raw.unitPrice ?? productObj?.price ?? 0
  );

  return {
    productId: Number(raw.productId ?? productObj?.id ?? 0),
    productName: raw.productName ?? productObj?.name ?? 'Produk',
    sku: raw.sku ?? productObj?.sku ?? '-',
    unitName:
      raw.unitName ?? productObj?.unitName ?? productObj?.unit?.name ?? 'pcs',
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

function normalizeTransactionHeader(
  raw: RawTransaction,
  index = 0
): TransactionRecord {
  const rawItems = raw.items ?? raw.transactionDetails ?? raw.details ?? [];
  const items = Array.isArray(rawItems)
    ? rawItems.map(normalizeTransactionItem)
    : [];

  const computedTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = Number(
    raw.totalAmount ?? raw.total ?? raw.grandTotal ?? computedTotal
  );
  const amountPaid = Number(raw.payment ?? raw.amountPaid ?? totalAmount);
  const changeAmount = Number(
    raw.change ?? raw.changeAmount ?? Math.max(0, amountPaid - totalAmount)
  );

  return {
    id: Number(raw.id ?? index + 1),
    invoiceNumber:
      raw.invoiceNumber ??
      raw.transactionCode ??
      raw.code ??
      `TRX-${String(raw.id ?? index + 1).padStart(4, '0')}`,
    transactionDate:
      raw.transactionDate ?? raw.createdAt ?? new Date().toISOString(),
    cashierName:
      raw.cashierName ??
      raw.cashier?.name ??
      raw.user?.name ??
      'Kasir',
    customerName: raw.customerName?.trim() || 'Pelanggan Umum',
    paymentMethod: String(raw.paymentMethod ?? 'CASH').toUpperCase(),
    totalAmount,
    amountPaid,
    changeAmount,
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
      .map((item, idx) => normalizeTransactionHeader(item, idx))
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
  },

  async getTransactionById(id: number): Promise<TransactionRecord> {
    const res = await api.get(`/transactions/${id}`);
    const raw: RawTransaction = res.data?.data ?? res.data ?? {};
    return normalizeTransactionHeader(raw);
  },

  async getTransactionDetails(id: number): Promise<TransactionItemRecord[]> {
    const res = await api.get(`/transactions/${id}/details`);
    const list: RawTransactionItem[] =
      res.data?.data ?? res.data?.content ?? res.data ?? [];
    return Array.isArray(list) ? list.map(normalizeTransactionItem) : [];
  },

  async getTransactionReport(
    params: ReportFilterParams
  ): Promise<TransactionReportSummary> {
    const queryParams: Record<string, string | number> = {
      period: params.period,
    };

    if (params.period === 'MONTH') {
      if (params.year) queryParams.year = params.year;
      if (params.month) queryParams.month = params.month;
    } else if (params.period === 'CUSTOM') {
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
    }

    const res = await api.get('/transactions/report', { params: queryParams });
    const raw = res.data?.data ?? res.data ?? {};

    return {
      transactionCount: Number(
        raw.totalTransactions ??
          raw.transactionCount ??
          raw.totalTransaksi ??
          raw.count ??
          0
      ),
      totalRevenue: Number(
        raw.totalRevenue ??
          raw.totalOmzet ??
          raw.totalAmount ??
          raw.revenue ??
          raw.omzet ??
          0
      ),
    };
  },
};