import { useState, useEffect } from 'react';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { Search } from '../components/Search/Search';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchRooms } from '../../services/roomService';
import type { RoomOption } from '../../types';
import './Rooms.css';

export default function Rooms() {
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'all' | 'available' | 'limited'>('all');
  const [sortBy, setSortBy] = useState<'checked' | 'price-low' | 'price-high'>('checked');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRooms()
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
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [room.name, room.hostelName, room.hostelLocation, ...room.facilities]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
    const matchesAvailability = availability === 'all'
      || (availability === 'available' && room.availableUnits > 0)
      || (availability === 'limited' && room.availableUnits > 0 && room.availableUnits <= 2);
    return matchesQuery && matchesAvailability;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'price-low') return a.pricePerYear - b.pricePerYear;
    if (sortBy === 'price-high') return b.pricePerYear - a.pricePerYear;
    return new Date(b.hostelId).getTime() - new Date(a.hostelId).getTime();
  });

  if (error) {
    return (
      <FindRoomShell>
        <div className="rooms-page">
          <EmptyState title={error} description="Please try again later." />
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="rooms-page">
        <div className="rooms-header">
          <div>
            <p className="rooms-eyebrow">Room inventory</p>
            <h1 className="rooms-title">All rooms</h1>
            <p className="rooms-subtitle">Browse room options across Dabi-checked hostels.</p>
          </div>
          <span className="rooms-note">Room-level availability</span>
        </div>
        <div className="rooms-search">
          <Search onSearch={setQuery} />
        </div>
        <div className="rooms-toolbar">
          <div className="rooms-tabs" aria-label="Filter rooms by availability">
            {(['all', 'available', 'limited'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`rooms-tab ${availability === option ? 'rooms-tab-active' : ''}`}
                onClick={() => setAvailability(option)}
              >
                {option === 'all' ? 'All rooms' : option === 'available' ? 'Available' : 'Limited'}
              </button>
            ))}
          </div>
          <div className="rooms-toolbar-right">
            {!loading && !error && <span className="rooms-count">{sortedRooms.length} room options</span>}
            <label className="rooms-sort">
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                <option value="checked">Recently checked</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        {loading ? (
          <LoadingState count={6} />
        ) : sortedRooms.length === 0 ? (
          <EmptyState
            title="Nothing matches this view."
            description="Try a different search or availability filter."
          />
        ) : (
          <div className="rooms-grid">
            {sortedRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </FindRoomShell>
  );
}
