import { Link } from 'react-router-dom';
import type { Hostel } from '../../../types';
import { Badge } from '../../../shared/Badge/Badge';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay';
import { FacilityList } from '../FacilityList/FacilityList';
import { AvailabilityBadge } from '../AvailabilityBadge/AvailabilityBadge';
import { FreshnessBadge } from '../FreshnessBadge/FreshnessBadge';
import './HostelCard.css';

interface HostelCardProps {
  hostel: Hostel;
}

export function HostelCard({ hostel }: HostelCardProps) {
  const cheapestRoom = hostel.roomOptions.reduce((min, r) => (r.pricePerYear < min ? r.pricePerYear : min), Infinity);
  const totalAvailable = hostel.roomOptions.reduce((sum, r) => sum + r.availableUnits, 0);
  const totalRooms = hostel.roomOptions.reduce((sum, r) => sum + r.totalUnits, 0);
  const availability = totalAvailable === 0 ? 'full' : totalAvailable <= Math.max(1, Math.floor(totalRooms * 0.3)) ? 'limited' : 'available';

  return (
    <div className="hostel-card">
      <div className="hostel-card-image">
        <img src={hostel.photos[0]} alt={hostel.name} loading="lazy" />
        {hostel.verified && <Badge variant="success" className="hostel-verified">Verified</Badge>}
      </div>
      <div className="hostel-card-body">
        <h3 className="hostel-card-title">{hostel.name}</h3>
        <p className="hostel-card-location">{hostel.location}</p>
        <PriceDisplay price={cheapestRoom} label="From" />
        <p className="hostel-card-summary">{hostel.roomOptions.length} room options available</p>
        <FacilityList facilities={hostel.facilities.slice(0, 5)} />
        <div className="hostel-card-meta">
          <AvailabilityBadge status={availability} available={totalAvailable} total={totalRooms} />
          <FreshnessBadge checkedAt={hostel.checkedAt} />
        </div>
        <Link to={`/findroom/rooms?hostel=${hostel.id}`} className="hostel-card-link">
          View Hostel →
        </Link>
      </div>
    </div>
  );
}
