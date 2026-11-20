import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';

const INITIAL_FORM = {
  sku: '',
  name: '',
  category: '',
  costPrice: '',
  price: '',
  stock: '',
  minStock: '5',
};

export default function ProductModal({ isOpen, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        sku: initialData.sku === '-' ? '' : initialData.sku,
        name: initialData.name || '',
        category: initialData.category || '',
        costPrice: initialData.costPrice ?? '',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        minStock: initialData.minStock ?? '5',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim() || 'Umum',
      costPrice: Number(form.costPrice) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode SKU / Barcode *
              </label>
              <input
                type="text"
                name="sku"
                required
                value={form.sku}
                onChange={handleChange}
                placeholder="BRG-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Minuman / Sembako"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Kopi Arabika 250gr"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Modal (Rp) *
              </label>
              <input
                type="number"
                name="costPrice"
                min="0"
                required
                value={form.costPrice}
                onChange={handleChange}
                placeholder="15000"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                name="price"
                min="0"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="22000"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Stok *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                required
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Peringatan Stok Minimum
              </label>
              <input
                type="number"
                name="minStock"
                min="0"
                value={form.minStock}
                onChange={handleChange}
                placeholder="5"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center gap-2 transition cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Produk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}