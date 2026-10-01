import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Logo } from '../../../shared/Logo/Logo';
import './MarketingNavbar.css';

export function MarketingNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isMarketing = !location.pathname.startsWith('/findroom');
  const isHeroPage = location.pathname === '/marketing' || location.pathname === '/about';

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isHeroPage) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeroPage]);

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
          {/* Mobile-only CTA removed — handled in mnav-mobile-panel */}
        </nav>

        {/* Desktop right-side actions */}
        <div className="mnav-actions">
          <Link to="/findroom" className="mnav-btn-outline">Find a Room</Link>
          <Link to="/contact" className="mnav-btn-primary">Get in touch</Link>
        </div>

        {/* Hamburger / Close */}
        <button
          type="button"
          className="mnav-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="mnav-mobile-panel" role="dialog" aria-label="Navigation menu">
            <ul className="mnav-mobile-list">
              {[
                { to: '/marketing', label: 'Home' },
                { to: '/about',     label: 'About' },
                { to: '/contact',   label: 'Contact' },
              ].map(({ to, label }) => {
                const active = location.pathname === to;
                return (
                  <li className="mnav-mobile-item" key={to}>
                    <Link
                      to={to}
                      className={`mnav-mobile-link${active ? ' mnav-mobile-link--active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mnav-mobile-footer">
              <Link to="/findroom" className="mnav-mobile-cta-primary" onClick={() => setMenuOpen(false)}>
                Find a Room
              </Link>
              <Link to="/contact" className="mnav-mobile-cta-ghost" onClick={() => setMenuOpen(false)}>
                Get in touch
              </Link>
            </div>
          </div>
        )}
    </header>
  );
}
