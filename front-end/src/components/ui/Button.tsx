import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'emerald' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-xs',
  secondary: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white shadow-xs',
  danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white shadow-xs',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition cursor-pointer disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children}
    </button>
  );
}