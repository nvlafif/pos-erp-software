import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  PackageX,
  CalendarClock,
  CalendarX2,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import type { InventoryRiskSummary } from '../types/dashboard.types';

interface InventoryRiskPanelProps {
  summary: InventoryRiskSummary;
}

export default function InventoryRiskPanel({ summary }: InventoryRiskPanelProps) {
  const rows = [
    {
      label: 'Stock Habis (0 unit)',
      count: summary.outOfStockCount,
      icon: PackageX,
      variant: summary.outOfStockCount > 0 ? ('danger' as const) : ('success' as const),
    },
    {
      label: 'Low Stock (≤ 10 unit)',
      count: summary.lowStockCount,
      icon: AlertTriangle,
      variant: summary.lowStockCount > 0 ? ('warning' as const) : ('success' as const),
    },
    {
      label: 'Telah Expired',
      count: summary.expiredCount,
      icon: CalendarX2,
      variant: summary.expiredCount > 0 ? ('danger' as const) : ('success' as const),
    },
    {
      label: 'Mendekati Expired (H-7)',
      count: summary.expiringSoonCount,
      icon: CalendarClock,
      variant: summary.expiringSoonCount > 0 ? ('warning' as const) : ('success' as const),
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Kesehatan Gudang</h3>
            <p className="text-xs text-slate-500">
              Total {summary.totalSku} SKU aktif terdaftar
            </p>
          </div>
        </div>

        <Link
          to="/inventory"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          Kelola Gudang
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-200/80 mt-2">
        {rows.map(({ label, count, icon: Icon, variant }) => (
          <div key={label} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-700">
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{label}</span>
            </div>
            <Badge variant={variant}>{count} item</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}