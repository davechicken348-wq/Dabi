import { formatCurrency, formatPricePeriod, type PricingPeriod } from '../../../lib/utils';
import './PriceDisplay.css';

interface PriceDisplayProps {
  price: number;
  label?: string;
  pricingPeriod?: PricingPeriod;
}

export function PriceDisplay({ price, label, pricingPeriod }: PriceDisplayProps) {
  return (
    <div className="price-display">
      {label && <span className="price-label">{label}</span>}
      <span className="price-value">{formatCurrency(price)}</span>
      <span className="price-period">/{formatPricePeriod(pricingPeriod)}</span>
    </div>
  );
}
