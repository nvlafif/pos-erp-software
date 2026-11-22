import { useState, type FormEvent } from 'react';
import { Ruler, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import type { Unit } from '../../inventory/types/inventory.types';

interface UnitManagerCardProps {
  units: Unit[];
  saving: boolean;
  onSave: (name: string, editingId?: number) => Promise<boolean>;
  onDelete: (unit: Unit) => Promise<void>;
}

export default function UnitManagerCard({
  units,
  saving,
  onSave,
  onDelete,
}: UnitManagerCardProps) {
  const [nameInput, setNameInput] = useState<string>('');
  const [editingTarget, setEditingTarget] = useState<Unit | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await onSave(nameInput, editingTarget?.id);
    if (ok) {
      setNameInput('');
      setEditingTarget(null);
    }
  };

  const startEdit = (unit: Unit) => {
    setEditingTarget(unit);
    setNameInput(unit.name);
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
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Satuan (Units)</h3>
            <p className="text-xs text-slate-500">
              Unit pengukuran stok barang (pcs, kg, liter, dus)
            </p>
          </div>
        </div>
        <Badge variant="info">{units.length} satuan</Badge>
      </div>

      {/* Form Tambah / Edit Satuan */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-slate-50 border-b border-slate-300 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          required
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nama satuan baru (mis. pcs, kg, liter)..."
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

      {/* Tabel Daftar Satuan */}
      {units.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Belum ada satuan produk terdaftar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-14">No.</th>
                <th className="py-3 px-4">Nama Satuan</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/80 text-sm">
              {units.map((unit, index) => (
                <tr
                  key={unit.id}
                  className="odd:bg-white even:bg-slate-200/50 hover:bg-blue-50/60 transition"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {unit.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(unit)}
                        title="Edit Satuan"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(unit)}
                        title="Hapus Satuan"
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