import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { Search } from '../components/Search/Search';
import { LocationsSkeleton } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchHostels } from '../../services/hostelService';
import type { Hostel } from '../../types';
import './Locations.css';

interface LocationSummary {
  name: string;
  hostels: Hostel[];
  roomOptions: number;
  availableUnits: number;
  startingPrice: number;
  startingPricingPeriod?: 'AcademicYear' | 'Semester' | 'Month';
  hasMixedPricingPeriods: boolean;
  photo: string;
}

function formatPricePeriod(period?: LocationSummary['startingPricingPeriod']): string {
  if (period === 'Month') return 'mo';
  if (period === 'Semester') return 'semester';
  return 'yr';
}

export default function Locations() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHostels()
      .then((data) => {
        if (cancelled) return;
        setHostels(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('We could not load locations right now.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const locations = useMemo<LocationSummary[]>(() => {
    const groups = new Map<string, Hostel[]>();
    hostels.forEach((hostel) => {
      const group = groups.get(hostel.location) ?? [];
      group.push(hostel);
      groups.set(hostel.location, group);
    });

    return [...groups.entries()].map(([name, areaHostels]) => {
      const rooms = areaHostels.flatMap((hostel) => hostel.roomOptions);
      const startingRoom = rooms.reduce((lowest, room) => (
        !lowest || room.pricePerYear < lowest.pricePerYear ? room : lowest
      ), rooms[0]);
      const pricingPeriods = new Set(rooms.map((room) => room.pricingPeriod ?? 'AcademicYear'));
      return {
        name,
        hostels: areaHostels,
        roomOptions: rooms.length,
        availableUnits: rooms.reduce((total, room) => total + room.availableUnits, 0),
        startingPrice: startingRoom?.pricePerYear ?? 0,
        startingPricingPeriod: startingRoom?.pricingPeriod,
        hasMixedPricingPeriods: pricingPeriods.size > 1,
        photo: areaHostels[0].photos[0] ?? '/placeholder-room.svg',
      };
    });
  }, [hostels]);

  const filteredLocations = locations.filter((location) => {
    const search = query.trim().toLowerCase();
    return !search || location.name.toLowerCase().includes(search)
      || location.hostels.some((hostel) => hostel.name.toLowerCase().includes(search));
  });

  const availableRooms = locations.reduce((total, location) => total + location.availableUnits, 0);

  if (error) {
    return (
      <FindRoomShell>
        <div className="locations-page">
          <EmptyState title={error} description="Please try again later." />
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="locations-page">
        <div className="locations-head">
          <div className="locations-head-text">
            <p className="locations-eyebrow"><span className="locations-eyebrow-dot" /> Discover by area</p>
            <h1 className="locations-title"><span className="locations-title-mark">#</span> Locations</h1>
            <p className="locations-subtitle">
              Browse neighbourhoods and find the rooms that fit your budget and lifestyle.
            </p>
          </div>
          <div className="locations-head-actions">
            <div className="locations-head-search">
              <Search onSearch={(value) => setQuery(value)} />
            </div>
            <Link to="/findroom/map" className="locations-map-link"><span aria-hidden="true">⌖</span> View on map</Link>
          </div>
        </div>

        <div className="locations-overview" aria-label="Location overview">
          <div className="locations-overview-stat"><strong>{locations.length}</strong><span>areas to explore</span></div>
          <div className="locations-overview-stat"><strong>{locations.reduce((total, location) => total + location.hostels.length, 0)}</strong><span>hostels listed</span></div>
          <div className="locations-overview-stat"><strong>{availableRooms}</strong><span>rooms available</span></div>
          <div className="locations-overview-note"><span className="locations-overview-pulse" /> Updated from current listings</div>
        </div>

        {locations.length > 0 && (
          <div className="locations-quick-browse" aria-label="Quick browse areas">
            <span className="locations-quick-label">Quick browse</span>
            {locations.slice(0, 5).map((location) => (
              <Link key={location.name} to={`/findroom/rooms?location=${encodeURIComponent(location.name)}`}>
                {location.name}<span aria-hidden="true">↗</span>
              </Link>
            ))}
            {locations.length > 5 && <span className="locations-quick-more">+{locations.length - 5} more</span>}
          </div>
        )}

        {loading ? (
          <LocationsSkeleton />
        ) : filteredLocations.length === 0 ? (
          <EmptyState
            title="No locations match that search."
            description="Try searching for a hostel or nearby area."
          />
        ) : (
          <div className="locations-grid">
            {filteredLocations.map((location) => (
              <Link
                key={location.name}
                to={`/findroom/rooms?location=${encodeURIComponent(location.name)}`}
                className="location-card"
              >
                <div className="location-card-image">
                  <img src={location.photo} alt={location.name} loading="lazy" />
                  <div className="location-card-overlay" />
                  <span className="location-card-count">{location.hostels.length} {location.hostels.length === 1 ? 'hostel' : 'hostels'}</span>
                  <span className="location-card-arrow" aria-hidden="true">↗</span>
                  <div className="location-card-content">
                    <p className="location-card-kicker">Explore area</p>
                    <h2>{location.name}</h2>
                    <div className="location-card-meta">
                      <span>{location.roomOptions} room options</span>
                      <span>{location.availableUnits} available</span>
                    </div>
                    <span className="location-card-price">
                      From GH₵{location.startingPrice.toLocaleString('en-GH')}/{formatPricePeriod(location.startingPricingPeriod)}
                    </span>
                    {location.hasMixedPricingPeriods && <small className="location-card-mixed">Mixed billing periods</small>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FindRoomShell>
  );
}
