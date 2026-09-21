import { Skeleton } from '../../../shared/Skeleton/Skeleton';
import './LoadingState.css';

export function LoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="loading-state" aria-label="Loading rooms" role="status">
      {Array.from({ length: count }).map((_, i) => <RoomCardSkeleton key={i} />)}
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <article className="room-card room-card-skeleton" aria-hidden="true">
      <div className="room-card-skeleton-media">
        <span className="room-card-skeleton-shimmer" />
        <div className="room-card-skeleton-actions">
          <span />
          <span />
        </div>
        <div className="room-card-skeleton-details">
          <span className="room-card-skeleton-avatar" />
          <span className="room-card-skeleton-lines">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </article>
  );
}

export function LocationsSkeleton() {
  return (
    <div className="locations-skeleton" aria-label="Loading locations" role="status">
      <div className="locations-skeleton-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="location-card location-card-skeleton" key={index}>
            <div className="location-card-skeleton-shimmer" />
            <span className="location-card-skeleton-count" />
            <span className="location-card-skeleton-arrow" />
            <div className="location-card-skeleton-content">
              <Skeleton width="32%" height={10} borderRadius="var(--radius-full)" />
              <Skeleton width="58%" height={24} borderRadius="var(--radius-sm)" />
              <Skeleton width="72%" height={13} borderRadius="var(--radius-sm)" />
              <Skeleton width="48%" height={13} borderRadius="var(--radius-sm)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="map-skeleton" aria-label="Loading map" role="status">
      <div className="map-skeleton-title">
        <Skeleton width="11rem" height={22} borderRadius="var(--radius-sm)" />
        <Skeleton width="16rem" height={13} borderRadius="var(--radius-sm)" />
      </div>
      <div className="map-skeleton-search">
        <Skeleton width="100%" height={46} borderRadius="var(--radius-md)" />
      </div>
      <div className="map-skeleton-drawer">
        <Skeleton width="8rem" height={18} borderRadius="var(--radius-sm)" />
        <Skeleton width="11rem" height={12} borderRadius="var(--radius-sm)" />
      </div>
      <span className="map-skeleton-marker map-skeleton-marker-one" />
      <span className="map-skeleton-marker map-skeleton-marker-two" />
      <span className="map-skeleton-marker map-skeleton-marker-three" />
    </div>
  );
}
