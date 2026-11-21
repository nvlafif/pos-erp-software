export interface Category {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol?: string;
}

export type ExpirationStatus = 'EXPIRED' | 'EXPIRING_SOON' | null;
export type InventoryTab =
  | 'ALL'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'EXPIRING_SOON'
  | 'EXPIRED';

export interface Product {
  id: number;
  sku: string;
  name: string;
  costPrice: number;
  price: number;
  stock: number;
  image: string;
  hasExpiration: boolean;
  expirationDate: string | null;
  categoryId: number | '';
  categoryName: string;
  unitId: number | '';
  unitName: string;
  expirationStatus?: ExpirationStatus;
  daysRemaining?: number | null;
}

export interface ProductFormValues {
  sku: string;
  name: string;
  costPrice: number | string;
  price: number | string;
  stock: number | string;
  image: string;
  hasExpiration: boolean;
  expirationDate: string;
  categoryId: string;
  unitId: string;
}

export interface ExpiringResult {
  items: Product[];
  alertMessage: string | null;
}