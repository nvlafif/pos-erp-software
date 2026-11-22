import { useState, type FormEvent } from 'react';
import { Tag, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import type { Category } from '../../inventory/types/inventory.types';

interface CategoryManagerCardProps {
  categories: Category[];
  saving: boolean;
  onSave: (name: string, editingId?: number) => Promise<boolean>;
  onDelete: (category: Category) => Promise<void>;
}

export default function CategoryManagerCard({
  categories,
  saving,
  onSave,
  onDelete,
}: CategoryManagerCardProps) {
  const [nameInput, setNameInput] = useState<string>('');
  const [editingTarget, setEditingTarget] = useState<Category | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await onSave(nameInput, editingTarget?.id);
    if (ok) {
      setNameInput('');
      setEditingTarget(null);
    }
  };

  const startEdit = (category: Category) => {
    setEditingTarget(category);
    setNameInput(category.name);
  };

  const cancelEdit = () => {
    setEditingTarget(null);
    setNameInput('');
  };

  return (
    <Card className="overflow-hidden border-slate-300 flex flex-col">
      {/* Header Kartu */}
      <div className="px-5 py-4 border-b border-slate-300 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Kategori Produk</h3>
            <p className="text-xs text-slate-500">
              Pengelompokan jenis barang di gudang & kasir
            </p>
          </div>
        </div>
        <Badge variant="info">{categories.length} kategori</Badge>
      </div>

      {/* Form Tambah / Edit Kategori */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-slate-50 border-b border-slate-300 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          required
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nama kategori baru (mis. Minuman, Sembako)..."
          className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={editingTarget ? Check : Plus}
            isLoading={saving}
          >
            {editingTarget ? 'Simpan' : 'Tambah'}
          </Button>

          {editingTarget && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={X}
              onClick={cancelEdit}
            >
              Batal
            </Button>
          )}
        </div>
      </form>

      {/* Tabel Daftar Kategori */}
      {categories.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Belum ada kategori produk terdaftar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-14">No.</th>
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/80 text-sm">
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="odd:bg-white even:bg-slate-200/50 hover:bg-blue-50/60 transition"
                >
                  <td className="py-3 px-4 text-xs font-medium text-slate-900">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        title="Edit Kategori"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(cat)}
                        title="Hapus Kategori"
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