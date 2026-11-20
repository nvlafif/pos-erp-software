import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  PackagePlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { productService, formatRupiah } from '../api/productService';
import ProductModal from '../components/ProductModal';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | LOW | OUT
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal memuat data inventaris. Periksa koneksi endpoint /api/products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hitung KPI Ringkasan Gudang
  const stats = useMemo(() => {
    const totalSku = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const assetValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
    return { totalSku, totalUnits, lowStockCount, assetValue };
  }, [products]);

  // Daftar kategori unik untuk dropdown filter
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(unique)];
  }, [products]);

  // Data tabel setelah difilter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;

      const matchStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'OUT' && p.stock === 0) ||
        (stockFilter === 'LOW' && p.stock > 0 && p.stock <= p.minStock);

      return matchQuery && matchCategory && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
      } else {
        await productService.create(payload);
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data produk.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}" dari inventaris?`)) return;
    try {
      await productService.remove(product.id);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const handleQuickRestock = async (e) => {
    e.preventDefault();
    const added = Number(restockQty);
    if (!restockTarget || added <= 0) return;

    setSaving(true);
    try {
      await productService.update(restockTarget.id, {
        ...restockTarget,
        stock: restockTarget.stock + added,
      });
      setRestockTarget(null);
      setRestockQty('');
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui stok barang masuk.');
    } finally {
      setSaving(false);
    }
  };

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Habis (0)
        </span>
      );
    }
    if (stock <= minStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Menipis ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        Tersedia ({stock})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Gudang & Inventaris
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pantau ketersediaan stok fisik, barang masuk, dan master harga produk
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Kartu Metrik Ringkasan Gudang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total SKU Produk</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalSku}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Unit di Gudang</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.totalUnits.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Stok Kritis / Habis</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">
              {stats.lowStockCount}{' '}
              <span className="text-xs font-normal text-slate-400">item</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Nilai Aset (Modal)</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatRupiah(stats.assetValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang atau kode SKU..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'LOW', label: 'Menipis' },
              { id: 'OUT', label: 'Habis' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStockFilter(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  stockFilter === tab.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Data Inventaris */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-sm">Memuat data stok gudang...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-slate-600">Tidak ada produk ditemukan</p>
            <p className="text-xs mt-1">
              Ubah kata kunci pencarian atau tambahkan produk baru ke gudang.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">SKU & Nama Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Harga Modal</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-center">Status Stok</th>
                  <th className="py-3.5 px-4 text-right">Aksi Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatRupiah(product.costPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStockBadge(product.stock, product.minStock)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockTarget(product);
                            setRestockQty('');
                          }}
                          title="Tambah Stok Masuk (Restock)"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          Stok
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Produk"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          title="Hapus Produk"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Produk */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        saving={saving}
      />

      {/* Modal Cepat Barang Masuk (Restock) */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickRestock}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">Input Barang Masuk</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {restockTarget.name} (Stok saat ini: <strong>{restockTarget.stock}</strong>)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Unit Masuk (+)
              </label>
              <input
                type="number"
                min="1"
                required
                autoFocus
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="Contoh: 25"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockTarget(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {saving ? 'Menyimpan...' : 'Tambahkan Stok'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}