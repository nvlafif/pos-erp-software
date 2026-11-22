export type DashboardPeriod = 'TODAY' | '7D' | '30D' | 'ALL';

export interface TransactionItemRecord {
  productId: number;
  productName: string;
  sku: string;
  unitName: string;
  quantity: number;
  price: number;
  costPrice?: number;
  subtotal: number;
}

export interface TransactionRecord {
  id: number;
  invoiceNumber: string;
  transactionDate: string;
  cashierName: string;
  customerName: string;
  paymentMethod: string;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  items: TransactionItemRecord[];
}

export interface DailyRevenuePoint {
  dateKey: string;
  label: string;
  revenue: number;
  transactionCount: number;
}

export interface PaymentBreakdownItem {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface TopProductItem {
  productId: number;
  name: string;
  sku: string;
  unitName: string;
  qtySold: number;
  revenue: number;
}

export interface InventoryRiskSummary {
  totalSku: number;
  totalAssetValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}