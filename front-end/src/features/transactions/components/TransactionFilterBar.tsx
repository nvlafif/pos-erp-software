import { Search, RotateCcw } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface TransactionFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onReset: () => void;
}

const METHOD_TABS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'CASH', label: 'Tunai' },
  { id: 'QRIS', label: 'QRIS' },
  { id: 'TRANSFER', label: 'Transfer' },
];

export default function TransactionFilterBar({
  searchQuery,
  onSearchChange,
  selectedMethod,
  onMethodChange,
  selectedDate,
  onDateChange,
  onReset,
}: TransactionFilterBarProps) {
  const hasActiveFilter =
    Boolean(searchQuery) || selectedMethod !== 'ALL' || Boolean(selectedDate);

  return (
    <Card className="p-4 border-slate-300 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      {/* Pencarian No. Struk / Kasir / Produk */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari no. struk, kasir, atau nama produk..."
          className="w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Tanggal, Tab Metode Pembayaran & Reset */}
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-50">
          {METHOD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onMethodChange(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedMethod === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={onReset}
          >
            Reset
          </Button>
        )}
      </div>
    </Card>
  );
}