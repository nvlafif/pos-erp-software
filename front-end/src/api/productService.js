import api from './axios';

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function extractList(response) {
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function formatIsoDate(rawDate) {
  if (!rawDate) return null;
  if (Array.isArray(rawDate) && rawDate.length >= 3) {
    const [y, m, d] = rawDate;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return String(rawDate).slice(0, 10);
}

export function normalizeProduct(item) {
  const source = item.product || item;
  const categoryId = source.category?.id ?? '';
  const unitId = source.unit?.id ?? '';

  return {
    id: source.id,
    sku: source.sku || '',
    name: source.name || '',
    costPrice: Number(source.costPrice ?? 0),
    price: Number(source.price ?? 0),
    stock: Number(source.stock ?? 0),
    image: source.image || '',
    hasExpiration: Boolean(source.hasExpiration),
    expirationDate: formatIsoDate(source.expirationDate),
    categoryId,
    categoryName:
      source.category?.name || (categoryId ? `Kategori #${categoryId}` : 'Tanpa Kategori'),
    unitId,
    unitName: source.unit?.name || (unitId ? `Satuan #${unitId}` : 'unit'),
    expirationStatus: item.status || source.status || null,
    daysRemaining: item.daysRemaining ?? source.daysRemaining ?? null,
  };
}

export function toProductPayload(data) {
  const hasExp = Boolean(data.hasExpiration);
  return {
    sku: data.sku?.trim() || null,
    name: data.name.trim(),
    costPrice: Number(data.costPrice) || 0,
    price: Number(data.price) || 0,
    stock: Number(data.stock) || 0,
    image: data.image?.trim() || null,
    hasExpiration: hasExp,
    expirationDate: hasExp && data.expirationDate ? data.expirationDate : null,
    category: data.categoryId ? { id: Number(data.categoryId) } : null,
    unit: data.unitId ? { id: Number(data.unitId) } : null,
  };
}

export const productService = {
  async getAll() {
    const res = await api.get('/products');
    return extractList(res).map(normalizeProduct);
  },

  async getCategories() {
    const res = await api.get('/categories');
    return extractList(res);
  },

  async getUnits() {
    const res = await api.get('/units');
    return extractList(res);
  },

  async getLowStock(threshold) {
    const params = threshold !== '' && threshold != null ? { threshold: Number(threshold) } : {};
    const res = await api.get('/products/low-stock', { params });
    return extractList(res).map(normalizeProduct);
  },

  async getExpiring(days) {
    const params = days !== '' && days != null ? { days: Number(days) } : {};
    const res = await api.get('/products/expiring', { params });
    return {
      alertMessage: res.data?.alert || res.data?.message || null,
      items: extractList(res).map(normalizeProduct),
    };
  },

  async create(formData) {
    const res = await api.post('/products', toProductPayload(formData));
    return res.data;
  },

  async update(id, formData) {
    const res = await api.put(`/products/${id}`, toProductPayload(formData));
    return res.data;
  },

  async remove(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};