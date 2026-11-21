export function formatRupiah(amount: number | null | undefined): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatIsoDate(rawDate: string | number[] | null | undefined): string | null {
  if (!rawDate) return null;
  if (Array.isArray(rawDate) && rawDate.length >= 3) {
    const [y, m, d] = rawDate;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return String(rawDate).slice(0, 10);
}

export function isRenderableImage(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  return (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  );
}

export function getDaysUntilDate(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}