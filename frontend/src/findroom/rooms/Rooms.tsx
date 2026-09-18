import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { fetchRooms } from '../../services/roomService';
import type { RoomOption } from '../../types';
import './Rooms.css';

const roomTags = ['Featured', 'Private', 'Shared', 'Self-contained', 'Budget', 'Verified', 'Near campus', 'Studio', 'Available now', 'New listings'];

export default function Rooms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') ?? '';
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
  const heroRooms = rooms.filter((room) => room.photos[0]).slice(0, 6);
  const featuredRoom = heroRooms[0];

  return (
    <FindRoomShell>
      <div className="rooms-page rooms-unsplash">
        <section className="rooms-hero-modules" aria-label="Dabi room discovery">
          <article className="rooms-hero-module rooms-hero-discovery">
            <div className="rooms-hero-copy">
              <p className="rooms-unsplash-kicker">DABI / FINDROOMS</p>
              <h1 className="rooms-hero-title"><span className="findroom-heading-hash">#</span> Find a room that feels like home.</h1>
              <p className="rooms-hero-description">Verified rooms, trusted hostels, and clear prices for student living.</p>
              <button className="rooms-hero-button" type="button" onClick={() => navigate('/findroom/explore')}>Explore rooms</button>
            </div>
            <div className="rooms-hero-collage" aria-hidden="true">
              {heroRooms.length > 0 ? heroRooms.map((room, index) => (
                <img key={room.id} className={`rooms-hero-collage-image rooms-hero-collage-image-${index + 1}`} src={room.photos[0]} alt="" />
              )) : Array.from({ length: 6 }).map((_, index) => <span key={index} className={`rooms-hero-collage-image rooms-hero-collage-image-${index + 1} rooms-hero-collage-placeholder`} />)}
            </div>
          </article>

          <button className="rooms-hero-module rooms-hero-compare" type="button" onClick={() => navigate('/findroom/explore')}>
            <div className="rooms-hero-compare-copy">
              <h2>Compare your room options</h2>
              <p>Private, shared, studio, or self-contained.</p>
            </div>
            <div className="rooms-hero-compare-frame" aria-hidden="true">
              {heroRooms.slice(1, 3).map((room) => <img key={room.id} src={room.photos[0]} alt="" />)}
              <span className="rooms-hero-plus">+</span>
            </div>
          </button>

          <button className="rooms-hero-module rooms-hero-featured" type="button" onClick={() => navigate('/findroom/rooms')}>
            {featuredRoom ? <img src={featuredRoom.photos[0]} alt="" /> : <span className="rooms-hero-featured-placeholder" />}
            <span className="rooms-hero-featured-overlay" />
            <span className="rooms-hero-featured-copy">
              <strong>{featuredRoom?.hostelName ?? 'Featured hostel'}</strong>
              <small>{featuredRoom?.hostelLocation ?? 'Verified rooms on Dabi'}</small>
            </span>
          </button>
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
          <section className="rooms-unsplash-grid" data-testid="masonry-grid-count-three">
            {loading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <article key={index} className="rooms-unsplash-tile rooms-unsplash-tile-skeleton" />
                ))
              : filteredRooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} index={index} />
                ))}
            {!loading && filteredRooms.length === 0 && (
              <p className="rooms-empty-filter">No rooms match “{activeTag}” yet.</p>
            )}
          </section>
        )}
      </div>
    </FindRoomShell>
  );
}
