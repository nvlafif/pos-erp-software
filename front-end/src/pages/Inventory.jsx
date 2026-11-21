import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CalendarClock,
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  PackagePlus,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { productService, formatRupiah } from '../api/productService';
import ProductModal from '../components/ProductModal';

function isRenderableImage(value) {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [expiringAlert, setExpiringAlert] = useState(null);

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filter & parameter query backend
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL | LOW_STOCK | EXPIRING
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [thresholdParam, setThresholdParam] = useState('');
  const [daysParam, setDaysParam] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allList, lowList, expiringRes, catRes, unitRes] = await Promise.allSettled([
        productService.getAll(),
        productService.getLowStock(thresholdParam),
        productService.getExpiring(daysParam),
        productService.getCategories(),
        productService.getUnits(),
      ]);

      if (allList.status === 'fulfilled') {
        setProducts(allList.value);
      } else {
        throw allList.reason;
      }

      if (lowList.status === 'fulfilled') setLowStockProducts(lowList.value);
      if (expiringRes.status === 'fulfilled') {
        setExpiringProducts(expiringRes.value.items);
        setExpiringAlert(expiringRes.value.alertMessage);
      }
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
      if (unitRes.status === 'fulfilled') setUnits(unitRes.value);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal memuat data produk dari endpoint /api/products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const lowStockIdSet = useMemo(
    () => new Set(lowStockProducts.map((p) => p.id)),
    [lowStockProducts]
  );

  const expiringMap = useMemo(() => {
    const map = new Map();
    expiringProducts.forEach((p) => map.set(p.id, p));
    return map;
  }, [expiringProducts]);

  // Valuasi Aset Gudang berdasarkan Harga Modal (costPrice * stock)
  const totalAssetValue = useMemo(
    () => products.reduce((sum, p) => sum + p.costPrice * p.stock, 0),
    [products]
  );

  const categoryFilterOptions = useMemo(() => {
    const unique = new Set(products.map((p) => p.categoryName).filter(Boolean));
    return ['ALL', ...Array.from(unique)];
  }, [products]);

  const activeSourceList = useMemo(() => {
    if (activeTab === 'LOW_STOCK') return lowStockProducts;
    if (activeTab === 'EXPIRING') return expiringProducts;
    return products;
  }, [activeTab, products, lowStockProducts, expiringProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activeSourceList.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCategory =
        selectedCategory === 'ALL' || p.categoryName === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [activeSourceList, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setIsModalOpen(false);
      await fetchAllData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal menyimpan produk. Pastikan SKU unik serta Kategori & Satuan valid.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}" dari inventaris?`)) return;
    try {
      await productService.remove(product.id);
      await fetchAllData();
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
      await fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui stok masuk.');
    } finally {
      setSaving(false);
    }
  };

  const renderStockBadge = (product) => {
    const isLow = lowStockIdSet.has(product.id);
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Habis (0 {product.unitName})
        </span>
      );
    }
    if (isLow) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Menipis ({product.stock} {product.unitName})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        {product.stock} {product.unitName}
      </span>
    );
  };

  const renderExpirationBadge = (product) => {
    if (!product.hasExpiration || !product.expirationDate) {
      return <span className="text-xs text-slate-400">Non-Expired</span>;
    }

    const flagged = expiringMap.get(product.id);
    const status = flagged?.expirationStatus || product.expirationStatus;
    const daysRemaining = flagged?.daysRemaining ?? product.daysRemaining;

    if (status === 'EXPIRED' || (typeof daysRemaining === 'number' && daysRemaining < 0)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          EXPIRED ({product.expirationDate})
        </span>
      );
    }

    if (status === 'EXPIRING_SOON' || flagged) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          {typeof daysRemaining === 'number' ? `H-${daysRemaining} · ` : ''}
          {product.expirationDate}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        {product.expirationDate}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Gudang & Inventaris
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoring SKU produk, harga modal, peringatan stok minimum, dan masa kedaluwarsa
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAllData}
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

      {/* Banner Alert H-7 dari Backend /api/products/expiring */}
      {expiringAlert && expiringProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
          <CalendarClock className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{expiringAlert}</span>
        </div>
      )}

      {/* 4 Kartu Metrik Gudang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('ALL')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-300 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total SKU Produk</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{products.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Nilai Aset (Modal)</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatRupiah(totalAssetValue)}
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('LOW_STOCK')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-300 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Stok Menipis</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">
              {lowStockProducts.length}{' '}
              <span className="text-xs font-normal text-slate-400">item</span>
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 cursor-pointer hover:border-red-300 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Mendekati / Expired</p>
            <p className="text-2xl font-bold text-red-600 mt-0.5">
              {expiringProducts.length}{' '}
              <span className="text-xs font-normal text-slate-400">item</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bar Pencarian, Tab Endpoint & Parameter Query */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk atau kode SKU..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryFilterOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              {[
                { id: 'ALL', label: `Semua (${products.length})` },
                { id: 'LOW_STOCK', label: `Low Stock (${lowStockProducts.length})` },
                { id: 'EXPIRING', label: `Expiring (${expiringProducts.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    activeTab === tab.id
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

        {(activeTab === 'LOW_STOCK' || activeTab === 'EXPIRING') && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            {activeTab === 'LOW_STOCK' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">
                  Parameter <code>?threshold=</code> :
                </span>
                <input
                  type="number"
                  min="0"
                  value={thresholdParam}
                  onChange={(e) => setThresholdParam(e.target.value)}
                  placeholder="Default controller"
                  className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {activeTab === 'EXPIRING' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">
                  Parameter <code>?days=</code> :
                </span>
                <input
                  type="number"
                  min="1"
                  value={daysParam}
                  onChange={(e) => setDaysParam(e.target.value)}
                  placeholder="Default 7 hari"
                  className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="button"
              onClick={fetchAllData}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium transition cursor-pointer"
            >
              Terapkan Filter API
            </button>
          </div>
        )}
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
            <p className="text-sm font-medium text-slate-600">Tidak ada produk pada daftar ini</p>
            <p className="text-xs mt-1">
              Sesuaikan filter atau tambahkan produk baru ke dalam inventaris.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">SKU & Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Harga Modal</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-center">Stok & Satuan</th>
                  <th className="py-3.5 px-4 text-center">Kedaluwarsa</th>
                  <th className="py-3.5 px-4 text-right">Aksi Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {isRenderableImage(product.image) ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            {product.sku && (
                              <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {product.sku}
                              </span>
                            )}
                            {product.image && !isRenderableImage(product.image) && (
                              <span className="truncate max-w-36">{product.image}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatRupiah(product.costPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">{renderStockBadge(product)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {renderExpirationBadge(product)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockTarget(product);
                            setRestockQty('');
                          }}
                          title="Tambah Stok Masuk"
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
        categories={categories}
        units={units}
      />

      {/* Modal Cepat Barang Masuk */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickRestock}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">Input Barang Masuk</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {restockTarget.name} (Stok saat ini:{' '}
                <strong>
                  {restockTarget.stock} {restockTarget.unitName}
                </strong>
                )
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Tambahan ({restockTarget.unitName}) *
              </label>
              <input
                type="number"
                min="1"
                required
                autoFocus
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="Contoh: 20"
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