import { RefreshCw, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AlertBanner from '../components/ui/AlertBanner';
import Button from '../components/ui/Button';
import { useMasterData } from '../features/master-data/hooks/useMasterData';
import CategoryManagerCard from '../features/master-data/components/CategoryManagerCard';
import UnitManagerCard from '../features/master-data/components/UnitManagerCard';

export default function MasterData() {
  const md = useMasterData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Kategori & Satuan"
        subtitle="Pengaturan referensi kategori barang dan satuan stok sistem (Khusus Owner)"
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            isLoading={md.loading}
            onClick={md.fetchAllMasterData}
          >
            Muat Ulang
          </Button>
        }
      />

      {(md.error || md.successMessage) && (
        <div className="space-y-2.5">
          <AlertBanner variant="error" message={md.error} />
          <AlertBanner variant="info" message={md.successMessage} />
        </div>
      )}

      {md.loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Memuat daftar kategori dan satuan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <CategoryManagerCard
            categories={md.categories}
            saving={md.savingCategory}
            onSave={md.saveCategory}
            onDelete={md.removeCategory}
          />

          <UnitManagerCard
            units={md.units}
            saving={md.savingUnit}
            onSave={md.saveUnit}
            onDelete={md.removeUnit}
          />
        </div>
      )}
    </div>
  );
}