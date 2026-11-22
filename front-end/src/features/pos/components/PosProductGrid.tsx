import {
  Search,
  Package,
  Plus,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
  formatRupiah,
  getDaysUntilDate,
  isRenderableImage,
} from '../../../utils/formatters';
import {
  EXPIRING_WARNING_DAYS,
  getLowStockThreshold,
} from '../../inventory/hooks/useInventory';
import type { Product } from '../../inventory/types/inventory.types';
import { isProductExpired } from '../hooks/usePosTerminal';

interface PosProductGridProps {
  products: Product[];
  categories: string[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onBarcodeEnter: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  cartQuantityMap: Map<number, number>;
  onAddProduct: (product: Product) => void;
}

export default function PosProductGrid({
  products,
  categories,
  loading,
  searchQuery,
  onSearchChange,
  onBarcodeEnter,
  selectedCategory,
  onCategoryChange,
  cartQuantityMap,
  onAddProduct,
}: PosProductGridProps) {
  return (
    <div className="space-y-4">
      {/* Bar Pencarian SKU / Nama & Filter Kategori */}
      <Card className="p-4 border-slate-300 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onBarcodeEnter();
              }
            }}
            placeholder="Cari nama barang atau scan/ketik kode SKU lalu tekan Enter..."
            className="w-full pl-10 pr-9 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Kategori */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid Kartu Produk */}
      {loading ? (
        <Card className="py-20 border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <p className="text-sm">Memuat katalog kasir...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card className="py-20 border-slate-300 text-center text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-slate-600">
            Produk tidak ditemukan
          </p>
          <p className="text-xs mt-1">
            Coba kata kunci lain atau pilih kategori &ldquo;Semua Produk&rdquo;.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {products.map((product) => {
            const expired = isProductExpired(product);
            const outOfStock = product.stock <= 0;
            const disabled = expired || outOfStock;
            const inCartQty = cartQuantityMap.get(product.id) ?? 0;

            const isLowStock =
              !outOfStock &&
              product.stock <= getLowStockThreshold(product.unitName);

            const daysUntilExp =
              product.hasExpiration && product.expirationDate
                ? product.daysRemaining ??
                  getDaysUntilDate(product.expirationDate)
                : null;
            const isExpiringSoon =
              !expired &&
              daysUntilExp !== null &&
              daysUntilExp <= EXPIRING_WARNING_DAYS;

            return (
              <button
                key={product.id}
                type="button"
                disabled={disabled}
                onClick={() => onAddProduct(product)}
                className={`text-left rounded-xl border bg-white p-3.5 flex flex-col justify-between transition relative ${
                  disabled
                    ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                    : inCartQty > 0
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm cursor-pointer'
                    : 'border-slate-300 hover:border-blue-400 hover:shadow-md cursor-pointer'
                }`}
              >
                {/* Badge Qty di Keranjang */}
                {inCartQty > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {inCartQty}
                  </span>
                )}

                <div className="flex items-start gap-3">
                  {isRenderableImage(product.image) ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.sku && (
                        <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 truncate">
                        {product.categoryName}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-slate-900 mt-1 line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-blue-600">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      per {product.unitName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {expired ? (
                      <Badge variant="danger">EXPIRED</Badge>
                    ) : outOfStock ? (
                      <Badge variant="danger">Habis</Badge>
                    ) : isExpiringSoon ? (
                      <Badge variant="warning">H-{daysUntilExp}</Badge>
                    ) : isLowStock ? (
                      <Badge variant="warning">
                        Sisa {product.stock}
                      </Badge>
                    ) : (
                      <Badge variant="success">
                        Stok {product.stock}
                      </Badge>
                    )}

                    {!disabled && (
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}