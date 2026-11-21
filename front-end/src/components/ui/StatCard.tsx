import type { LucideIcon } from 'lucide-react';
import Card from './Card';

export type StatVariant = 'blue' | 'purple' | 'amber' | 'red' | 'emerald';
export type StatValueSize = 'lg' | 'md' | 'sm';

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  variant?: StatVariant;
  valueSize?: StatValueSize;
  onClick?: () => void;
}

const COLOR_VARIANTS: Record<StatVariant, { box: string; value: string }> = {
  blue: { box: 'bg-blue-50 text-blue-600', value: 'text-slate-900' },
  purple: { box: 'bg-purple-50 text-purple-600', value: 'text-slate-900' },
  amber: { box: 'bg-amber-50 text-amber-600', value: 'text-amber-600' },
  red: { box: 'bg-red-50 text-red-600', value: 'text-red-600' },
  emerald: { box: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600' },
};

const VALUE_SIZE_CLASSES: Record<StatValueSize, string> = {
  lg: 'text-xl',
  md: 'text-base tracking-tight',
  sm: 'text-sm tracking-tight',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  variant = 'blue',
  valueSize = 'lg',
  onClick,
}: StatCardProps) {
  const theme = COLOR_VARIANTS[variant];

  return (
    <Card
      hoverable={Boolean(onClick)}
      onClick={onClick}
      className="p-4 flex items-center gap-3"
    >
      {Icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.box}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
        <p
          title={String(value)}
          className={`${VALUE_SIZE_CLASSES[valueSize]} font-bold mt-1 truncate ${theme.value}`}
        >
          {value}{' '}
          {suffix && (
            <span className="text-xs font-normal text-slate-400">{suffix}</span>
          )}
        </p>
      </div>
    </Card>
  );
}