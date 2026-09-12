import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Badge } from '../../shared/Badge/Badge';
import { AvailabilityBadge } from '../components/AvailabilityBadge/AvailabilityBadge';
import { FreshnessBadge } from '../components/FreshnessBadge/FreshnessBadge';
import { FacilityList } from '../components/FacilityList/FacilityList';
import { PriceDisplay } from '../components/PriceDisplay/PriceDisplay';
import { fetchRoomById, fetchHostelById } from '../../services/hostelService';
import { submitEnquiry } from '../../services/enquiryService';
import { getAvailabilityStatus } from '../../lib/utils';
import {
  buildRoomShareUrl,
  canCopyRoomLink,
  canUseNativeShare,
  copyRoomLink,
  generateRoomShareMessage,
  openWhatsAppShare,
  setRoomMetaTags,
} from '../../lib/sharing';
import type { RoomOption, Hostel } from '../../types';
import './RoomDetails.css';

function formatPricingPeriod(period?: RoomOption['pricingPeriod']) {
  if (!period) return 'per academic year';

  switch (period) {
    case 'Semester':
      return 'per semester';
    case 'Month':
      return 'per month';
    case 'AcademicYear':
    default:
      return 'per academic year';
  }
}

function formatDate(value?: string) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomOption | null>(null);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    school: '',
    moveInDate: '',
    message: '',
  });

  useEffect(() => {
    if (room && hostel) {
      setRoomMetaTags(room, hostel);
    }
  }, [room, hostel]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRoomById(id)
      .then((r) => {
        if (cancelled || !r) return;
        setRoom(r);
        return fetchHostelById(r.hostelId);
      })
      .then((h) => {
        if (cancelled) return;
        setHostel(h || null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load room details.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <FindRoomShell>
        <div className="room-details room-details-skeleton" aria-label="Loading room details" role="status">
          <span className="room-details-skeleton-back" />
          <div className="room-details-main">
            <div className="room-details-gallery">
              <div className="room-details-skeleton-image" />
              <div className="room-details-skeleton-thumbnails">
                <span /><span /><span />
              </div>
            </div>
            <aside className="room-details-sidebar">
              <div className="room-details-summary room-details-skeleton-summary">
                <div className="room-details-skeleton-line room-details-skeleton-line-short" />
                <div className="room-details-skeleton-line room-details-skeleton-line-title" />
                <div className="room-details-skeleton-line room-details-skeleton-line-medium" />
                <div className="room-details-skeleton-facts">
                  <span /><span /><span /><span />
                </div>
                <div className="room-details-skeleton-button" />
              </div>
            </aside>
          </div>
          <div className="room-details-skeleton-content">
            <div className="room-details-skeleton-line room-details-skeleton-line-section" />
            <div className="room-details-skeleton-line room-details-skeleton-line-wide" />
            <div className="room-details-skeleton-line room-details-skeleton-line-wide" />
            <div className="room-details-skeleton-line room-details-skeleton-line-medium" />
          </div>
        </div>
      </FindRoomShell>
    );
  }

  if (error || !room || !hostel) {
    return (
      <FindRoomShell>
        <ErrorState
          title={error || 'Room not found.'}
          description='This room may no longer be available.'
        />
      </FindRoomShell>
    );
  }

  const availability = getAvailabilityStatus(room.availableUnits, room.totalUnits);
  const galleryPhotos = room.photos.length
    ? room.photos
    : hostel.photos.length
      ? hostel.photos
      : ['/images/hostel-placeholder.svg'];
  const activePhoto = galleryPhotos[selectedPhoto] ?? galleryPhotos[0];
  const relatedRooms = hostel.roomOptions
    .filter((candidate) => candidate.id !== room.id)
    .slice(0, 3);
  const roomOfferingId = room?.roomOfferingId;
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
    hostel,
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
          title: `${room.name} at ${hostel.name} | Dabi`,
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

  const openEnquiryModal = () => {
    setEnquiryError('');
    setEnquirySubmitted(false);
    setEnquirySubmitting(false);
    setShowEnquiryModal(true);
  };

  const closeEnquiryModal = () => {
    setShowEnquiryModal(false);
    setEnquiryError('');
    setEnquirySubmitted(false);
    setEnquirySubmitting(false);
  };

  const handleEnquiryChange = (field: keyof typeof enquiryForm, value: string) => {
    setEnquiryForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function handleEnquirySubmit(event: any) {
    event.preventDefault();

    if (!room || !hostel) {
      setEnquiryError('This room is no longer available. Please refresh the page and try again.');
      return;
    }

    const name = enquiryForm.name.trim();
    const phone = enquiryForm.phone.trim();

    if (!name || !phone) {
      setEnquiryError('Please enter your full name and phone number so Dabi can contact you.');
      return;
    }

    try {
      setEnquirySubmitting(true);
      setEnquiryError('');

      await submitEnquiry({
        roomId: roomOfferingId,
        hostelId: hostel.id,
        roomName: room.name,
        hostelName: hostel.name,
        studentName: name,
        phone,
        school: enquiryForm.school.trim() || undefined,
        moveInDate: enquiryForm.moveInDate || undefined,
        message: enquiryForm.message.trim() || undefined,
      });

      setEnquirySubmitted(true);
      setEnquirySubmitting(false);
    } catch (error) {
      setEnquirySubmitting(false);
      setEnquiryError(
        error instanceof Error && error.message
          ? error.message
          : "Oops, something went wrong. Please try again.",
      );
    }
  }

  return (
    <FindRoomShell>
      <div className="room-details">
        <Link to={`/findroom/rooms${hostel ? `?hostel=${hostel.id}` : ''}`} className="room-details-back-link">
          ← Back to rooms
        </Link>

        <div className="room-details-main">
          <div className="room-details-gallery">
            <div className="room-details-main-image">
              <img src={activePhoto} alt={`${room.name} photo`} />
            </div>

            {galleryPhotos.length > 1 && (
              <div className="room-details-thumbnails">
                {galleryPhotos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    className={`room-thumb ${index === selectedPhoto ? 'room-thumb-active' : ''}`}
                    onClick={() => setSelectedPhoto(index)}
                  >
                    <img src={photo} alt={`${room.name} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="room-details-sidebar">
            <div className="room-details-summary">
              <div className="room-details-badges">
                <AvailabilityBadge status={availability} available={room.availableUnits} total={room.totalUnits} />
                {hostel.verified && <Badge variant="success">Verified by Dabi</Badge>}
                <FreshnessBadge checkedAt={hostel.checkedAt} />
              </div>

              <div className="room-details-header">
                <p className="room-details-kicker">Room offering</p>
                <div className="room-details-header-actions">
                  <h1 className="room-details-title">{room.name}</h1>

                  <div className="room-details-share-wrapper">
                    <button
                      type="button"
                      className="room-details-share-button"
                      onClick={() => setShowShareDialog(true)}
                      aria-expanded={showShareDialog}
                      aria-label="Share this room"
                    >
                      Share this room ↗
                    </button>

                    {showShareDialog && (
                      <div className="room-details-share-backdrop" onClick={() => setShowShareDialog(false)}>
                        <div className="room-details-share-dialog" role="dialog" aria-modal="true" aria-label="Share this room" onClick={(event) => event.stopPropagation()}>
                          <div className="room-details-share-dialog-header">
                            <div>
                              <p className="room-details-share-kicker">Share this room</p>
                              <h3 className="room-details-share-title">Choose how you want to share</h3>
                            </div>
                            <button type="button" className="room-details-share-close" onClick={() => setShowShareDialog(false)} aria-label="Close share dialog">
                              ×
                            </button>
                          </div>

                          <div className="room-details-share-actions">
                            {canUseNativeShare() && (
                              <button type="button" className="room-details-share-option" onClick={() => handleShareAction('native')}>
                                More ways to share
                              </button>
                            )}
                            <button type="button" className="room-details-share-option" onClick={() => handleShareAction('whatsapp')}>
                              WhatsApp
                            </button>
                            {canCopyRoomLink() && (
                              <button type="button" className="room-details-share-option" onClick={() => handleShareAction('copy')}>
                                Copy link
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="room-details-hostel">
                  <Link to={`/findroom/rooms?hostel=${hostel.id}`} className="room-details-hostel-link">
                    {hostel.name}
                  </Link>
                  <span className="room-details-location"> · {hostel.location}</span>
                </p>
              </div>

              {shareStatus && (
                <p className="room-details-share-status" role="status">
                  {shareStatus}
                </p>
              )}

              <div className="room-details-price">
                <PriceDisplay price={room.pricePerYear} />
                <span className="room-details-price-meta">{formatPricingPeriod(room.pricingPeriod)}</span>
              </div>

              <div className="room-details-quick-facts">
                <div className="room-details-quick-fact">
                  <span className="room-details-fact-label">Available</span>
                  <strong>{room.availableUnits}/{room.totalUnits}</strong>
                </div>
                <div className="room-details-quick-fact">
                  <span className="room-details-fact-label">Type</span>
                  <strong>{room.name}</strong>
                </div>
                <div className="room-details-quick-fact">
                  <span className="room-details-fact-label">Distance</span>
                  <strong>{hostel.distanceKm !== undefined ? `${hostel.distanceKm}km` : 'Near campus'}</strong>
                </div>
                <div className="room-details-quick-fact">
                  <span className="room-details-fact-label">Check-in</span>
                  <strong>{hostel.verified ? 'Verified' : 'Pending review'}</strong>
                </div>
              </div>

              <div className="room-details-cta">
                <button type="button" className="enquire-button" onClick={openEnquiryModal}>
                  I’m Interested 🫶🏽
                </button>
                <p className="enquire-note">Let Dabi know you’re interested and we’ll help with the next step.</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="room-details-content">
          <section className="room-details-section room-details-section-large">
            <h3 className="room-details-section-title">About this room</h3>
            <p className="room-details-description">{room.description}</p>
          </section>

          <div className="room-details-two-column">
            <section className="room-details-section">
              <h3 className="room-details-section-title">Room details</h3>
              <div className="room-details-facts-list">
                <div className="room-details-fact-row">
                  <span>Room type</span>
                  <strong>{room.name}</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Available units</span>
                  <strong>{room.availableUnits} of {room.totalUnits}</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Occupancy</span>
                  <strong>{room.occupancy} in 1</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Pricing</span>
                  <strong>{formatPricingPeriod(room.pricingPeriod)}</strong>
                </div>
              </div>
            </section>

            <section className="room-details-section">
              <h3 className="room-details-section-title">Hostel details</h3>
              <div className="room-details-facts-list">
                <div className="room-details-fact-row">
                  <span>Address</span>
                  <strong>{hostel.address || hostel.location}</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Landmark</span>
                  <strong>{hostel.landmark || 'Not provided'}</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Last checked</span>
                  <strong>{formatDate(hostel.lastCheckedAt || hostel.checkedAt)}</strong>
                </div>
                <div className="room-details-fact-row">
                  <span>Verification</span>
                  <strong>{hostel.verified ? 'Verified by Dabi' : 'Awaiting verification'}</strong>
                </div>
              </div>
            </section>
          </div>

          <section className="room-details-section">
            <h3 className="room-details-section-title">What you’ll get</h3>
            <FacilityList facilities={room.facilities} />
          </section>

          <section className="room-details-section">
            <h3 className="room-details-section-title">About {hostel.name}</h3>
            <p className="room-details-description">{hostel.description}</p>
          </section>

          <section className="room-details-section">
            <h3 className="room-details-section-title">Where you’ll live</h3>
            <div className="room-details-location-box">
              <div>
                <span className="room-details-location-label">Address</span>
                <p>{hostel.address || hostel.location}</p>
              </div>
              <div>
                <span className="room-details-location-label">Landmark</span>
                <p>{hostel.landmark || 'Landmark not provided'}</p>
              </div>
              <div>
                <span className="room-details-location-label">Distance from STU</span>
                <p>
                  {hostel.distanceKm !== undefined
                    ? `Approximately ${hostel.distanceKm} km away`
                    : 'Distance information not provided'}
                </p>
              </div>
            </div>
          </section>

          {relatedRooms.length > 0 && (
            <section className="room-details-section">
              <h3 className="room-details-section-title">Other rooms at {hostel.name}</h3>
              <div className="room-details-related-rooms">
                {relatedRooms.map((relatedRoom) => (
                  <Link
                    key={relatedRoom.id}
                    to={`/findroom/rooms/${relatedRoom.id}`}
                    className="room-details-related-card"
                  >
                    <div className="room-details-related-card-top">
                      <strong>{relatedRoom.name}</strong>
                      <PriceDisplay price={relatedRoom.pricePerYear} />
                    </div>
                    <div className="room-details-related-card-meta">
                      <span>{relatedRoom.availableUnits}/{relatedRoom.totalUnits} available</span>
                      <span>{relatedRoom.facilities.slice(0, 2).join(' • ') || 'Essential amenities'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {showEnquiryModal && (
        <div className="room-details-modal-backdrop" onClick={closeEnquiryModal}>
          <div className="room-details-modal" role="dialog" aria-modal="true" aria-labelledby="room-details-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="room-details-modal-header">
              <div>
                <p className="room-details-modal-kicker">You’re interested! 🥰</p>
                <h3 id="room-details-modal-title" className="room-details-modal-title">Tell Dabi a little about yourself</h3>
              </div>
              <button type="button" className="room-details-modal-close" onClick={closeEnquiryModal} aria-label="Close enquiry form">
                ×
              </button>
            </div>

            {enquirySubmitted ? (
              <div className="room-details-modal-success">
                <div className="room-details-success-badge">You can relax now. 😌</div>
                <h4 className="room-details-success-title">We’ve got your interest.</h4>
                <p className="room-details-success-text">
                  Dabi has received your enquiry for the <strong>{room.name}</strong> at <strong>{hostel.name}</strong>.
                </p>
                <div className="room-details-success-summary">
                  <div>
                    <span>Room</span>
                    <strong>{room.name}</strong>
                  </div>
                  <div>
                    <span>Hostel</span>
                    <strong>{hostel.name}</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{hostel.location}</strong>
                  </div>
                </div>
                <div className="room-details-timeline">
                  <div className="room-details-timeline-step room-details-timeline-step-done">
                    <span>01</span>
                    <div>
                      <strong>Dabi receives your enquiry</strong>
                      <p>We’ve got your request.</p>
                    </div>
                  </div>
                  <div className="room-details-timeline-step">
                    <span>02</span>
                    <div>
                      <strong>We check the room</strong>
                      <p>Dabi will confirm availability with the hostel.</p>
                    </div>
                  </div>
                  <div className="room-details-timeline-step">
                    <span>03</span>
                    <div>
                      <strong>We connect you</strong>
                      <p>If it’s available, Dabi will help with the next step.</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="room-details-modal-action" onClick={closeEnquiryModal}>
                  Back to rooms
                </button>
              </div>
            ) : (
              <form className="room-details-form" onSubmit={handleEnquirySubmit}>
                <div className="room-details-form-summary">
                  <div className="room-details-form-summary-row">
                    <span>Room</span>
                    <strong>{room.name}</strong>
                  </div>
                  <div className="room-details-form-summary-row">
                    <span>Hostel</span>
                    <strong>{hostel.name}</strong>
                  </div>
                  <div className="room-details-form-summary-row">
                    <span>Price</span>
                    <strong><PriceDisplay price={room.pricePerYear} /></strong>
                  </div>
                  <div className="room-details-form-summary-row">
                    <span>Location</span>
                    <strong>{hostel.location}</strong>
                  </div>
                </div>

                <div className="room-details-reassurance">
                  <strong>Don’t worry, this isn’t a booking. 😌</strong>
                  <span>You’re simply letting Dabi know you’re interested. We’ll help with the next step.</span>
                </div>

                {enquiryError && (
                  <div className="room-details-form-error" role="alert">
                    {enquiryError}
                  </div>
                )}

                <div className="room-details-form-grid">
                  <label className="room-details-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={enquiryForm.name}
                      onChange={(event) => handleEnquiryChange('name', event.target.value)}
                      placeholder="What should we call you?"
                    />
                  </label>

                  <label className="room-details-field">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={(event) => handleEnquiryChange('phone', event.target.value)}
                      placeholder="024 XXX XXXX"
                    />
                  </label>

                  <label className="room-details-field">
                    <span>School</span>
                    <input
                      type="text"
                      value={enquiryForm.school}
                      onChange={(event) => handleEnquiryChange('school', event.target.value)}
                      placeholder="e.g. Sunyani Technical University"
                    />
                  </label>

                  <label className="room-details-field">
                    <span>When are you hoping to move in?</span>
                    <input
                      type="date"
                      value={enquiryForm.moveInDate}
                      onChange={(event) => handleEnquiryChange('moveInDate', event.target.value)}
                    />
                  </label>

                  <label className="room-details-field room-details-field-full">
                    <span>Anything you’d like us to know?</span>
                    <textarea
                      rows={4}
                      value={enquiryForm.message}
                      onChange={(event) => handleEnquiryChange('message', event.target.value)}
                      placeholder="e.g. I’d like to know if the room has an ensuite washroom..."
                    />
                  </label>
                </div>

                <button type="submit" className="room-details-modal-action" disabled={enquirySubmitting}>
                  {enquirySubmitting && <span className="room-details-spinner" aria-hidden="true" />}
                  <span>{enquirySubmitting ? 'Sending it to Dabi…' : 'Send My Enquiry 🫶🏽'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </FindRoomShell>
  );
}
