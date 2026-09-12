import { useState, useEffect } from 'react';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchRooms } from '../../services/roomService';
import type { RoomOption } from '../../types';
import './SavedRooms.css';

const SAVED_KEY = 'dabi-saved-rooms';

function getSavedRoomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function SavedRooms() {
  const [allRooms, setAllRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRooms()
      .then((data) => {
        if (cancelled) return;
        setAllRooms(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load saved rooms.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const savedIds = getSavedRoomIds();
  const savedRooms = allRooms.filter((room) => savedIds.includes(room.id));

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
          <div>
            <p className="saved-eyebrow">My Rooms</p>
            <h1 className="saved-title">Saved rooms</h1>
            <p className="saved-subtitle">
              {savedRooms.length === 0
                ? 'Rooms you save will appear here so you can compare them later.'
                : `${savedRooms.length} room${savedRooms.length === 1 ? '' : 's'} you are considering.`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="saved-grid" aria-label="Loading saved rooms">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="saved-skeleton-card" />
            ))}
          </div>
        ) : savedRooms.length === 0 ? (
          <EmptyState
            title="Nothing saved yet."
            description="When you find a room you like, tap the heart to save it here."
            actionLabel="Explore rooms"
            actionTo="/findroom/explore"
          />
        ) : (
          <div className="saved-grid">
            {savedRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </FindRoomShell>
  );
}
