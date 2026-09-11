import { getFreshnessLabel } from '../../../lib/utils';
import './FreshnessBadge.css';

interface FreshnessBadgeProps {
  checkedAt: string;
}

export function FreshnessBadge({ checkedAt }: FreshnessBadgeProps) {
  const label = getFreshnessLabel(checkedAt);
  const isStale = label === 'Availability needs updating';
  return (
    <span className={`freshness-badge ${isStale ? 'freshness-stale' : ''}`}>
      {label}
    </span>
  );
}
