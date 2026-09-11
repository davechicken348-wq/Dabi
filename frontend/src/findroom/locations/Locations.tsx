import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { Search } from '../components/Search/Search';
import { LocationsSkeleton } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchHostels } from '../../services/hostelService';
import type { Hostel } from '../../types';
import './Locations.css';

export default function Locations() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHostels()
      .then((data) => {
        if (cancelled) return;
        setHostels(data);
        setSelectedLocation(data[0]?.location ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('We could not load locations right now.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const locations = useMemo(() => {
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

  const activeLocation = locations.find((location) => location.name === selectedLocation)
    ?? filteredLocations[0];

  return (
    <FindRoomShell>
      <div className="locations-page">
        <div className="locations-header">
          <div>
            <p className="locations-eyebrow">Discover by area</p>
            <h1 className="locations-title">Find a place that fits</h1>
            <p className="locations-subtitle">Start with a neighbourhood, then compare the rooms available there.</p>
          </div>
          <span className="locations-note">Showing Dabi-listed locations</span>
        </div>

        <div className="locations-search">
          <Search onSearch={(value) => { setQuery(value); setSelectedLocation(null); }} />
        </div>

        {error ? (
          <EmptyState title={error} description="Please try again later." />
        ) : loading ? (
          <LocationsSkeleton />
        ) : filteredLocations.length === 0 ? (
          <EmptyState title="No locations match that search." description="Try searching for a hostel or nearby area." />
        ) : (
          <div className="locations-workspace">
            <section className="locations-list" aria-label="Accommodation locations">
              <div className="locations-list-header">
                <div>
                  <h2>Locations</h2>
                  <p>{filteredLocations.length} areas with listings</p>
                </div>
                <span className="locations-list-marker">{activeLocation?.name}</span>
              </div>
              <div className="location-rows">
                {filteredLocations.map((location) => (
                  <button
                    key={location.name}
                    type="button"
                    className={`location-row ${activeLocation?.name === location.name ? 'location-row-active' : ''}`}
                    onClick={() => setSelectedLocation(location.name)}
                  >
                    <img src={location.photo} alt="" loading="lazy" />
                    <span className="location-row-copy">
                      <strong>{location.name}</strong>
                      <span>{location.hostels.length} {location.hostels.length === 1 ? 'hostel' : 'hostels'} · {location.roomOptions} room options</span>
                    </span>
                    <span className="location-row-price">From GH₵{location.startingPrice.toLocaleString()}</span>
                    <span className="location-row-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </section>

            {activeLocation && (
              <aside className="location-detail" aria-label={`${activeLocation.name} details`}>
                <div className="location-detail-image">
                  <img src={activeLocation.photo} alt={`${activeLocation.name} accommodation`} />
                  <span>{activeLocation.name}</span>
                </div>
                <div className="location-detail-body">
                  <p className="locations-eyebrow">Selected area</p>
                  <h2>{activeLocation.name}</h2>
                  <p className="location-detail-summary">Compare the room options and hostels Dabi has listed in this area.</p>
                  <div className="location-detail-stats">
                    <div><strong>{activeLocation.hostels.length}</strong><span>Hostels</span></div>
                    <div><strong>{activeLocation.roomOptions}</strong><span>Room options</span></div>
                    <div><strong>{activeLocation.availableUnits}</strong><span>Available units</span></div>
                  </div>
                  <div className="location-detail-hostels">
                    <h3>Hostels here</h3>
                    {activeLocation.hostels.map((hostel) => (
                      <Link key={hostel.id} to={`/findroom/rooms?hostel=${hostel.id}`} className="location-hostel-link">
                        <span>{hostel.name}</span>
                        <span>{hostel.roomOptions.length} options →</span>
                      </Link>
                    ))}
                  </div>
                  <Link to={`/findroom/rooms?location=${encodeURIComponent(activeLocation.name)}`} className="location-detail-action">
                    Explore rooms in {activeLocation.name} →
                  </Link>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
    </FindRoomShell>
  );
}