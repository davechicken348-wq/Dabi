import { formatPricePeriod } from '../../lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { formatGhanaCedi, getDabiFeeSummary } from '../../lib/pricing';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { ShareDialog } from '../components/ShareDialog/ShareDialog';
import { fetchHostels, fetchRooms } from '../../services/hostelService';
import { buildRoomShareUrl, generateRoomShareMessage } from '../../lib/sharing';
import { formatDistanceFromStu, getDistanceFromStu } from '../../lib/distance';
import { subscribeToStudentAlerts } from '../../services/api';
import { submitEnquiry } from '../../services/enquiryService';
import { buildEnquiryWhatsAppMessage, openWhatsAppWithMessage } from '../../lib/dabiContact';
import {
  getUnlockFee,
  isContactUnlocked,
  markRoomUnlocked,
  startUnlockPayment,
  verifyUnlockPayment,
  getContactDetails,
} from '../../services/contactUnlockService';
import type { ContactDetails } from '../../services/contactUnlockService';
import type { Hostel, RoomOption } from '../../types';
import { UnlockCheckout } from './UnlockCheckout';
import { UnlockSuccess } from './UnlockSuccess';
import { RoomDetailsMap } from './RoomDetailsMap';
import './RoomDetails.css';

const SAVED_KEY = 'dabi-saved-rooms';

function getSavedRoomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(SAVED_KEY);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

function roomLabel(room: RoomOption): string {
  return room.name.toLowerCase().includes('room') ? room.name : `${room.name} room`;
}

export default function RoomDetails() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [room, setRoom] = useState<RoomOption | null>(null);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [relatedRooms, setRelatedRooms] = useState<RoomOption[]>([]);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [unlockFee, setUnlockFee] = useState(5);
  const [unlockCurrency, setUnlockCurrency] = useState('GHS');
  const [unlocked, setUnlocked] = useState(false);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const verifyAttempted = useRef(false);

  // Enquiry (free path)
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [roomAlerts, setRoomAlerts] = useState(true);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', school: '', moveInDate: '', message: '' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchRooms(), fetchHostels(), getUnlockFee()])
      .then(([rooms, hostels, fee]) => {
        if (cancelled) return;
        const selected = rooms.find((candidate) => candidate.id === roomId);
        if (!selected) {
          setError('We could not find that room.');
          setLoading(false);
          return;
        }
        setRoom(selected);
        setHostel(hostels.find((candidate) => candidate.id === selected.hostelId) ?? null);
        setRelatedRooms(rooms.filter((candidate) => candidate.id !== selected.id && candidate.hostelId === selected.hostelId).slice(0, 6));
        setSaved(getSavedRoomIds().includes(selected.id));
        setUnlockFee(fee.fee);
        setUnlockCurrency(fee.currency);
        setLoading(false);

        const roomOfferingId = selected.roomOfferingId ?? selected.id;
        isContactUnlocked(roomOfferingId).then((alreadyUnlocked) => {
          if (cancelled) return;
          setUnlocked(alreadyUnlocked);
          if (alreadyUnlocked) {
            markRoomUnlocked(roomOfferingId);
            getContactDetails(roomOfferingId).then((c) => {
              if (!cancelled) setContact(c);
            }).catch(() => undefined);
          }
        });
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load this room.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [roomId]);

  useEffect(() => {
    const ref = searchParams.get('unlock_ref');
    if (!ref || verifyAttempted.current || !room) return;
    verifyAttempted.current = true;
    setVerifying(true);
    setSearchParams((prev) => { prev.delete('unlock_ref'); return prev; }, { replace: true });

    verifyUnlockPayment(ref)
      .then((result) => {
        if (result.status === 'paid' && result.contact) {
          const roomOfferingId = room?.roomOfferingId ?? room?.id;
          if (roomOfferingId) markRoomUnlocked(roomOfferingId);
          setUnlocked(true);
          setContact(result.contact);
          setSuccessOpen(true);
        } else {
          setUnlockError("Payment didn't go through. 😕 Don't worry — your room hasn't changed. You can try again.");
        }
      })
      .catch(() => {
        setUnlockError("We couldn't verify your payment. Please try again or contact Dabi.");
      })
      .finally(() => setVerifying(false));
  }, [room, searchParams, setSearchParams]);

  const toggleSaved = () => {
    if (!room) return;
    const current = getSavedRoomIds();
    const next = current.includes(room.id) ? current.filter((id) => id !== room.id) : [...current, room.id];
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('dabi-saved-rooms-changed'));
    setSaved(next.includes(room.id));
  };

  const handleUnlockPay = async (email: string) => {
    if (!room) return;
    const roomOfferingId = room.roomOfferingId ?? room.id;
    const result = await startUnlockPayment(roomOfferingId, email);
    window.location.href = result.authorizationUrl;
  };

  const updateEnquiryField = (field: keyof typeof enquiryForm, value: string) =>
    setEnquiryForm((prev) => ({ ...prev, [field]: value }));

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return;
    setEnquiryError('');
    setEnquirySubmitting(true);
    try {
      if (enquiryForm.email.trim() && roomAlerts) {
        await subscribeToStudentAlerts({
          email: enquiryForm.email.trim(),
          roomType: room.name,
          facilities: room.facilities,
          preferredArea: room.hostelLocation,
        }).catch(() => undefined);
      }
      await submitEnquiry({
        roomId: room.roomOfferingId ?? room.id,
        hostelId: room.hostelId,
        roomName: room.name,
        hostelName: room.hostelName ?? 'Dabi hostel',
        studentName: enquiryForm.name.trim(),
        phone: enquiryForm.phone.trim(),
        email: enquiryForm.email.trim() || undefined,
        school: enquiryForm.school.trim() || undefined,
        moveInDate: enquiryForm.moveInDate || undefined,
        message: enquiryForm.message.trim() || undefined,
      });
      setEnquirySent(true);
      const waMessage = buildEnquiryWhatsAppMessage({
        studentName: enquiryForm.name.trim(),
        phone: enquiryForm.phone.trim(),
        roomName: room.name,
        hostelName: room.hostelName ?? 'Hostel',
        hostelLocation: room.hostelLocation,
        pricePerYear: room.pricePerYear,
        pricingPeriod: room.pricingPeriod,
        school: enquiryForm.school.trim() || undefined,
        moveInDate: enquiryForm.moveInDate || undefined,
        message: enquiryForm.message.trim() || undefined,
        roomUrl: buildRoomShareUrl(room.id),
      });
      openWhatsAppWithMessage(waMessage);
    } catch {
      setEnquiryError('Could not send your enquiry. Please check your details and try again.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleViewContact = async () => {
    if (!room) return;
    const roomOfferingId = room.roomOfferingId ?? room.id;
    try {
      const c = await getContactDetails(roomOfferingId);
      setContact(c);
      setSuccessOpen(true);
    } catch {
      setUnlockError('Could not load contact details. Please try again.');
    }
  };

  if (loading) {
    return <FindRoomShell><div className="room-details-state">Loading room details...</div></FindRoomShell>;
  }

  if (error || !room) {
    return <FindRoomShell><ErrorState description={error ?? 'Room unavailable.'} /></FindRoomShell>;
  }

  const photos = room.photos.length > 0 ? room.photos : ['/placeholder-room.svg'];
  const availability = room.availableUnits > 0 ? `${room.availableUnits} available` : 'Currently full';
  const distanceLabel = formatDistanceFromStu(hostel ? getDistanceFromStu(hostel) : undefined);
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
    {
      name: room.hostelName ?? 'Hostel',
      location: room.hostelLocation ?? '',
      verified: false,
      photos: room.photos,
    },
    roomShareUrl,
  );

  return (
    <FindRoomShell>
      <article className="room-details-page">
        <header className="room-details-header">
          <Link className="room-details-back" to="/findroom/rooms">Back to rooms</Link>
          <div className="room-details-header-actions">
            <button className={`room-details-action ${saved ? 'active' : ''}`} type="button" onClick={toggleSaved} aria-pressed={saved}>
              {saved ? 'Saved' : 'Save room'}
            </button>
            <button className="room-details-action" type="button" onClick={() => setShareOpen(true)}>Share</button>
          </div>
        </header>

        <section className="room-details-gallery" aria-label={`${roomLabel(room)} photos`}>
          <div className="room-details-featured-photo">
            <button className="room-details-photo-btn" type="button" onClick={() => setLightboxIndex(0)} aria-label="View full image">
              <img src={photos[0]} alt={`${roomLabel(room)} at ${room.hostelName ?? 'hostel'}`} />
            </button>
          </div>
          <div className="room-details-photo-grid">
            {photos.slice(1, 5).map((photo, index) => (
              <button key={`${photo}-${index}`} className="room-details-photo-btn" type="button" onClick={() => setLightboxIndex(index + 1)} aria-label={`View full image ${index + 2}`}>
                <img src={photo} alt={`${roomLabel(room)} view ${index + 2}`} />
              </button>
            ))}
          </div>
        </section>

        {lightboxIndex !== null && (
          <div className="room-details-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightboxIndex(null)}>
            <button className="room-details-lightbox-close" type="button" onClick={() => setLightboxIndex(null)} aria-label="Close">✕</button>
            {photos.length > 1 && (
              <button className="room-details-lightbox-prev" type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length); }} aria-label="Previous">‹</button>
            )}
            <img src={photos[lightboxIndex]} alt={`${roomLabel(room)} photo ${lightboxIndex + 1}`} onClick={(e) => e.stopPropagation()} />
            {photos.length > 1 && (
              <button className="room-details-lightbox-next" type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length); }} aria-label="Next">›</button>
            )}
            <span className="room-details-lightbox-counter">{lightboxIndex + 1} / {photos.length}</span>
          </div>
        )}

        <div className="room-details-layout">
          <div className="room-details-main">
            <div className="room-details-eyebrow">{room.hostelLocation ?? 'Student living'} · {room.availabilityStatus ?? 'Available'}{distanceLabel ? ` · ${distanceLabel}` : ''}</div>
            <h1>{roomLabel(room)}</h1>
            <p className="room-details-hostel"><Link to={`/findroom/rooms?hostel=${encodeURIComponent(hostel?.slug ?? room.hostelSlug ?? room.hostelId)}`}>{room.hostelName ?? 'Dabi hostel'}</Link></p>
            {hostel?.description && <p className="room-details-hostel-description">{hostel.description}</p>}
            <p className="room-details-description">{room.description}</p>

            <section className="room-details-section" aria-labelledby="room-facts-title">
              <h2 id="room-facts-title">Room details</h2>
              <div className="room-details-facts">
                <div><strong>{room.occupancy}</strong><span>{room.occupancy === 1 ? 'person' : 'people'}</span></div>
                <div><strong>{room.totalUnits}</strong><span>total rooms</span></div>
                <div><strong>{availability}</strong><span>availability</span></div>
              </div>
            </section>

            <section className="room-details-section" aria-labelledby="room-facilities-title">
              <h2 id="room-facilities-title">What this room offers</h2>
              <div className="room-details-tags">
                {room.facilities.length > 0 ? room.facilities.map((facility) => <span key={facility}>{facility}</span>) : <span>Facilities to be confirmed</span>}
              </div>
            </section>

            {hostel && <RoomDetailsMap hostel={hostel} />}
          </div>

          <aside className="room-details-booking">
            <div className="room-details-price">
              <strong>{formatGhanaCedi(room.pricePerYear)}/{formatPricePeriod(room.pricingPeriod)}</strong>
              <div className="room-details-fee-breakdown">
                <span>Dabi agent fee (5%)</span>
                <strong>{formatGhanaCedi(getDabiFeeSummary(room.pricePerYear).fee)}</strong>
              </div>
              <div className="room-details-total-row">
                <span>Total you pay</span>
                <strong>{formatGhanaCedi(getDabiFeeSummary(room.pricePerYear).total)}</strong>
              </div>
              <small className="room-details-fee-note">Dabi's 5% agent fee covers finding the room, coordinating viewings, and supporting you through the process.</small>
              <div className="room-details-avail-badge" data-status={room.availabilityStatus ?? 'Available'}>
                {room.availabilityStatus === 'Full' ? '🔴 Currently full' : room.availabilityStatus === 'Limited' ? '🟡 Limited availability' : '🟢 Available'}
              </div>
            </div>

            <div className="room-details-unlock-section">
              <div className="room-details-unlock-heading">
                <p className="room-details-unlock-eyebrow">Found something you like? 👀</p>
                <h2>Get the owner's contact &amp; viewing details</h2>
                <p>Pay a small unlock fee to get the owner's contact and arrange a viewing directly.</p>
              </div>

              {verifying && (
                <div className="room-details-unlock-verifying" role="status" aria-live="polite">
                  Verifying your payment…
                </div>
              )}

              {unlockError && (
                <div className="room-details-unlock-error" role="alert">
                  <p>{unlockError}</p>
                  <button type="button" className="room-details-secondary" onClick={() => setUnlockError('')}>Try again</button>
                </div>
              )}

              {!verifying && !unlockError && (
                unlocked ? (
                  <div className="room-details-unlock-done">
                    <p className="room-details-unlock-done-label" aria-label="Contact unlocked">
                      <span aria-hidden="true">✓</span> Contact unlocked
                    </p>
                    <p className="room-details-unlock-done-sub">Welcome back. Your contact is already unlocked. 😊</p>
                    <button className="room-details-primary" type="button" onClick={handleViewContact}>
                      View Contact &amp; Viewing Details ✓
                    </button>
                  </div>
                ) : (
                  <div className="room-details-unlock-cta">
                    <button
                      className="room-details-unlock-btn"
                      type="button"
                      onClick={() => setCheckoutOpen(true)}
                    >
                      Get Contact &amp; Viewing Details — GH₵{unlockFee}
                    </button>
                    <p className="room-details-unlock-disclaimer">
                      <span aria-hidden="true">🔒</span> This unlock fee gives you access to the owner's contact and viewing details. It does not reserve the room.
                    </p>
                  </div>
                )
              )}

              {/* ── Free path divider ── */}
              {!unlocked && !verifying && (
                <>
                  <div className="room-details-or-divider" aria-hidden="true">
                    <span>or</span>
                  </div>

                  {enquirySent ? (
                    <div className="room-details-enquiry-success" role="status">
                      <strong>Enquiry sent. 🫶🏽</strong>
                      <p>Dabi has your details and will be in touch to help you take the next step.</p>
                      <button className="room-details-secondary" type="button" onClick={() => { setEnquirySent(false); setEnquiryOpen(false); }}>Send another</button>
                    </div>
                  ) : enquiryOpen ? (
                    <>
                      <div className="room-details-enquiry-heading">
                        <h2>Let Dabi help you 🫶🏽</h2>
                        <p>Dabi acts as your agent — we contact the owner, coordinate the viewing, and guide you through the process. A <strong>5% agent fee</strong> ({formatGhanaCedi(getDabiFeeSummary(room.pricePerYear).fee)}) applies on top of the room price if you proceed.</p>
                      </div>
                      <form className="room-details-enquiry-form" onSubmit={handleEnquirySubmit}>
                        {enquiryError && <div className="room-details-enquiry-error" role="alert">{enquiryError}</div>}
                        <label><span>Full name</span><input type="text" value={enquiryForm.name} onChange={(e) => updateEnquiryField('name', e.target.value)} placeholder="What should we call you?" required /></label>
                        <label><span>Phone number</span><input type="tel" value={enquiryForm.phone} onChange={(e) => updateEnquiryField('phone', e.target.value)} placeholder="024 XXX XXXX" required /></label>
                        <label><span>Email <em>Optional</em></span><input type="email" value={enquiryForm.email} onChange={(e) => updateEnquiryField('email', e.target.value)} placeholder="you@example.com" /></label>
                        <label className="room-details-alert-consent"><input type="checkbox" checked={roomAlerts} onChange={(e) => setRoomAlerts(e.target.checked)} /><span>Alert me when Dabi adds new rooms.</span></label>
                        <label><span>School <em>Optional</em></span><input type="text" value={enquiryForm.school} onChange={(e) => updateEnquiryField('school', e.target.value)} placeholder="Your school or workplace" /></label>
                        <label><span>Move-in date <em>Optional</em></span><input type="date" value={enquiryForm.moveInDate} onChange={(e) => updateEnquiryField('moveInDate', e.target.value)} /></label>
                        <label><span>Message <em>Optional</em></span><textarea rows={3} value={enquiryForm.message} onChange={(e) => updateEnquiryField('message', e.target.value)} placeholder="Any questions for Dabi?" /></label>
                        <button className="room-details-primary" type="submit" disabled={enquirySubmitting}>{enquirySubmitting ? 'Sending…' : 'Send to Dabi'}</button>
                        <button className="room-details-secondary" type="button" onClick={() => setEnquiryOpen(false)}>Cancel</button>
                      </form>
                    </>
                  ) : (
                    <button className="room-details-agent-btn" type="button" onClick={() => setEnquiryOpen(true)}>
                      Use Dabi as my agent — 5% fee on move-in
                    </button>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>

        {relatedRooms.length > 0 && (
          <section className="room-details-related" aria-labelledby="related-rooms-title">
            <h2 id="related-rooms-title">More rooms at this hostel</h2>
            <div className="room-details-related-grid">
              {relatedRooms.map((relatedRoom) => <RoomCard key={relatedRoom.id} room={relatedRoom} />)}
            </div>
          </section>
        )}

        <ShareDialog
          open={shareOpen}
          title={`${room.name} at ${room.hostelName ?? 'Hostel'}`}
          shareText={roomShareText}
          shareUrl={roomShareUrl}
          onClose={() => setShareOpen(false)}
        />

        {checkoutOpen && (
          <UnlockCheckout
            room={room}
            unlockFee={unlockFee}
            currency={unlockCurrency}
            onPay={handleUnlockPay}
            onCancel={() => setCheckoutOpen(false)}
          />
        )}

        {successOpen && contact && (
          <UnlockSuccess
            contact={contact}
            onClose={() => setSuccessOpen(false)}
          />
        )}
      </article>
    </FindRoomShell>
  );
}
