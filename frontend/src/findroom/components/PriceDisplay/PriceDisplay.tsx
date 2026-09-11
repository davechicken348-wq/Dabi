import { formatCurrency } from '../../../lib/utils';
import './PriceDisplay.css';

interface PriceDisplayProps {
  price: number;
  label?: string;
}

export function PriceDisplay({ price, label = 'per year' }: PriceDisplayProps) {
  return (
    <div className="price-display">
      <span className="price-value">{formatCurrency(price)}</span>
      <span className="price-period">/{label}</span>
    </div>
  );
}
