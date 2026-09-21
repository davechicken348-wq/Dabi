import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { HostelCard } from '../components/HostelCard/HostelCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchHostels, fetchRooms } from '../../services/hostelService';
import type { Hostel, RoomOption } from '../../types';
import './SavedRooms.css';

const SAVED_KEY = 'dabi-saved-rooms';
const SAVED_HOSTELS_KEY = 'dabi-saved-hostels';

function getSavedRoomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getSavedHostelIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_HOSTELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function SavedRooms() {
  const [allRooms, setAllRooms] = useState<RoomOption[]>([]);
  const [allHostels, setAllHostels] = useState<Hostel[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedRoomIds);
  const [savedHostelIds, setSavedHostelIds] = useState<string[]>(getSavedHostelIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'rooms' | 'hostels'>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchRooms(), fetchHostels()])
      .then(([rooms, hostels]) => {
        if (cancelled) return;
        setAllRooms(rooms);
        setAllHostels(hostels);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load saved rooms.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const syncSavedRooms = () => setSavedIds(getSavedRoomIds());
    const syncSavedHostels = () => setSavedHostelIds(getSavedHostelIds());
    window.addEventListener('dabi-saved-rooms-changed', syncSavedRooms);
    window.addEventListener('dabi-saved-hostels-changed', syncSavedHostels);
    return () => {
      window.removeEventListener('dabi-saved-rooms-changed', syncSavedRooms);
      window.removeEventListener('dabi-saved-hostels-changed', syncSavedHostels);
    };
  }, []);

  const savedRooms = allRooms.filter((room) => savedIds.includes(room.id));
  const savedHostels = allHostels.filter((hostel) => savedHostelIds.includes(hostel.id));
  const savedCount = savedRooms.length + savedHostels.length;

  if (error) {
    return (
      <FindRoomShell>
        <div className="saved-page">
          <EmptyState title={error} description="Please try again later." />
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="saved-page">
        <div className="saved-header">
          <div className="saved-header-copy">
            <p className="saved-eyebrow"><span className="saved-eyebrow-dot" /> My Dabi shortlist</p>
            <h1 className="saved-title"><span className="saved-title-mark">#</span> Saved for later</h1>
            <p className="saved-subtitle">
              {savedCount === 0
                ? 'Rooms and hostels you save will appear here so you can compare them later.'
                : `${savedCount} saved ${savedCount === 1 ? 'place' : 'places'} to compare.`}
            </p>
          </div>
            <div className="saved-header-actions">
              <Link to="/findroom/explore" className="saved-explore-link">Find more rooms <span aria-hidden="true">↗</span></Link>
              <Link to="/findroom/request" className="saved-request-link">Ask Dabi to help <span aria-hidden="true">→</span></Link>
            </div>
        </div>

          <div className="saved-overview" aria-label="Saved items overview">
            <div className="saved-overview-stat"><strong>{savedCount}</strong><span>saved places</span></div>
            <div className="saved-overview-stat"><strong>{savedRooms.length}</strong><span>rooms</span></div>
            <div className="saved-overview-stat"><strong>{savedHostels.length}</strong><span>hostels</span></div>
            <p className="saved-overview-note">Keep the good ones close while you decide.</p>
          </div>

          {!loading && savedCount > 0 && (
            <div className="saved-tabs" role="tablist" aria-label="Saved item type">
              {([
                ['all', 'Everything', savedCount],
                ['rooms', 'Rooms', savedRooms.length],
                ['hostels', 'Hostels', savedHostels.length],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === value}
                  className={`saved-tab ${activeTab === value ? 'saved-tab-active' : ''}`}
                  onClick={() => setActiveTab(value)}
                >
                  {label}<span>{count}</span>
                </button>
              ))}
            </div>
          )}

        {loading ? (
          <div className="saved-grid" aria-label="Loading saved rooms">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="saved-skeleton-card" />
            ))}
          </div>
        ) : savedCount === 0 ? (
          <EmptyState
            title="Nothing saved yet."
            description="Save a room or hostel to keep it here for later."
            actionLabel="Explore rooms"
            actionTo="/findroom/explore"
          />
        ) : (
          <>
            {(activeTab === 'all' || activeTab === 'hostels') && savedHostels.length > 0 && (
              <section className="saved-section" aria-labelledby="saved-hostels-title">
                <h2 id="saved-hostels-title" className="saved-section-title">Hostels</h2>
                <div className="saved-hostel-grid">
                  {savedHostels.map((hostel) => <HostelCard key={hostel.id} hostel={hostel} />)}
                </div>
              </section>
            )}
            {(activeTab === 'all' || activeTab === 'rooms') && savedRooms.length > 0 && (
              <section className="saved-section" aria-labelledby="saved-rooms-title">
                <h2 id="saved-rooms-title" className="saved-section-title">Rooms</h2>
                <div className="saved-grid">
                  {savedRooms.map((room) => <RoomCard key={room.id} room={room} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </FindRoomShell>
  );
}
