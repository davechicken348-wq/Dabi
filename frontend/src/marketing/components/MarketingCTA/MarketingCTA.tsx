import { Link } from 'react-router-dom';
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
        <Link to="/findroom" className="marketing-cta-btn">
          Explore Rooms
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </Link>
      </div>
    </section>
  );
}
