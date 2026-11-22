import type { Product } from '../../inventory/types/inventory.types';

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateTransactionItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateTransactionPayload {
  payment: number;
  paymentMethod: PaymentMethod;
  items: CreateTransactionItemPayload[];
}