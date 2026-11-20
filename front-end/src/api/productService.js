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
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
}

export function normalizeProduct(item) {
  return {
    id: item.id,
    sku: item.sku || item.code || item.barcode || '-',
    name: item.name || item.productName || '',
    category:
      typeof item.category === 'object' && item.category !== null
        ? item.category.name
        : item.category || item.categoryName || 'Umum',
    categoryId:
      typeof item.category === 'object' && item.category !== null
        ? item.category.id
        : item.categoryId || null,
    costPrice: Number(item.costPrice ?? item.buyPrice ?? item.purchasePrice ?? 0),
    price: Number(item.price ?? item.sellPrice ?? item.sellingPrice ?? 0),
    stock: Number(item.stock ?? item.quantity ?? 0),
    minStock: Number(item.minStock ?? item.minimumStock ?? 5),
  };
}

export const productService = {
  async getAll() {
    const res = await api.get('/products');
    return extractList(res).map(normalizeProduct);
  },

  async create(payload) {
    const res = await api.post('/products', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await api.put(`/products/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};