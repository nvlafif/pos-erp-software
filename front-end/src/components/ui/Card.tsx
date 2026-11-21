import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export default function Card({
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-300 shadow-sm ${
        hoverable ? 'transition hover:border-blue-300 hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}