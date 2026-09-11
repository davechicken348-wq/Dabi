import { Link } from 'react-router-dom';
import { Logo } from '../../../shared/Logo/Logo';
import './MarketingFooter.css';

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-inner">
        <div className="marketing-footer-brand">
          <Logo size="md" />
          <p className="marketing-footer-tagline">
            Helping students find the right room.
          </p>
        </div>
        <div className="marketing-footer-links">
          <div className="marketing-footer-col">
            <h4 className="marketing-footer-heading">Product</h4>
            <Link to="/marketing" className="marketing-footer-link">Home</Link>
            <Link to="/about" className="marketing-footer-link">About</Link>
            <Link to="/contact" className="marketing-footer-link">Contact</Link>
          </div>
          <div className="marketing-footer-col">
            <h4 className="marketing-footer-heading">FindRoom</h4>
            <Link to="/findroom" className="marketing-footer-link">Explore Rooms</Link>
            <Link to="/findroom/explore" className="marketing-footer-link">Browse</Link>
          </div>
          <div className="marketing-footer-col marketing-footer-contact">
            <h4 className="marketing-footer-heading">Contact</h4>
            <Link to="/contact" className="marketing-footer-link">WhatsApp</Link>
            <Link to="/contact" className="marketing-footer-link">Phone</Link>
            <Link to="/contact" className="marketing-footer-link">Email</Link>
          </div>
        </div>
      </div>
      <div className="marketing-footer-bottom">
        <p>© {new Date().getFullYear()} Dabi. All rights reserved.</p>
      </div>
    </footer>
  );
}
