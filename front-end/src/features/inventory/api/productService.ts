import api from '../../../api/axios';
import { formatIsoDate } from '../../../utils/formatters';
import type {
  Category,
  ExpiringResult,
  Product,
  ProductFormValues,
  Unit,
} from '../types/inventory.types';

interface RawProductFields {
  id?: number;
  productId?: number;
  sku?: string;
  name?: string;
  costPrice?: number;
  price?: number;
  stock?: number;
  image?: string;
  hasExpiration?: boolean;
  expirationDate?: string | number[] | null;
  categoryId?: number;
  categoryName?: string;
  category?: { id?: number; categoryId?: number; name?: string } | string | null;
  unitId?: number;
  unitName?: string;
  unit?: { id?: number; unitId?: number; name?: string; symbol?: string } | string | null;
  expirationStatus?: 'EXPIRED' | 'EXPIRING_SOON' | null;
  daysRemaining?: number | null;
}

interface RawProduct extends RawProductFields {
  product?: RawProductFields;
  item?: RawProductFields;
}

function normalizeProduct(raw: RawProduct): Product {
  const src: RawProductFields = raw.product ?? raw.item ?? raw;

  const categoryObj =
    typeof src.category === 'object' && src.category !== null ? src.category : null;
  const unitObj =
    typeof src.unit === 'object' && src.unit !== null ? src.unit : null;

  const categoryName =
    src.categoryName ??
    (typeof src.category === 'string' ? src.category : categoryObj?.name) ??
    '-';

  const unitName =
    src.unitName ??
    (typeof src.unit === 'string' ? src.unit : unitObj?.name || unitObj?.symbol) ??
    'pcs';

  return {
    id: Number(src.id ?? src.productId ?? raw.id ?? 0),
    sku: src.sku ?? '',
    name: src.name ?? '',
    costPrice: Number(src.costPrice ?? 0),
    price: Number(src.price ?? 0),
    stock: Number(src.stock ?? 0),
    image: src.image ?? '',
    hasExpiration: Boolean(src.hasExpiration),
    expirationDate: formatIsoDate(src.expirationDate),
    categoryId: src.categoryId ?? categoryObj?.id ?? categoryObj?.categoryId ?? '',
    categoryName: categoryName || '-',
    unitId: src.unitId ?? unitObj?.id ?? unitObj?.unitId ?? '',
    unitName: unitName || 'pcs',
    expirationStatus: raw.expirationStatus ?? src.expirationStatus ?? null,
    daysRemaining: raw.daysRemaining ?? src.daysRemaining ?? null,
  };
}

function toNullableId(value: number | string | '' | undefined): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildPayload(data: ProductFormValues | Partial<Product>) {
  const hasExpiration = Boolean(data.hasExpiration);
  const categoryId = toNullableId(data.categoryId);
  const unitId = toNullableId(data.unitId);

  return {
    sku: String(data.sku ?? '').trim(),
    name: String(data.name ?? '').trim(),
    costPrice: Number(data.costPrice ?? 0),
    price: Number(data.price ?? 0),
    stock: Number(data.stock ?? 0),
    image: data.image || '',
    hasExpiration,
    expirationDate: hasExpiration && data.expirationDate ? data.expirationDate : null,
    categoryId,
    unitId,
    category: categoryId !== null ? { id: categoryId } : null,
    unit: unitId !== null ? { id: unitId } : null,
  };
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api.get('/products');
    const list: RawProduct[] = res.data?.data ?? res.data?.content ?? res.data ?? [];
    return Array.isArray(list) ? list.map(normalizeProduct) : [];
  },

  async getLowStock(threshold?: string): Promise<Product[]> {
    const params = threshold !== '' && threshold !== undefined ? { threshold } : undefined;
    const res = await api.get('/products/low-stock', { params });
    const list: RawProduct[] = res.data?.data ?? res.data?.content ?? res.data ?? [];
    return Array.isArray(list) ? list.map(normalizeProduct) : [];
  },

  async getExpiring(days?: string): Promise<ExpiringResult> {
    const params = days !== '' && days !== undefined ? { days } : undefined;
    const res = await api.get('/products/expiring', { params });
    const body = res.data?.data ?? res.data;

    if (Array.isArray(body)) {
      return { items: body.map(normalizeProduct), alertMessage: null };
    }

    const rawItems: RawProduct[] =
      body?.items ?? body?.products ?? body?.expiringProducts ?? [];
    return {
      items: Array.isArray(rawItems) ? rawItems.map(normalizeProduct) : [],
      alertMessage: body?.alertMessage ?? body?.message ?? null,
    };
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get('/categories');
    const list = res.data?.data ?? res.data ?? [];
    if (!Array.isArray(list)) return [];
    return list.map((item: { id?: number; categoryId?: number; name?: string }) => ({
      id: Number(item.id ?? item.categoryId),
      name: item.name ?? '',
    }));
  },

  async getUnits(): Promise<Unit[]> {
    const res = await api.get('/units');
    const list = res.data?.data ?? res.data ?? [];
    if (!Array.isArray(list)) return [];
    return list.map(
      (item: { id?: number; unitId?: number; name?: string; symbol?: string }) => ({
        id: Number(item.id ?? item.unitId),
        name: item.name ?? '',
        symbol: item.symbol,
      })
    );
  },

  async create(formData: ProductFormValues): Promise<Product> {
    const res = await api.post('/products', buildPayload(formData));
    return normalizeProduct(res.data?.data ?? res.data);
  },

  async update(id: number, formData: ProductFormValues | Partial<Product>): Promise<Product> {
    const res = await api.put(`/products/${id}`, buildPayload(formData));
    return normalizeProduct(res.data?.data ?? res.data);
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};