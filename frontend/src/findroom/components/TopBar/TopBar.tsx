import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './TopBar.css';

interface HostelSearchResult {
  id: string;
  name: string;
  location: string;
  pricePerYear: number;
}

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export function TopBar() {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HostelSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/api/hostels`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search request failed');
        const hostels = await response.json() as HostelSearchResult[];
        const lowerQuery = normalizedQuery.toLowerCase();
        setResults(hostels.filter((hostel) =>
          hostel.name.toLowerCase().includes(lowerQuery) || hostel.location.toLowerCase().includes(lowerQuery)
        ).slice(0, 8));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setSearchError('Search is unavailable right now.');
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <Link to="/findroom" className="topbar-brand">FindRoom</Link>
          <nav className="topbar-nav" aria-label="FindRoom">
            <Link to="/findroom/explore">Explore</Link>
            <Link to="/findroom/rooms">Rooms</Link>
            <Link to="/findroom/saved">Saved</Link>
          </nav>
        </div>

        <div className="topbar-right">
          <form className="topbar-search-form" role="search" onSubmit={(event) => { event.preventDefault(); setSearchOpen(true); }}>
            <button type="submit" className="topbar-search-button" aria-label="Search" title="Search Unsplash">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M16.5 15c.9-1.2 1.5-2.8 1.5-4.5C18 6.4 14.6 3 10.5 3S3 6.4 3 10.5 6.4 18 10.5 18c1.7 0 3.2-.5 4.5-1.5l4.6 4.5 1.4-1.5-4.5-4.5zm-6 1c-3 0-5.5-2.5-5.5-5.5S7.5 5 10.5 5 16 7.5 16 10.5 13.5 16 10.5 16z" />
              </svg>
            </button>
            <div className="topbar-search-input-wrap">
              <input
                type="search"
                className="topbar-search-input"
                placeholder="Search rooms and hostels"
                readOnly
                onFocus={() => setSearchOpen(true)}
              />
            </div>
            <button type="button" className="topbar-icon-button" aria-label="Visual search" title="Visual search">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4ZM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5Zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2Zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4ZM12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z" />
              </svg>
            </button>
          </form>

          <div className="topbar-links">
            {!user && (
              <Link to="/login" className="topbar-link">Log in</Link>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="topbar-search-backdrop" role="presentation" onMouseDown={closeSearch}>
          <section className="topbar-search-dialog" role="dialog" aria-modal="true" aria-labelledby="topbar-search-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="topbar-search-dialog-header">
              <div>
                <p className="topbar-search-eyebrow">FindRoom search</p>
                <h2 id="topbar-search-title">Find a hostel</h2>
              </div>
              <button type="button" className="topbar-search-close" onClick={closeSearch} aria-label="Close search">×</button>
            </div>
            <div className="topbar-search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></svg>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by hostel or area..."
              />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </div>
            <div className="topbar-search-results" aria-live="polite">
              {!query.trim() && <p className="topbar-search-hint">Try a hostel name or area such as Fiapre.</p>}
              {searching && <p className="topbar-search-hint">Searching hostels...</p>}
              {searchError && <p className="topbar-search-message-error">{searchError}</p>}
              {!searching && !searchError && query.trim() && results.length === 0 && <p className="topbar-search-hint">No hostels matched that search.</p>}
              {results.map((hostel) => (
                <Link key={hostel.id} to={`/findroom/rooms?hostel=${hostel.id}`} className="topbar-search-result" onClick={closeSearch}>
                  <span className="topbar-search-result-icon" aria-hidden="true">⌂</span>
                  <span><strong>{hostel.name}</strong><small>{hostel.location} · From GH₵{hostel.pricePerYear.toLocaleString()}/year</small></span>
                  <span className="topbar-search-result-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
