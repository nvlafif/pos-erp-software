import {
  Image as ImageIcon,
  Tag,
  Layers,
  CalendarClock,
  PackagePlus,
  Pencil,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import {
  formatRupiah,
  getDaysUntilDate,
  isRenderableImage,
} from '../../../utils/formatters';
import { getLowStockThreshold } from '../hooks/useInventory';
import type { Product } from '../types/inventory.types';

interface ProductDetailModalProps {
  product: Product | null;
  warningDays?: number;
  onClose: () => void;
  onRestock: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  warningDays = 7,
  onClose,
  onRestock,
  onEdit,
}: ProductDetailModalProps) {
  if (!product) return null;

  const margin = product.price - product.costPrice;
  const marginPercent =
    product.costPrice > 0 ? Math.round((margin / product.costPrice) * 100) : 0;
  const totalProductAsset = product.costPrice * product.stock;

  const renderStockBadge = () => {
    if (product.stock <= 0) {
      return <Badge variant="danger">Habis (0 {product.unitName})</Badge>;
    }
    if (product.stock <= getLowStockThreshold(product.unitName)) {
      return (
        <Badge variant="warning">
          Low Stock ({product.stock} {product.unitName})
        </Badge>
      );
    }
    return (
      <Badge variant="success">
        Tersedia ({product.stock} {product.unitName})
      </Badge>
    );
  };

  const renderExpirationBadge = () => {
    if (!product.hasExpiration || !product.expirationDate) {
      return <Badge variant="neutral">Non-Expired</Badge>;
    }

    const daysRemaining =
      product.daysRemaining ?? getDaysUntilDate(product.expirationDate);

    if (product.expirationStatus === 'EXPIRED' || daysRemaining < 0) {
      return <Badge variant="danger">EXPIRED ({product.expirationDate})</Badge>;
    }

    if (
      product.expirationStatus === 'EXPIRING_SOON' ||
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

    return <Badge variant="info">{product.expirationDate}</Badge>;
  };

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title="Detail Kartu Produk"
      subtitle={`SKU: ${product.sku || '-'}`}
      size="md"
    >
      <div className="p-6 space-y-5">
        {/* Preview Gambar Produk */}
        <div className="w-full h-52 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
          {isRenderableImage(product.image) ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-2 bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
              <ImageIcon className="w-10 h-10 opacity-50" />
              <span className="text-xs">Tidak ada gambar produk</span>
            </div>
          )}

          {product.sku && (
            <span className="absolute top-3 left-3 font-mono text-xs font-semibold bg-slate-900/80 text-white px-2.5 py-1 rounded-md backdrop-blur-xs">
              {product.sku}
            </span>
          )}
        </div>

        {/* Nama, Kategori & Status */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {product.categoryName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Satuan: {product.unitName}
            </span>
          </div>

          <h4 className="text-xl font-bold text-slate-900 leading-snug">
            {product.name}
          </h4>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {renderStockBadge()}
            <div className="inline-flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
              {renderExpirationBadge()}
            </div>
          </div>
        </div>

        {/* Rincian Harga, Margin & Nilai Aset */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500">Harga Modal</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {formatRupiah(product.costPrice)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <p className="text-xs font-medium text-blue-700">Harga Jual</p>
            <p className="text-base font-bold text-blue-700 mt-0.5">
              {formatRupiah(product.price)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Margin / {product.unitName}</span>
            </div>
            <p
              className={`text-sm font-bold mt-1 ${
                margin >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatRupiah(margin)}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({marginPercent}%)
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span>Nilai Aset Stok</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {formatRupiah(totalProductAsset)}
            </p>
          </div>
        </div>

        {/* Footer Aksi Cepat */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="emerald"
              size="sm"
              icon={PackagePlus}
              onClick={() => {
                onClose();
                onRestock(product);
              }}
            >
              Tambah Stok
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Pencil}
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              Edit Produk
            </Button>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}