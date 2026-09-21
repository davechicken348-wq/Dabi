import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DABI_COMMUNITY_LINK } from '../../lib/dabiContact';
import './FindRoomHome.css';

const quickSearchSuggestions = [
  { label: 'Private rooms', value: 'private room', route: '/findroom/rooms?availability=available' },
  { label: 'Verified hostels', value: 'verified', route: '/findroom/explore?query=verified' },
  { label: 'Near campus', value: 'campus', route: '/findroom/locations' },
  { label: 'Budget rooms', value: 'budget', route: '/findroom/explore?query=budget' },
  { label: 'Shared rooms', value: 'shared room', route: '/findroom/explore?query=shared room' },
  { label: 'Fresh listings', value: 'fresh', route: '/findroom/explore?query=fresh' },
];

export default function FindRoomHome() {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    const target = trimmed
      ? `/findroom/explore?query=${encodeURIComponent(trimmed)}`
      : '/findroom/explore';
    navigate(target);
  };

  const chooseSuggestion = (suggestion: { label: string; value: string; route: string }) => {
    setQuery(suggestion.value);
    setDropdownOpen(false);
    navigate(suggestion.route);
  };

  return (
    <div className="findroom-home reference-home">
      <header className="reference-header">
        <div className="reference-brand">
          <span className="reference-brand-icon">✦</span>
          <span className="reference-brand-name" aria-label="Dabi">
            <span className="reference-brand-dab">Dab</span>
            <span className="reference-brand-i">i</span>
          </span>
        </div>
        <nav className="reference-nav" aria-label="Findroom navigation">
          <Link className="reference-nav-link active" to="/findroom/explore">Explore</Link>
          <Link className="reference-nav-link" to="/findroom/locations">Locations</Link>
          <Link className="reference-nav-link" to="/findroom/map">Map</Link>
          <Link className="reference-nav-link" to="/findroom/rooms">Rooms</Link>
          <a className="reference-nav-link" href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer">Join Community</a>
        </nav>
      </header>

      <section className="reference-hero">
        <div className="reference-hero-copy">
          <h1><span className="findroom-heading-hash">#</span> Find verified rooms near your campus, without the guesswork.</h1>
          <form className="reference-search" onSubmit={handleSearch}>
            <span className="reference-category">Rooms</span>
            <div className="reference-search-wrap">
              <input
                className="reference-search-text"
                type="text"
                value={query}
                placeholder="Search hostels and room types"
                aria-label="Search hostels and room types"
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => window.setTimeout(() => setDropdownOpen(false), 120)}
              />
              {dropdownOpen && (
                <div className="reference-search-dropdown">
                  <div className="reference-search-dropdown-panel">
                    <div className="reference-search-dropdown-block">
                      <h4>Popular searches</h4>
                      <div className="reference-search-suggestion-list">
                        {quickSearchSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.label}
                            className="reference-search-suggestion"
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => chooseSuggestion(suggestion)}
                          >
                            <span className="reference-search-suggestion-icon">✦</span>
                            <span>{suggestion.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="reference-search-icon" type="submit" aria-label="Search">
              ⌕
            </button>
          </form>
        </div>
        <div className="reference-photo-stack" aria-label="student accommodation photos">
          <button className="reference-photo-tile tile-one" type="button" onClick={() => navigate('/findroom/rooms?availability=available')}>
            <span className="reference-photo-label">Private rooms<br />Compare →</span>
          </button>
          <button className="reference-photo-tile tile-two" type="button" onClick={() => navigate('/findroom/locations')}>
            <span className="reference-photo-label">Local hostels<br />Browse →</span>
          </button>
        </div>
      </section>

      <section className="reference-cta-panel" aria-label="Need help finding a room">
        <div>
          <p className="reference-cta-kicker">Still haven't found your room? 🥺</p>
          <h2>That’s okay. Tell Dabi what you’re looking for and we’ll try to find a suitable match for you.</h2>
        </div>
        <div className="reference-cta-actions">
          <Link to="/findroom/request" className="reference-action-primary">Help Me Find a Room →</Link>
          <a href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer" className="reference-action-secondary">💚 Join Dabi Community</a>
        </div>
      </section>

      <section className="reference-chips" aria-label="Findroom categories">
        <Link className="reference-chip active" to="/findroom">Home</Link>
        <Link className="reference-chip" to="/findroom/explore">Explore</Link>
        <Link className="reference-chip" to="/findroom/locations">Locations</Link>
        <Link className="reference-chip" to="/findroom/rooms">Room Types</Link>
        <Link className="reference-chip" to="/findroom/explore">Freshness</Link>
        <Link className="reference-chip" to="/findroom/help">Student Guide</Link>
        <Link className="reference-chip free" to="/findroom/explore">Verified</Link>
      </section>

      <section className="reference-gallery">
      </section>
    </div>
  );
}
