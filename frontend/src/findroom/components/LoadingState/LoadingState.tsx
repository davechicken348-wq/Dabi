import { Skeleton } from '../../../shared/Skeleton/Skeleton';
import './LoadingState.css';

export function LoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="loading-state">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="loading-card">
          <Skeleton height={180} borderRadius="var(--radius-xl)" />
          <div className="loading-card-body">
            <Skeleton width="40%" height={20} borderRadius="var(--radius-sm)" />
            <Skeleton width="30%" height={16} borderRadius="var(--radius-sm)" />
            <Skeleton width="60%" height={14} borderRadius="var(--radius-sm)" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LocationsSkeleton() {
  return (
    <div className="locations-skeleton" aria-label="Loading locations" role="status">
      <div className="locations-skeleton-list">
        <div className="skeleton-panel-heading">
          <Skeleton width="7rem" height={18} borderRadius="var(--radius-sm)" />
          <Skeleton width="10rem" height={12} borderRadius="var(--radius-sm)" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="locations-skeleton-row" key={index}>
            <Skeleton width={56} height={56} borderRadius="var(--radius-sm)" />
            <div>
              <Skeleton width="8rem" height={15} borderRadius="var(--radius-sm)" />
              <Skeleton width="11rem" height={11} borderRadius="var(--radius-sm)" />
            </div>
            <Skeleton width="5rem" height={12} borderRadius="var(--radius-sm)" />
          </div>
        ))}
      </div>
      <div className="locations-skeleton-detail">
        <Skeleton height={176} borderRadius="var(--radius-sm)" />
        <Skeleton width="7rem" height={12} borderRadius="var(--radius-sm)" />
        <Skeleton width="12rem" height={22} borderRadius="var(--radius-sm)" />
        <Skeleton width="100%" height={14} borderRadius="var(--radius-sm)" />
        <Skeleton width="90%" height={14} borderRadius="var(--radius-sm)" />
        <div className="locations-skeleton-stats">
          <Skeleton height={54} borderRadius="var(--radius-sm)" />
          <Skeleton height={54} borderRadius="var(--radius-sm)" />
          <Skeleton height={54} borderRadius="var(--radius-sm)" />
        </div>
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
