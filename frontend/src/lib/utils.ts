export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-GH')}`;
}

export function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString('en-GH')}`;
}
export type PricingPeriod = 'AcademicYear' | 'Semester' | 'Month';
export function formatPricePeriod(period?: PricingPeriod): string {
  switch (period) {
    case 'Semester':
      return 'semester';
    case 'Month':
      return 'mo';
    case 'AcademicYear':
    default:
      return 'yr';
  }
}

export function getFreshnessLabel(checkedAt: string): string {
  const date = new Date(checkedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Checked today';
  if (diffDays === 1) return 'Checked yesterday';
  if (diffDays <= 7) return `Checked ${diffDays} days ago`;
  return 'Availability needs updating';
}

export function getAvailabilityStatus(available: number, total: number): 'available' | 'limited' | 'full' {
  if (available === 0) return 'full';
  if (available <= Math.max(1, Math.floor(total * 0.3))) return 'limited';
  return 'available';
}

export function getAvailabilityLabel(status: 'available' | 'limited' | 'full'): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'limited':
      return 'Limited';
    case 'full':
      return 'Full';
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getRoomTypeLabel(occupancy: number, isSelfContained: boolean): string {
  if (isSelfContained) return 'Self-contained';
  return `${occupancy} in 1`;
}
