import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { RoomOption } from '../../../types';
import {
  buildRoomShareUrl,
  generateRoomShareMessage,
} from '../../../lib/sharing';
import { formatGhanaCedi, getDabiFeeSummary } from '../../../lib/pricing';
import { formatPricePeriod } from '../../../lib/utils';
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
  index?: number;
}

export function RoomCard({ room, index = 0 }: RoomCardProps) {
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
    window.dispatchEvent(new Event('dabi-saved-rooms-changed'));
    setSaved(next.includes(room.id));
  };

  const hostelShareData = {
    name: room.hostelName ?? 'Hostel',
    location: room.hostelLocation ?? '',
    verified: false,
    photos: room.photos,
  };
  const feeSummary = getDabiFeeSummary(room.pricePerYear);
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
  const initials = room.hostelName
    ? room.hostelName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DB';

  return (
    <figure
      className="room-card room-card-photo"
      data-testid="asset-grid-masonry-figure"
      data-masonryposition={index}
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      <div className="room-card-container">
        <div className="room-card-inner">
          <Link
            className="room-card-photo-link"
            to={`/findroom/rooms/${room.id}`}
            title={roomTypeLabel}
            aria-label={`View ${roomTypeLabel} at ${room.hostelName ?? 'hostel'}`}
            data-page-modal="true"
            data-discover="true"
          >
            <img
              alt={roomTypeLabel}
              loading="lazy"
              sizes="(min-width: 1359px) 416px, (min-width: 992px) calc((100vw - 96px) / 3), (min-width: 768px) calc((100vw - 72px) / 2), 100vw"
              src={room.photos[0]}
              className="room-card-img"
              data-testid="asset-grid-masonry-img"
              itemProp="thumbnailUrl"
              style={{
                backgroundImage: `url(${room.photos[0]})`,
                backgroundSize: 'cover',
                backgroundColor: 'var(--color-border)',
              }}
            />
          </Link>

          <div className="room-card-overlay">
            <div className="room-card-overlay-background showOnHover" />
            <div className="room-card-overlay-foreground">
              <div className="room-card-actions-top">
                <div>
                  <Link
                    className="room-card-plus-link"
                    rel="nofollow"
                    to={`/findroom/rooms/${room.id}`}
                    data-discover="true"
                  >
                    <svg className="room-card-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.281 8.3H8.156V3.125L11.281 1v7.3Zm.316 4.05H4.955V7.868L1.5 10.636v4.55h6.656V22h4.713l3.552-2.84h-4.824v-6.81Zm4.24 0v2.835h4.587l2.911-2.834h-7.497Z" />
                    </svg>
                  </Link>
                </div>
                <div className="room-card-actions-top-right">
                  <div className="showOnHover">
                    <button
                      type="button"
                      className={`room-card-save ${saved ? 'room-card-save-active' : ''}`}
                      onClick={(event) => {
                        event.preventDefault();
                        toggleSave();
                      }}
                      aria-label={saved ? 'Remove from saved rooms' : 'Save room'}
                      aria-pressed={saved}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="showOnHover">
                    <button
                      type="button"
                      className="room-card-add"
                      onClick={(event) => {
                        event.preventDefault();
                        setShareOpen(true);
                      }}
                      aria-label="Share this room"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        <path d="m8.7 14.7 6.6 3.6M15.3 5.7l-6.6 3.6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="room-card-actions-bottom">
                <div className="room-card-user-link-container">
                  <span>
                    <Link className="room-card-user-link" to={`/findroom/rooms/${room.id}`} data-discover="true">
                      <div className="room-card-avatar-container">
                        <div className="room-card-avatar-border">
                          <div className="room-card-avatar" aria-hidden="true">
                            {initials}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="room-card-info-container">
                      <Link className="room-card-name" to={`/findroom/rooms/${room.id}`} data-discover="true">
                        {room.hostelName ?? 'Dabi room'}
                      </Link>
                      <div className="room-card-secondary-label">
                        {room.hostelLocation ?? room.hostelName ?? ''}
                      </div>
                      <div className="room-card-pricing-row">
                        <span className="room-card-price">{formatGhanaCedi(room.pricePerYear)}/{formatPricePeriod(room.pricingPeriod)}</span>
                        <span className="room-card-fee">5% • {formatGhanaCedi(feeSummary.fee)}</span>
                      </div>
                    </div>
                  </span>
                </div>
                <div className="showOnHover room-card-download-container">
                  <Link
                    className="room-card-download"
                    rel="nofollow"
                    to={`/findroom/rooms/${room.id}`}
                    aria-label="View room details"
                    data-base-ui-tooltip-trigger=""
                  >
                    <svg className="room-card-download-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M10.9911 15.4012V4H13v11.4012l4.7138-4.3142 1.2865 1.5386L12.0004 19 5 12.6256l1.3675-1.5386z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <meta itemProp="name" content={roomTypeLabel} />
      <meta itemProp="description" content={room.description} />
      <link itemProp="license" href="https://dabi.com/license" />
      <link itemProp="acquireLicensePage" href="/findroom/rooms" />
      <meta itemProp="creditText" content={room.hostelName ?? 'Dabi'} />
      <meta itemProp="copyrightNotice" content={room.hostelName ?? 'Dabi'} />
      <div itemProp="creator" itemScope itemType="https://schema.org/Person">
        <meta itemProp="name" content={room.hostelName ?? 'Dabi'} />
      </div>

      <ShareDialog
        open={shareOpen}
        title={`${room.name} at ${hostelShareData.name}`}
        shareText={roomShareText}
        shareUrl={roomShareUrl}
        onClose={() => setShareOpen(false)}
      />
    </figure>
  );
}
