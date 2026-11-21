import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatRupiah } from '../api/productService';

const INITIAL_FORM = {
  sku: '',
  name: '',
  costPrice: '',
  price: '',
  stock: '',
  image: '',
  hasExpiration: false,
  expirationDate: '',
  categoryId: '',
  unitId: '',
};

function compressImageToDataUrl(file, maxSize = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('File gambar tidak valid atau rusak.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  saving,
  categories = [],
  units = [],
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageError, setImageError] = useState('');
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setImageError('');

    if (initialData) {
      setForm({
        sku: initialData.sku || '',
        name: initialData.name || '',
        costPrice: initialData.costPrice ?? '',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        image: initialData.image || '',
        hasExpiration: Boolean(initialData.hasExpiration),
        expirationDate: initialData.expirationDate || '',
        categoryId: initialData.categoryId ? String(initialData.categoryId) : '',
        unitId: initialData.unitId ? String(initialData.unitId) : '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Harap pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran file maksimal 5 MB.');
      return;
    }

    setProcessingImage(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setForm((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      setImageError(err.message);
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const margin = (Number(form.price) || 0) - (Number(form.costPrice) || 0);
  const hasPreviewableImage =
    form.image &&
    (form.image.startsWith('data:image') ||
      form.image.startsWith('http') ||
      form.image.startsWith('/'));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
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

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode SKU *
              </label>
              <input
                type="text"
                name="sku"
                required
                value={form.sku}
                onChange={handleChange}
                placeholder="BRG-001"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Susu UHT Full Cream 1L"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori *
              </label>
              <select
                name="categoryId"
                required
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {categories.length === 0
                    ? '-- Data kategori kosong --'
                    : '-- Pilih Kategori --'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan (Unit) *
              </label>
              <select
                name="unitId"
                required
                value={form.unitId}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {units.length === 0 ? '-- Data satuan kosong --' : '-- Pilih Satuan --'}
                </option>
                {units.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                    {u.symbol ? ` (${u.symbol})` : ''}
                  </option>
                ))}
              </select>
            </div>
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
                placeholder="18000"
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

          {(form.costPrice !== '' || form.price !== '') && (
            <div className="text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Estimasi Margin per Unit:</span>
              <span
                className={`font-semibold ${
                  margin >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatRupiah(margin)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stok Awal *
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              required
              value={form.stock}
              onChange={handleChange}
              placeholder="30"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attach File Gambar Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gambar Produk
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {form.image ? (
              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                {hasPreviewableImage ? (
                  <img
                    src={form.image}
                    alt="Preview produk"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {hasPreviewableImage ? 'Gambar siap disimpan ke database' : form.image}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Ganti Gambar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={processingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition flex flex-col items-center justify-center gap-1.5 text-slate-500 cursor-pointer"
              >
                {processingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Memproses gambar...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Klik untuk pilih file gambar
                    </span>
                    <span className="text-[11px] text-slate-400">
                      JPG, PNG, atau WebP (Maks. 5 MB)
                    </span>
                  </>
                )}
              </button>
            )}

            {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="hasExpiration"
                checked={form.hasExpiration}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Produk memiliki tanggal kedaluwarsa
              </span>
            </label>

            {form.hasExpiration && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kedaluwarsa *
                </label>
                <input
                  type="date"
                  name="expirationDate"
                  required={form.hasExpiration}
                  value={form.expirationDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
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
              disabled={saving || processingImage}
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