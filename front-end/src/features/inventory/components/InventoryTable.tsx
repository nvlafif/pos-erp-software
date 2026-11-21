import {
  Package,
  Eye,
  Pencil,
  Trash2,
  PackagePlus,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
  formatRupiah,
  getDaysUntilDate,
  isRenderableImage,
} from '../../../utils/formatters';
import { getLowStockThreshold } from '../hooks/useInventory';
import type { Product } from '../types/inventory.types';

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  lowStockIdSet: Set<number>;
  expiringMap: Map<number, Product>;
  warningDays?: number;
  onView: (product: Product) => void;
  onRestock: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function InventoryTable({
  products,
  loading,
  lowStockIdSet,
  expiringMap,
  warningDays = 7,
  onView,
  onRestock,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const renderStockBadge = (product: Product) => {
    if (product.stock <= 0) {
      return <Badge variant="danger">Habis (0 {product.unitName})</Badge>;
    }
    if (
      lowStockIdSet.has(product.id) ||
      product.stock <= getLowStockThreshold(product.unitName)
    ) {
      return (
        <Badge variant="warning">
          Low Stock ({product.stock} {product.unitName})
        </Badge>
      );
    }
    return (
      <Badge variant="success">
        {product.stock} {product.unitName}
      </Badge>
    );
  };

  const renderExpirationBadge = (product: Product) => {
    if (!product.hasExpiration || !product.expirationDate) {
      return <Badge variant="success">Non-Expired</Badge>;
    }

    const flagged = expiringMap.get(product.id);
    const status = flagged?.expirationStatus ?? product.expirationStatus;
    const daysRemaining =
      flagged?.daysRemaining ??
      product.daysRemaining ??
      getDaysUntilDate(product.expirationDate);

    if (status === 'EXPIRED' || daysRemaining < 0) {
      return <Badge variant="danger">EXPIRED ({product.expirationDate})</Badge>;
    }

    if (
      status === 'EXPIRING_SOON' ||
      Boolean(flagged) ||
      daysRemaining <= warningDays
    ) {
      const prefix = daysRemaining === 0 ? 'Hari Ini · ' : `H-${daysRemaining} · `;
      return (
        <Badge variant="warning">
          {prefix}
          {product.expirationDate}
        </Badge>
      );
    }

    return <Badge variant="success">{product.expirationDate}</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <p className="text-sm">Memuat data stok gudang...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-slate-600">
            Tidak ada produk pada daftar ini
          </p>
          <p className="text-xs mt-1">
            Sesuaikan filter atau tambahkan produk baru ke dalam inventaris.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU & Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Modal</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-center">Stok & Satuan</th>
                <th className="py-3.5 px-4 text-center">Kedaluwarsa</th>
                <th className="py-3.5 px-4 text-right">Aksi Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="odd:bg-white even:bg-slate-200/50 hover:bg-blue-50/50 transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {isRenderableImage(product.image) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {product.name}
                        </p>
                        {product.sku && (
                          <span className="inline-block mt-0.5 font-mono text-xs bg-slate-100 border border-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 border border-slate-200/80 text-slate-700">
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
                        type="button"
                        onClick={() => onRestock(product)}
                        title="Tambah Stok Masuk"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition cursor-pointer"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        Stok
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(product)}
                        title="Lihat Detail Produk"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        title="Edit Produk"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
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
    </Card>
  );
}