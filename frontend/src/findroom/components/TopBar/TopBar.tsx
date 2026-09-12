import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './TopBar.css';

interface HostelSearchResult {
  id: string;
  name: string;
  location: string;
  pricePerYear: number;
}

const pageTitles: Record<string, string> = {
  '/findroom': 'Welcome',
  '/findroom/explore': 'Explore rooms',
  '/findroom/map': 'Map',
  '/findroom/rooms': 'Rooms',
  '/findroom/locations': 'Locations',
  '/findroom/enquiries': 'My enquiries',
  '/findroom/saved': 'Saved rooms',
  '/findroom/request': 'Request a room',
};

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export function TopBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HostelSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const pageTitle = pageTitles[location.pathname]
    || (location.pathname.startsWith('/findroom/rooms/') ? 'Room details' : 'FindRoom');
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <span className="topbar-context">FindRoom</span>
          <span className="topbar-page">{pageTitle}</span>
        </div>
        <div className="topbar-right">
          <button type="button" className="topbar-search" aria-label="Search hostels" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></svg>
            <span>Search hostels</span>
            <kbd>⌘ K</kbd>
          </button>
          {user && (
            <Link to="/admin/login" className="topbar-icon-button" aria-label="Owner notifications" title="Owner notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            </Link>
          )}
          <Link to="/admin/login" className="topbar-avatar" aria-label={user ? 'Open Dabi owner admin' : 'Sign in to Dabi owner admin'} title={user ? 'Dabi owner admin' : 'Sign in to Dabi owner admin'}>
            {user ? initials : (
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a4 4 0 0 1 4 4v2M8 9V7a4 4 0 0 1 4-4M5 21v-3a7 7 0 0 1 14 0v3M9 14h6" /></svg>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="topbar-search-backdrop" role="presentation" onMouseDown={closeSearch}>
          <section className="topbar-search-dialog" role="dialog" aria-modal="true" aria-labelledby="topbar-search-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="topbar-search-dialog-header">
              <div><p className="topbar-search-eyebrow">FindRoom search</p><h2 id="topbar-search-title">Find a hostel</h2></div>
              <button type="button" className="topbar-search-close" onClick={closeSearch} aria-label="Close search">×</button>
            </div>
            <div className="topbar-search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></svg>
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by hostel or area..." />
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
