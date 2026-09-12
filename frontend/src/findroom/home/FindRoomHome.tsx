import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { LOCATIONS, OCCUPANCY_OPTIONS, PRICE_RANGES } from '../../lib/constants';
import './FindRoomHome.css';

export default function FindRoomHome() {
  const [quickLocation, setQuickLocation] = useState('');
  const [quickOccupancy, setQuickOccupancy] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) setQuickLocation(locationParam);
  }, [searchParams]);

  return (
    <FindRoomShell>
      <div className="findroom-home">
        <section className="findroom-hero" aria-labelledby="findroom-hero-title">
          <p className="findroom-hero-eyebrow">FindRoom</p>
          <h1 id="findroom-hero-title" className="findroom-hero-title">Find your room.</h1>
          <p className="findroom-hero-subtitle">Tell us what you are looking for and we will help you narrow it down.</p>

          <div className="findroom-hero-search">
            <Link to={`/findroom/explore${quickLocation ? `?location=${encodeURIComponent(quickLocation)}` : ''}`} className="findroom-hero-search-input" aria-label="Search rooms and hostels">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <span>Search rooms and hostels...</span>
              <kbd>⌘ K</kbd>
            </Link>
          </div>

          <div className="findroom-quick-filters">
            <div className="findroom-quick-filter">
              <label className="findroom-quick-filter-label" htmlFor="quick-location">Location</label>
              <select
                id="quick-location"
                value={quickLocation}
                onChange={(e) => setQuickLocation(e.target.value)}
                className="findroom-quick-select"
              >
                <option value="">Anywhere</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="findroom-quick-filter">
              <label className="findroom-quick-filter-label" htmlFor="quick-occupancy">Room type</label>
              <select
                id="quick-occupancy"
                value={quickOccupancy ?? ''}
                onChange={(e) => setQuickOccupancy(e.target.value ? Number(e.target.value) : null)}
                className="findroom-quick-select"
              >
                <option value="">Any type</option>
                {OCCUPANCY_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}-in-1</option>
                ))}
              </select>
            </div>

            <div className="findroom-quick-filter">
              <label className="findroom-quick-filter-label" htmlFor="quick-price">Budget</label>
              <select
                id="quick-price"
                className="findroom-quick-select"
                onChange={(e) => {
                  const range = PRICE_RANGES.find((r) => r.label === e.target.value);
                  if (range) {
                    window.location.href = `/findroom/explore?minPrice=${range.min}${range.max !== null ? `&maxPrice=${range.max}` : ''}`;
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Any budget</option>
                {PRICE_RANGES.map((range) => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            <button type="button" className="findroom-quick-clear" onClick={() => { setQuickLocation(''); setQuickOccupancy(null); }}>
              Clear filters
            </button>
          </div>
        </section>
      </div>
    </FindRoomShell>
  );
}
