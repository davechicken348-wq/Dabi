import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RoomOption } from '../../../types';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay';
import { FacilityList } from '../FacilityList/FacilityList';
import { AvailabilityBadge } from '../AvailabilityBadge/AvailabilityBadge';
import { FreshnessBadge } from '../FreshnessBadge/FreshnessBadge';
import { getAvailabilityStatus } from '../../../lib/utils';
import {
  buildRoomShareUrl,
  canCopyRoomLink,
  canUseNativeShare,
  copyRoomLink,
  generateRoomShareMessage,
  openWhatsAppShare,
} from '../../../lib/sharing';
import './RoomCard.css';

interface RoomCardProps {
  room: RoomOption & { hostelName?: string; hostelLocation?: string };
}

export function RoomCard({ room }: RoomCardProps) {
  const availability = getAvailabilityStatus(room.availableUnits, room.totalUnits);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

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

  const handleShareAction = async (action: 'native' | 'whatsapp' | 'copy') => {
    setShareStatus(null);
    setShowShareDialog(false);

    try {
      if (action === 'native') {
        if (!canUseNativeShare()) {
          setShareStatus('Native sharing isn’t available here yet.');
          return;
        }

        await navigator.share({
          title: `${room.name} at ${hostelShareData.name} | Dabi`,
          text: roomShareText,
          url: roomShareUrl,
        });

        setShareStatus('Nice — room shared. 🫶🏽');
        return;
      }

      if (action === 'whatsapp') {
        const opened = openWhatsAppShare(roomShareText);

        if (opened) {
          setShareStatus('Opening WhatsApp…');
          return;
        }

        setShareStatus("Couldn't open WhatsApp. Try copying the link instead.");
        return;
      }

      const copied = await copyRoomLink(roomShareUrl);

      if (copied) {
        setShareStatus('Link copied! 🥳');
        return;
      }

      setShareStatus("Couldn't copy the link just yet. 😅");
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setShareStatus("Couldn't share that one just yet. 😅");
    }
  };

  return (
    <div className="room-card">
      <div className="room-card-image">
        <img src={room.photos[0]} alt={`${room.name} room`} loading="lazy" />
      </div>
      <div className="room-card-body">
        <div className="room-card-header">
          <h3 className="room-card-title">{room.name}</h3>
          <PriceDisplay price={room.pricePerYear} />
        </div>
        <p className="room-card-location">
          {room.hostelName} · {room.hostelLocation}
        </p>
        <div className="room-card-meta">
          <AvailabilityBadge status={availability} available={room.availableUnits} total={room.totalUnits} />
          <FreshnessBadge checkedAt={room.hostelId} />
        </div>
        <FacilityList facilities={room.facilities.slice(0, 4)} />
        <div className="room-card-actions">
          <Link to={`/findroom/rooms/${room.id}`} className="room-card-link">
            View Room →
          </Link>

          <div className="room-card-share-wrapper">
            <button
              type="button"
              className="room-card-share"
              onClick={() => setShowShareDialog(true)}
              aria-expanded={showShareDialog}
              aria-label="Share this room"
            >
              ↗ Share
            </button>

            {showShareDialog && (
              <div className="room-card-share-backdrop" onClick={() => setShowShareDialog(false)}>
                <div className="room-card-share-dialog" role="dialog" aria-modal="true" aria-label="Share this room" onClick={(event) => event.stopPropagation()}>
                  <div className="room-card-share-dialog-header">
                    <div>
                      <p className="room-card-share-kicker">Share this room</p>
                      <h3 className="room-card-share-title">Choose how you want to share</h3>
                    </div>
                    <button type="button" className="room-card-share-close" onClick={() => setShowShareDialog(false)} aria-label="Close share dialog">
                      ×
                    </button>
                  </div>

                  <div className="room-card-share-actions">
                    {canUseNativeShare() && (
                      <button type="button" className="room-card-share-option" onClick={() => handleShareAction('native')}>
                        More ways to share
                      </button>
                    )}
                    <button type="button" className="room-card-share-option" onClick={() => handleShareAction('whatsapp')}>
                      WhatsApp
                    </button>
                    {canCopyRoomLink() && (
                      <button type="button" className="room-card-share-option" onClick={() => handleShareAction('copy')}>
                        Copy link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {shareStatus && (
          <p className="room-card-share-status" role="status">
            {shareStatus}
          </p>
        )}
      </div>
    </div>
  );
}
