import { useState } from 'react';
import {
  Package,
  Wallet,
  AlertTriangle,
  PackageX,
  CalendarClock,
  CalendarX2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import AlertBanner from '../components/ui/AlertBanner';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import { useInventory } from '../features/inventory/hooks/useInventory';
import InventoryFilterBar from '../features/inventory/components/InventoryFilterBar';
import InventoryTable from '../features/inventory/components/InventoryTable';
import ProductDetailModal from '../features/inventory/components/ProductDetailModal';
import ProductModal from '../features/inventory/components/ProductModal';
import RestockModal from '../features/inventory/components/RestockModal';
import type { Product, ProductFormValues } from '../features/inventory/types/inventory.types';

export default function Inventory() {
  const inv = useInventory();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const handleSave = async (formData: ProductFormValues) => {
    const ok = await inv.saveProduct(formData, editingProduct?.id);
    if (ok) setIsModalOpen(false);
  };

  const handleRestock = async (target: Product, qty: string) => {
    const ok = await inv.quickRestock(target, qty);
    if (ok) setRestockTarget(null);
  };

  const expirationParts: string[] = [];
  if (inv.expiredProducts.length > 0) {
    expirationParts.push(`${inv.expiredProducts.length} produk telah expired`);
  }
  if (inv.expiringSoonProducts.length > 0) {
    expirationParts.push(
      `${inv.expiringSoonProducts.length} produk mendekati kedaluwarsa (H-7)`
    );
  }
  const expirationBannerMessage =
    expirationParts.length > 0
      ? `Perhatian Gudang: Terdapat ${expirationParts.join(' dan ')}.`
      : null;

  const stockParts: string[] = [];
  if (inv.outOfStockProducts.length > 0) {
    stockParts.push(`${inv.outOfStockProducts.length} produk stok habis`);
  }
  if (inv.lowStockProducts.length > 0) {
    stockParts.push(`${inv.lowStockProducts.length} produk low stock (≤ 10)`);
  }
  const stockBannerMessage =
    stockParts.length > 0
      ? `Peringatan Stok: Terdapat ${stockParts.join(' dan ')}.`
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Gudang & Inventaris"
        subtitle="Monitoring SKU produk, harga modal, peringatan stok minimum, dan masa kedaluwarsa"
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              isLoading={inv.loading}
              onClick={inv.fetchAllData}
            >
              Muat Ulang
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
            >
              Tambah Produk
            </Button>
          </>
        }
      />

      {(inv.error || expirationBannerMessage || stockBannerMessage) && (
        <div className="space-y-3">
          <AlertBanner variant="error" message={inv.error} />
          <AlertBanner
            variant={inv.expiredProducts.length > 0 ? 'error' : 'warning'}
            message={expirationBannerMessage}
          />
          <AlertBanner
            variant={inv.outOfStockProducts.length > 0 ? 'error' : 'warning'}
            message={stockBannerMessage}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Package}
          label="Total SKU Produk"
          value={inv.products.length}
          variant="blue"
          onClick={() => inv.setActiveTab('ALL')}
        />
        <StatCard
          icon={Wallet}
          label="Nilai Aset (Modal)"
          value={formatRupiah(inv.totalAssetValue)}
          variant="purple"
          valueSize="sm"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock (≤ 10)"
          value={inv.lowStockProducts.length}
          suffix="item"
          variant="amber"
          onClick={() => inv.setActiveTab('LOW_STOCK')}
        />
        <StatCard
          icon={PackageX}
          label="Stock Habis"
          value={inv.outOfStockProducts.length}
          suffix="item"
          variant="red"
          onClick={() => inv.setActiveTab('OUT_OF_STOCK')}
        />
        <StatCard
          icon={CalendarClock}
          label="H-7 Expiring"
          value={inv.expiringSoonProducts.length}
          suffix="item"
          variant="amber"
          onClick={() => inv.setActiveTab('EXPIRING_SOON')}
        />
        <StatCard
          icon={CalendarX2}
          label="Telah Expired"
          value={inv.expiredProducts.length}
          suffix="item"
          variant="red"
          onClick={() => inv.setActiveTab('EXPIRED')}
        />
      </div>

      <InventoryFilterBar
        searchQuery={inv.searchQuery}
        onSearchChange={inv.setSearchQuery}
        selectedCategory={inv.selectedCategory}
        onCategoryChange={inv.setSelectedCategory}
        categoryOptions={inv.categoryFilterOptions}
        activeTab={inv.activeTab}
        onTabChange={inv.setActiveTab}
        counts={{
          all: inv.products.length,
          lowStock: inv.lowStockProducts.length,
          outOfStock: inv.outOfStockProducts.length,
          expiringSoon: inv.expiringSoonProducts.length,
          expired: inv.expiredProducts.length,
        }}
      />

      <InventoryTable
        products={inv.filteredProducts}
        loading={inv.loading}
        lowStockIdSet={inv.lowStockIdSet}
        expiringMap={inv.expiringMap}
        warningDays={inv.warningDays}
        onView={setViewingProduct}
        onRestock={setRestockTarget}
        onEdit={(product) => {
          setEditingProduct(product);
          setIsModalOpen(true);
        }}
        onDelete={inv.deleteProduct}
      />

      <ProductDetailModal
        product={viewingProduct}
        warningDays={inv.warningDays}
        onClose={() => setViewingProduct(null)}
        onRestock={setRestockTarget}
        onEdit={(product) => {
          setEditingProduct(product);
          setIsModalOpen(true);
        }}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingProduct}
        saving={inv.saving}
        categories={inv.categories}
        units={inv.units}
      />

      <RestockModal
        target={restockTarget}
        onClose={() => setRestockTarget(null)}
        onSubmit={handleRestock}
        saving={inv.saving}
      />
    </div>
  );
}