import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Logo } from '../../../shared/Logo/Logo';
import { Button } from '../../../shared/Button/Button';
import './MarketingNavbar.css';

export function MarketingNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isMarketing = !location.pathname.startsWith('/findroom');
  // Pages where the nav starts transparent over a dark hero
  const isHeroPage = location.pathname === '/marketing' || location.pathname === '/about';

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Scroll listener — only meaningful on hero pages
  useEffect(() => {
    if (!isHeroPage) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeroPage]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!isMarketing) return null;

  const transparent = isHeroPage && !scrolled;

  return (
    <header
      className={[
        'mnav',
        transparent ? 'mnav--transparent' : 'mnav--solid',
        menuOpen ? 'mnav--open' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="mnav-inner">
        <Link to="/marketing" className="mnav-brand" aria-label="Dabi home">
          <Logo size="md" />
        </Link>

        <nav className="mnav-links" aria-label="Marketing navigation">
          {[
            { to: '/marketing', label: 'Home' },
            { to: '/about',     label: 'About' },
            { to: '/contact',   label: 'Contact' },
          ].map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`mnav-link${active ? ' mnav-link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}
          {/* Mobile-only CTA inside the menu */}
          <Link to="/findroom" className="mnav-mobile-cta" onClick={() => setMenuOpen(false)}>
            Find a Room →
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Link to="/findroom" className="mnav-cta" tabIndex={menuOpen ? -1 : 0}>
          <Button size="sm" variant={transparent ? 'outline' : 'primary'}>Find a Room →</Button>
        </Link>

        {/* Hamburger */}
        <button
          type="button"
          className="mnav-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="mnav-links"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className="mnav-toggle-bar" />
          <span className="mnav-toggle-bar" />
          <span className="mnav-toggle-bar" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div className="mnav-backdrop" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
