import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DABI_COMMUNITY_LINK } from '../../lib/dabiContact';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { RoomCardSkeleton } from '../components/LoadingState/LoadingState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { fetchRooms } from '../../services/roomService';
import type { RoomOption } from '../../types';
import './Rooms.css';

const roomTags = ['Featured', 'Private', 'Shared', 'Self-contained', 'Budget', 'Verified', 'Near campus', 'Studio', 'Available now', 'New listings'];

export default function Rooms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') ?? '';
  const hostelFilter = searchParams.get('hostel') ?? '';
  const [query, setQuery] = useState('');
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [activeTag, setActiveTag] = useState('Featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/findroom/explore?query=${encodeURIComponent(value)}` : '/findroom/explore');
  };

  const sortedPrices = rooms.map((room) => room.pricePerYear).sort((a, b) => a - b);
  const budgetLimit = sortedPrices[Math.floor(sortedPrices.length / 2)] ?? 0;
  const filteredRooms = rooms.filter((room) => {
    const roomText = [room.name, room.description, room.hostelName, room.hostelLocation, ...room.facilities]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (locationFilter && room.hostelLocation !== locationFilter) {
      return false;
    }
    if (hostelFilter && room.hostelSlug !== hostelFilter && room.hostelId !== hostelFilter) {
      return false;
    }

    switch (activeTag) {
      case 'Private': return room.occupancy === 1 || roomText.includes('private');
      case 'Shared': return room.occupancy > 1 || roomText.includes('shared');
      case 'Self-contained': return roomText.includes('self-contained') || roomText.includes('self contained');
      case 'Budget': return room.pricePerYear <= budgetLimit;
      case 'Verified': return Boolean(room.lastCheckedAt);
      case 'Near campus': return roomText.includes('campus') || roomText.includes('university') || roomText.includes('college');
      case 'Studio': return roomText.includes('studio');
      case 'Available now': return room.availableUnits > 0 && room.availabilityStatus !== 'Full';
      case 'New listings': return room.lastCheckedAt ? Date.now() - new Date(room.lastCheckedAt).getTime() <= 30 * 24 * 60 * 60 * 1000 : false;
      default: return true;
    }
  });
  return (
    <FindRoomShell>
      <div className="rooms-page rooms-unsplash">
        <section className="rooms-community-hero" aria-label="Dabi community hero">
          <div className="rooms-community-hero-copy">
            <p className="rooms-community-hero-kicker">DABI / COMMUNITY</p>
            <h1><span className="findroom-heading-hash">#</span> Find rooms that fit your life and the people around you.</h1>
            <p>Verified rooms, trusted hostels, and a community of students making the search easier.</p>
            <div className="rooms-community-hero-actions">
              <a href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer" className="rooms-community-hero-secondary">💚 Join Dabi Community</a>
            </div>
          </div>
        </section>

        <form className="rooms-unsplash-search-bar" onSubmit={submitSearch}>
          <span className="rooms-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            className="rooms-search-text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hostels, room types, and locations"
            aria-label="Search hostels, room types, and locations"
          />
          <button className="rooms-search-button" type="submit">Find rooms</button>
        </form>

        <section className="rooms-unsplash-tags" aria-label="Room categories">
          {roomTags.map((tag) => (
            <button key={tag} type="button" className={`rooms-tag ${activeTag === tag ? 'active' : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
          ))}
        </section>

        {error && <ErrorState description={error} />}

        {!error && (
          <>
            <section className="rooms-unsplash-grid" data-testid="masonry-grid-count-three">
              {loading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <RoomCardSkeleton key={index} />
                  ))
                : filteredRooms.map((room, index) => (
                    <RoomCard key={room.id} room={room} index={index} />
                  ))}
              {!loading && filteredRooms.length === 0 && (
                <p className="rooms-empty-filter">No rooms match “{activeTag}” yet.</p>
              )}
            </section>

            <section className="rooms-end-cta" aria-label="Need room help">
              <p className="rooms-end-cta-kicker">Still haven’t found your room? 🥺</p>
              <h2>Your perfect match might not be listed yet.</h2>
              <p>Tell Dabi what you need and we’ll look for it with you.</p>
              <div className="rooms-end-cta-actions">
                <Link to="/findroom/request" className="rooms-end-cta-primary">Help Me Find a Room →</Link>
                <a href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer" className="rooms-end-cta-secondary">💚 Join Dabi Community</a>
              </div>
            </section>
          </>
        )}
      </div>
    </FindRoomShell>
  );
}
