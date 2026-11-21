import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'info';

interface AlertBannerProps {
  variant?: AlertVariant;
  message?: string | null;
  className?: string;
}

const ALERT_STYLES = {
  error: { wrap: 'bg-red-50 border-red-200 text-red-700', Icon: AlertCircle },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertTriangle },
  info: { wrap: 'bg-blue-50 border-blue-200 text-blue-700', Icon: Info },
};

export default function AlertBanner({
  variant = 'error',
  message,
  className = '',
}: AlertBannerProps) {
  if (!message) return null;
  const { wrap, Icon } = ALERT_STYLES[variant];

  return (
    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-sm ${wrap} ${className}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}