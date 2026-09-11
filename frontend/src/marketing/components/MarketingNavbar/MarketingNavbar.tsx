import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Logo } from '../../../shared/Logo/Logo';
import { Button } from '../../../shared/Button/Button';
import './MarketingNavbar.css';

export function MarketingNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMarketing = !location.pathname.startsWith('/findroom');
  const isHeroPage = location.pathname === '/marketing' || location.pathname === '/about';

  useEffect(() => {
    if (!isHeroPage) {
      setIsScrolled(false);
      return;
    }

    const updateScrollState = () => setIsScrolled(window.scrollY > 16);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrollState);
  }, [isHeroPage]);

  if (!isMarketing) return null;

  return (
    <header className={`marketing-nav ${isHeroPage ? 'marketing-nav-home' : ''} ${isScrolled ? 'marketing-nav-scrolled' : ''} ${menuOpen ? 'marketing-nav-open' : ''}`}>
      <div className="marketing-nav-inner">
        <Link to="/marketing" className="marketing-nav-brand">
          <Logo size="md" />
        </Link>
        <nav className="marketing-nav-links" aria-label="Marketing navigation">
          <Link to="/marketing" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/findroom" className="marketing-nav-mobile-cta" onClick={() => setMenuOpen(false)}>Find a Room →</Link>
        </nav>
        <Link to="/findroom" className="marketing-nav-cta" onClick={() => setMenuOpen(false)}>
          <Button size="sm" variant="primary">Find a Room →</Button>
        </Link>
        <button type="button" className="marketing-nav-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open: boolean) => !open)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
