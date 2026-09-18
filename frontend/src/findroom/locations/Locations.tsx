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
  photo: string;
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
      return {
        name,
        hostels: areaHostels,
        roomOptions: rooms.length,
        availableUnits: rooms.reduce((total, room) => total + room.availableUnits, 0),
        startingPrice: Math.min(...rooms.map((room) => room.pricePerYear)),
        photo: areaHostels[0].photos[0],
      };
    });
  }, [hostels]);

  const filteredLocations = locations.filter((location) => {
    const search = query.trim().toLowerCase();
    return !search || location.name.toLowerCase().includes(search)
      || location.hostels.some((hostel) => hostel.name.toLowerCase().includes(search));
  });

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
            <p className="locations-eyebrow">Discover by area</p>
            <h1 className="locations-title">Locations</h1>
            <p className="locations-subtitle">
              Browse neighbourhoods and find the rooms that fit your budget and lifestyle.
            </p>
          </div>
          <div className="locations-head-actions">
            <Link to="/findroom/map" className="locations-map-link">View on map</Link>
            <div className="locations-head-search">
              <Search onSearch={(value) => setQuery(value)} />
            </div>
          </div>
        </div>

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
                  <div className="location-card-gradient" />
                </div>
                <div className="location-card-content">
                  <h2>{location.name}</h2>
                  <p>
                    {location.hostels.length} {location.hostels.length === 1 ? 'hostel' : 'hostels'} ·{' '}
                    {location.roomOptions} room options
                  </p>
                  <span className="location-card-price">
                    From GH₵{location.startingPrice.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FindRoomShell>
  );
}
