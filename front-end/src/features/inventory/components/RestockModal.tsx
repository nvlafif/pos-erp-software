import { useState, useEffect, type FormEvent } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import type { Product } from '../types/inventory.types';

interface RestockModalProps {
  target: Product | null;
  onClose: () => void;
  onSubmit: (target: Product, qty: string) => void;
  saving: boolean;
}

export default function RestockModal({
  target,
  onClose,
  onSubmit,
  saving,
}: RestockModalProps) {
  const [qty, setQty] = useState<string>('');

  useEffect(() => {
    setQty('');
  }, [target]);

  if (!target) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(target, qty);
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title="Input Barang Masuk"
      subtitle={`${target.name} (Stok saat ini: ${target.stock} ${target.unitName})`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Jumlah Tambahan ({target.unitName}) *
          </label>
          <input
            type="number"
            min="1"
            required
            autoFocus
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Contoh: 20"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="emerald" size="sm" isLoading={saving}>
            Tambahkan Stok
          </Button>
        </div>
      </form>
    </Modal>
  );
}