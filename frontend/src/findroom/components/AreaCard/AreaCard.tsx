import { Link } from 'react-router-dom';
import './AreaCard.css';

interface AreaCardProps {
  name: string;
  count: number;
  description?: string;
  imageUrl?: string;
}

export function AreaCard({ name, count, description, imageUrl }: AreaCardProps) {
  return (
    <Link to={`/findroom/rooms?location=${encodeURIComponent(name)}`} className="area-card">
      <div className="area-card-visual">
        {imageUrl ? (
          <img src={imageUrl} alt={`${name} area`} loading="lazy" />
        ) : (
          <div className="area-card-placeholder">
            <span aria-hidden="true">⌂</span>
          </div>
        )}
        <div className="area-card-overlay">
          <span className="area-card-count">{count} {count === 1 ? 'room' : 'rooms'}</span>
        </div>
      </div>
      <div className="area-card-body">
        <h3 className="area-card-name">{name}</h3>
        {description && <p className="area-card-description">{description}</p>}
      </div>
    </Link>
  );
}
