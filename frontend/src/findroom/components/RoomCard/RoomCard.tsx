import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { RoomOption } from '../../../types';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay';
import { AvailabilityBadge } from '../AvailabilityBadge/AvailabilityBadge';
import { FreshnessBadge } from '../FreshnessBadge/FreshnessBadge';
import { getAvailabilityStatus } from '../../../lib/utils';
import {
  buildRoomShareUrl,
  generateRoomShareMessage,
} from '../../../lib/sharing';
import { ShareDialog } from '../ShareDialog/ShareDialog';
import './RoomCard.css';

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

function persistSavedRoomIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

interface RoomCardProps {
  room: RoomOption & { hostelName?: string; hostelLocation?: string };
}

export function RoomCard({ room }: RoomCardProps) {
  const availability = getAvailabilityStatus(room.availableUnits, room.totalUnits);
  const [shareOpen, setShareOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSavedRoomIds().includes(room.id));
  }, [room.id]);

  const toggleSave = () => {
    const current = getSavedRoomIds();
    const next = current.includes(room.id)
      ? current.filter((id) => id !== room.id)
      : [...current, room.id];
    persistSavedRoomIds(next);
    setSaved(next.includes(room.id));
  };

  const hostelShareData = {
    name: room.hostelName ?? 'Hostel',
    location: room.hostelLocation ?? '',
    verified: false,
    photos: room.photos,
  };
  const roomShareUrl = buildRoomShareUrl(room.id);
  const roomShareText = generateRoomShareMessage(
    {
      id: room.id,
      name: room.name,
      pricePerYear: room.pricePerYear,
      pricingPeriod: room.pricingPeriod,
      availableUnits: room.availableUnits,
      totalUnits: room.totalUnits,
    },
    hostelShareData,
    roomShareUrl,
  );

  const roomTypeLabel = room.name.toLowerCase().includes('self-contained')
    ? room.name
    : `${room.name} room`;

  return (
    <div className="room-card">
      <div className="room-card-image">
        <img src={room.photos[0]} alt={`${roomTypeLabel} at ${room.hostelName ?? 'hostel'}`} loading="lazy" />
        <button
          type="button"
          className={`room-card-save ${saved ? 'room-card-save-active' : ''}`}
          onClick={toggleSave}
          aria-label={saved ? 'Remove from saved rooms' : 'Save room'}
          aria-pressed={saved}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="room-card-body">
        <div className="room-card-header">
          <h3 className="room-card-title">{roomTypeLabel}</h3>
          <PriceDisplay price={room.pricePerYear} />
        </div>
        <p className="room-card-location">
          {room.hostelName} · {room.hostelLocation}
        </p>
        <div className="room-card-meta">
          <AvailabilityBadge status={availability} available={room.availableUnits} total={room.totalUnits} />
          {room.lastCheckedAt && <FreshnessBadge checkedAt={room.lastCheckedAt} />}
        </div>
        <div className="room-card-actions">
          <Link to={`/findroom/rooms/${room.id}`} className="room-card-link">
            View room →
          </Link>

          <button
            type="button"
            className="room-card-share"
            onClick={() => setShareOpen(true)}
            aria-label="Share this room"
            aria-expanded={shareOpen}
          >
            <span aria-hidden="true" style={{fontSize: 18, lineHeight: 1}}>📤</span>
          </button>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        title={`${room.name} at ${hostelShareData.name}`}
        shareText={roomShareText}
        shareUrl={roomShareUrl}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
