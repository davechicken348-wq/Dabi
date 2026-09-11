import { Badge } from '../../../shared/Badge/Badge';
import { getAvailabilityLabel } from '../../../lib/utils';
import './AvailabilityBadge.css';

interface AvailabilityBadgeProps {
  status: 'available' | 'limited' | 'full';
  available?: number;
  total?: number;
}

export function AvailabilityBadge({ status, available, total }: AvailabilityBadgeProps) {
  const variant = status === 'available' ? 'success' : status === 'limited' ? 'warning' : 'neutral';
  let label = getAvailabilityLabel(status);
  if (status !== 'full' && available !== undefined && total !== undefined) {
    label = `${label} (${available}/${total})`;
  }
  return <Badge variant={variant}>{label}</Badge>;
}
