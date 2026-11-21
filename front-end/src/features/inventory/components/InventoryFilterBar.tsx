import Card from '../../../components/ui/Card';
import SearchInput from '../../../components/ui/SearchInput';
import type { InventoryTab } from '../types/inventory.types';

interface InventoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: string[];
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  counts: {
    all: number;
    lowStock: number;
    outOfStock: number;
    expiringSoon: number;
    expired: number;
  };
}

export default function InventoryFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryOptions,
  activeTab,
  onTabChange,
  counts,
}: InventoryFilterBarProps) {
  const tabs: { id: InventoryTab; label: string }[] = [
    { id: 'ALL', label: `Semua (${counts.all})` },
    { id: 'LOW_STOCK', label: `Low Stock (${counts.lowStock})` },
    { id: 'OUT_OF_STOCK', label: `Stock Habis (${counts.outOfStock})` },
    { id: 'EXPIRING_SOON', label: `H-7 Expiring (${counts.expiringSoon})` },
    { id: 'EXPIRED', label: `Telah Expired (${counts.expired})` },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-col xl:flex-row gap-3 justify-between">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Cari nama produk atau kode SKU..."
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>

          <div className="inline-flex flex-wrap rounded-lg border border-slate-200 p-1 bg-slate-50 gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
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
    </Card>
  );
}