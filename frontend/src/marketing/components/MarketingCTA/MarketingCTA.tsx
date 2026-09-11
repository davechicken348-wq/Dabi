import { Link } from 'react-router-dom';
import { Button } from '../../../shared/Button/Button';
import './MarketingCTA.css';

interface MarketingCTAProps {
  title?: string;
  subtitle?: string;
}

export function MarketingCTA({ title = 'Ready to find your room?', subtitle }: MarketingCTAProps) {
  return (
    <section className="marketing-cta">
      <div className="marketing-cta-inner">
        <h2 className="marketing-cta-title">{title}</h2>
        {subtitle && <p className="marketing-cta-subtitle">{subtitle}</p>}
        <Link to="/findroom">
          <Button size="lg" variant="primary">Explore Rooms →</Button>
        </Link>
      </div>
    </section>
  );
}
