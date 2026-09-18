import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Hostel } from '../../../types';
import { Badge } from '../../../shared/Badge/Badge';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay';
import { AvailabilityBadge } from '../AvailabilityBadge/AvailabilityBadge';
import { FreshnessBadge } from '../FreshnessBadge/FreshnessBadge';
import { formatDistanceFromStu, getDistanceFromStu } from '../../../lib/distance';
import './HostelCard.css';

interface HostelCardProps {
  hostel: Hostel;
}

const SAVED_HOSTELS_KEY = 'dabi-saved-hostels';

function getSavedHostelIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_HOSTELS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function HostelCard({ hostel }: HostelCardProps) {
  const [saved, setSaved] = useState(false);
  const cheapestRoom = hostel.roomOptions.reduce((min, r) => (r.pricePerYear < min ? r.pricePerYear : min), Infinity);
  const totalAvailable = hostel.roomOptions.reduce((sum, r) => sum + r.availableUnits, 0);
  const totalRooms = hostel.roomOptions.reduce((sum, r) => sum + r.totalUnits, 0);
  const availability = totalAvailable === 0 ? 'full' : totalAvailable <= Math.max(1, Math.floor(totalRooms * 0.3)) ? 'limited' : 'available';
  const distanceLabel = formatDistanceFromStu(getDistanceFromStu(hostel));

  useEffect(() => {
    setSaved(getSavedHostelIds().includes(hostel.id));
  }, [hostel.id]);

  const toggleSaved = () => {
    const current = getSavedHostelIds();
    const next = current.includes(hostel.id)
      ? current.filter((id) => id !== hostel.id)
      : [...current, hostel.id];
    window.localStorage.setItem(SAVED_HOSTELS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('dabi-saved-hostels-changed'));
    setSaved(next.includes(hostel.id));
  };

  return (
    <div className="hostel-card">
      <div className="hostel-card-image">
        <img src={hostel.photos[0]} alt={hostel.name} loading="lazy" />
        {hostel.verified && <Badge variant="success" className="hostel-verified">Verified</Badge>}
        <button
          type="button"
          className={`hostel-card-save ${saved ? 'hostel-card-save-active' : ''}`}
          onClick={toggleSaved}
          aria-label={saved ? `Remove ${hostel.name} from saved hostels` : `Save ${hostel.name}`}
          aria-pressed={saved}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <div className="hostel-card-body">
        <h3 className="hostel-card-title">{hostel.name}</h3>
        <p className="hostel-card-location">{hostel.location}</p>
        <p className="hostel-card-description">{hostel.description}</p>
        {distanceLabel && <p className="hostel-card-distance">{distanceLabel}</p>}
        <PriceDisplay price={cheapestRoom} label="From" />
        <p className="hostel-card-summary">{hostel.roomOptions.length} room options available</p>
        <div className="hostel-card-meta">
          <AvailabilityBadge status={availability} available={totalAvailable} total={totalRooms} />
          <FreshnessBadge checkedAt={hostel.checkedAt} />
        </div>
        <Link to={`/findroom/rooms?hostel=${encodeURIComponent(hostel.slug ?? hostel.id)}`} className="hostel-card-link">
          View Hostel →
        </Link>
      </div>
    </div>
  );
}
