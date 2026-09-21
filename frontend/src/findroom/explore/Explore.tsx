import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { Search } from '../components/Search/Search';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchRooms, fetchFilterFacilities } from '../../services/roomService';
import { fetchHostels } from '../../services/hostelService';
import { DABI_COMMUNITY_LINK } from '../../lib/dabiContact';
import type { RoomOption, SearchFilters } from '../../types';
import { FACILITIES, OCCUPANCY_OPTIONS, PRICE_RANGES, FACILITY_EMOJIS } from '../../lib/constants';
import './Explore.css';

type FilterIconName = 'location' | 'rooms' | 'availability' | 'price' | 'facility';

function FilterIcon({ name }: { name: FilterIconName }) {
  const paths: Record<FilterIconName, string> = {
    location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
    availability: 'M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3ZM8 12l2.5 2.5L16 9',
    price: 'M12 2v20M17 6.5c-.8-1-2.1-1.5-4-1.5-2.2 0-4 1.2-4 3s1.6 2.5 4 3 4 1.1 4 3-1.8 3-4 3c-1.9 0-3.2-.5-4-1.5',
    facility: 'M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13',
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

function FilterDropdown({ label, icon, value, options, onChange }: { label: string; icon: FilterIconName; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);
  const selected = options.find((option) => option.value === value)?.label ?? options[0]?.label;

  return (
    <div className="filter-group filter-dropdown" ref={ref}>
      <span className="filter-label"><FilterIcon name={icon} />{label}</span>
      <button type="button" className="filter-dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span>{selected}</span><span className="filter-dropdown-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="filter-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={option.value === value ? 'filter-dropdown-option-active' : ''} onClick={() => { onChange(option.value); setOpen(false); }}>
              <span>{option.label}</span>{option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('query') ?? '',
    minPrice: null,
    maxPrice: null,
    location: '',
    occupancy: null,
    facilities: [],
    availability: 'all',
  });
  const [sortBy, setSortBy] = useState<'checked' | 'price-low' | 'price-high'>('checked');
  const [backendFacilities, setBackendFacilities] = useState<string[]>(FACILITIES as unknown as string[]);
  const [backendLocations, setBackendLocations] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRooms(filters)
      .then((data) => {
        if (cancelled) return;
        setRooms(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load rooms.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters]);

  useEffect(() => {
    fetchFilterFacilities().then((facilities) => {
      if (facilities.length) setBackendFacilities(facilities);
    }).catch(() => {
      // Keep the local labels available when the backend is offline.
    });

    fetchHostels().then((hostels) => {
      const locations = Array.from(new Set(hostels.map((hostel) => hostel.location).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      setBackendLocations(locations);
    }).catch(() => {
      setBackendLocations([]);
    });
  }, []);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  };

  const toggleFacility = (facility: string) => {
    setFilters((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      minPrice: null,
      maxPrice: null,
      location: '',
      occupancy: null,
      facilities: [],
      availability: 'all',
    });
  };

  const activeFilterCount = [
    filters.location,
    filters.occupancy,
    filters.availability !== 'all' ? filters.availability : '',
    filters.minPrice,
    ...filters.facilities,
  ].filter(Boolean).length;

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortBy === 'price-low') return a.pricePerYear - b.pricePerYear;
    if (sortBy === 'price-high') return b.pricePerYear - a.pricePerYear;
    return new Date(b.hostelId).getTime() - new Date(a.hostelId).getTime();
  });

  return (
    <FindRoomShell>
      <div className="explore-page">
        <nav className="explore-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/findroom" className="explore-breadcrumb-link">FindRoom</Link>
          <span className="explore-breadcrumb-separator" aria-hidden="true">›</span>
          <Link to="/findroom/explore" className="explore-breadcrumb-link">Explore</Link>
          <span className="explore-breadcrumb-separator" aria-hidden="true">›</span>
          <span className="explore-breadcrumb-current" aria-current="page">Rooms</span>
        </nav>

        <div className="explore-hero-modules" aria-label="Explore Dabi rooms">
          <section className="explore-hero-module explore-hero-community">
            <div className="explore-hero-copy explore-hero-copy-plain">
              <p className="explore-hero-kicker">DABI / COMMUNITY</p>
              <h1 className="explore-hero-title"><span className="findroom-heading-hash">#</span> A room search powered by the people around you.</h1>
              <p className="explore-hero-description">Dabi brings together verified hostels, trusted student recommendations, and real community insight so you can choose a place that actually fits your life.</p>
              <div className="explore-hero-actions">
                <Link to="/findroom/rooms" className="explore-hero-primary">Explore rooms</Link>
                <a href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer" className="explore-hero-secondary">💚 Join Dabi Community</a>
              </div>
            </div>
          </section>

          <Link to="/findroom/request" className="explore-hero-module explore-hero-request">
            <div className="explore-hero-request-copy">
              <p className="explore-hero-kicker">ROOM REQUEST</p>
              <h2>Need a room matched to you?</h2>
              <p>Tell us your budget, preferred area, and room type. We’ll help narrow it down and keep the search moving.</p>
              <span className="explore-hero-request-button">Request a room →</span>
            </div>
          </Link>
        </div>

        <div className="explore-content">
          <div className="explore-search">
            <Search onSearch={handleSearch} placeholder="Search hostels, room types or locations" />
            <Link to="/findroom/map" className="explore-map-link">Map view</Link>
          </div>

          <button
            type="button"
            className="explore-filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="explore-filters-panel"
            onClick={() => setFiltersOpen(true)}
          >
            <span>Filter rooms</span>
            {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
            <span aria-hidden="true">☷</span>
          </button>

          {filtersOpen && <button type="button" className="explore-filters-backdrop" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />}

          <div id="explore-filters-panel" className={`explore-filters ${filtersOpen ? 'explore-filters-open' : ''}`}>
            <div className="explore-filter-heading">
              <span>Filter rooms</span>
              {activeFilterCount > 0 && <strong>{activeFilterCount} active</strong>}
              <button type="button" className="explore-filter-close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>×</button>
            </div>
            <div className="filter-group">
              <FilterDropdown label="Location" icon="location" value={filters.location} options={[{ value: '', label: 'All locations' }, ...backendLocations.map((loc) => ({ value: loc, label: loc }))]} onChange={(value) => setFilters((prev) => ({ ...prev, location: value }))} />
            </div>

            <div className="filter-group">
              <FilterDropdown label="Occupancy" icon="rooms" value={filters.occupancy?.toString() ?? ''} options={[{ value: '', label: 'Any room type' }, ...OCCUPANCY_OPTIONS.map((n) => ({ value: n.toString(), label: `${n} in 1` }))]} onChange={(value) => setFilters((prev) => ({ ...prev, occupancy: value ? Number(value) : null }))} />
            </div>

            <div className="filter-group">
              <FilterDropdown label="Availability" icon="availability" value={filters.availability} options={[{ value: 'all', label: 'All rooms' }, { value: 'available', label: 'Available now' }, { value: 'limited', label: 'Limited' }]} onChange={(value) => setFilters((prev) => ({ ...prev, availability: value as SearchFilters['availability'] }))} />
            </div>

            <div className="filter-group">
              <FilterDropdown label="Price range" icon="price" value={filters.minPrice?.toString() ?? ''} options={[{ value: '', label: 'Any price' }, ...PRICE_RANGES.map((range) => ({ value: range.min.toString(), label: range.label }))]} onChange={(value) => { const range = PRICE_RANGES.find((item) => item.min.toString() === value); setFilters((prev) => ({ ...prev, minPrice: range?.min ?? null, maxPrice: range?.max ?? null })); }} />
            </div>

            <button type="button" className="filter-clear" onClick={clearFilters} disabled={activeFilterCount === 0}>
              Clear all
            </button>

            <div className="explore-facilities">
              <span className="explore-facilities-label"><FilterIcon name="facility" />Facilities</span>
              {backendFacilities.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  className={`facility-chip ${filters.facilities.includes(facility) ? 'facility-chip-active' : ''}`}
                  onClick={() => toggleFacility(facility)}
                >
                  {FACILITY_EMOJIS[facility] ? `${FACILITY_EMOJIS[facility]} ${facility}` : facility}
                </button>
              ))}
            </div>
          </div>

          <div className="explore-results">
            <div className="explore-results-header">
              <div>
                <h2 className="explore-results-title">Room options</h2>
                {!loading && !error && <p className="explore-results-count">{rooms.length} room options found</p>}
              </div>
              <label className="explore-sort">
                <span>Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                  <option value="checked">Recently checked</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>
            {error ? (
              <EmptyState title={error} description="Please try again later." />
            ) : loading ? (
              <LoadingState count={6} />
            ) : rooms.length === 0 ? (
              <EmptyState
                title="Nothing perfect yet."
                description="We couldn't find a room matching everything you selected. Try widening your budget or explore nearby areas."
                actionLabel="Adjust search"
                actionTo="/findroom/explore"
              />
            ) : (
              <div className="explore-masonry">
                {sortedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FindRoomShell>
  );
}
