import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { RoomCard } from '../components/RoomCard/RoomCard';
import { ShareDialog } from '../components/ShareDialog/ShareDialog';
import { fetchHostels, fetchRooms } from '../../services/hostelService';
import { submitEnquiry } from '../../services/enquiryService';
import { buildRoomShareUrl, generateRoomShareMessage } from '../../lib/sharing';
import { formatDistanceFromStu, getDistanceFromStu } from '../../lib/distance';
import type { Hostel } from '../../types';
import type { RoomOption } from '../../types';
import { EnquirySuccessDialog } from './EnquirySuccessDialog';
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

function formatPrice(room: RoomOption): string {
  const period = room.pricingPeriod === 'Month' ? 'month' : room.pricingPeriod === 'Semester' ? 'semester' : 'academic year';
  return `GHS ${room.pricePerYear.toLocaleString()} / ${period}`;
}

function roomLabel(room: RoomOption): string {
  return room.name.toLowerCase().includes('room') ? room.name : `${room.name} room`;
}

export default function RoomDetails() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomOption | null>(null);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [relatedRooms, setRelatedRooms] = useState<RoomOption[]>([]);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryDialogOpen, setEnquiryDialogOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    school: '',
    moveInDate: '',
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchRooms(), fetchHostels()])
      .then(([rooms, hostels]) => {
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
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load this room.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [roomId]);

  const toggleSaved = () => {
    if (!room) return;
    const current = getSavedRoomIds();
    const next = current.includes(room.id) ? current.filter((id) => id !== room.id) : [...current, room.id];
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('dabi-saved-rooms-changed'));
    setSaved(next.includes(room.id));
  };

  const updateEnquiryField = (field: keyof typeof enquiryForm, value: string) => {
    setEnquiryForm((current) => ({ ...current, [field]: value }));
  };

  const handleEnquirySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!room) return;
    const selectedRoom = room;
    setEnquiryError('');
    setEnquirySubmitting(true);

    try {
      await submitEnquiry({
        roomId: selectedRoom.id,
        hostelId: selectedRoom.hostelId,
        roomName: selectedRoom.name,
        hostelName: selectedRoom.hostelName ?? 'Dabi hostel',
        studentName: enquiryForm.name.trim(),
        phone: enquiryForm.phone.trim(),
        school: enquiryForm.school.trim() || undefined,
        moveInDate: enquiryForm.moveInDate || undefined,
        message: enquiryForm.message.trim() || undefined,
      });
      setEnquirySent(true);
      setEnquiryDialogOpen(true);
    } catch {
      setEnquiryError('We could not send your enquiry. Please check your details and try again.');
    } finally {
      setEnquirySubmitting(false);
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
          <div className="room-details-featured-photo"><img src={photos[0]} alt={`${roomLabel(room)} at ${room.hostelName ?? 'hostel'}`} /></div>
          <div className="room-details-photo-grid">
            {photos.slice(1, 5).map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${roomLabel(room)} view ${index + 2}`} />)}
          </div>
        </section>

        <div className="room-details-layout">
          <div className="room-details-main">
            <div className="room-details-eyebrow">{room.hostelLocation ?? 'Student living'} · {room.availabilityStatus ?? 'Available'}{distanceLabel ? ` · ${distanceLabel}` : ''}</div>
            <h1>{roomLabel(room)}</h1>
            <p className="room-details-hostel"><Link to={`/findroom/rooms?hostel=${room.hostelId}`}>{room.hostelName ?? 'Dabi hostel'}</Link></p>
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
            {enquirySent ? (
              <div className="room-details-enquiry-success" role="status">
                <strong>Enquiry sent.</strong>
                <p>Dabi has received your request for this room. We will be in touch with the next steps.</p>
                <button className="room-details-secondary" type="button" onClick={() => setEnquirySent(false)}>Send another enquiry</button>
              </div>
            ) : (
              <>
                <div className="room-details-price"><strong>{formatPrice(room)}</strong><span>Clear pricing, no hidden fees</span></div>
                <div className="room-details-enquiry-heading">
                  <h2>Interested in this room?</h2>
                  <p>Share your details and Dabi will help with availability and viewing times.</p>
                </div>
                <form className="room-details-enquiry-form" onSubmit={handleEnquirySubmit}>
                  {enquiryError && <div className="room-details-enquiry-error" role="alert">{enquiryError}</div>}
                  <label><span>Full name</span><input type="text" value={enquiryForm.name} onChange={(event) => updateEnquiryField('name', event.target.value)} placeholder="What should we call you?" required /></label>
                  <label><span>Phone number</span><input type="tel" value={enquiryForm.phone} onChange={(event) => updateEnquiryField('phone', event.target.value)} placeholder="024 XXX XXXX" required /></label>
                  <label><span>School <em>Optional</em></span><input type="text" value={enquiryForm.school} onChange={(event) => updateEnquiryField('school', event.target.value)} placeholder="Your school or workplace" /></label>
                  <label><span>Preferred move-in date <em>Optional</em></span><input type="date" value={enquiryForm.moveInDate} onChange={(event) => updateEnquiryField('moveInDate', event.target.value)} /></label>
                  <label><span>Message <em>Optional</em></span><textarea rows={3} value={enquiryForm.message} onChange={(event) => updateEnquiryField('message', event.target.value)} placeholder="Ask about viewing times or anything else..." /></label>
                  <button className="room-details-primary" type="submit" disabled={enquirySubmitting}>{enquirySubmitting ? 'Sending enquiry...' : 'Send enquiry'}</button>
                </form>
                <p>This is not a booking. Dabi will help you take the next step.</p>
              </>
            )}
          </aside>
        </div>

        {relatedRooms.length > 0 && <section className="room-details-related" aria-labelledby="related-rooms-title"><h2 id="related-rooms-title">More rooms at this hostel</h2><div className="room-details-related-grid">{relatedRooms.map((relatedRoom) => <RoomCard key={relatedRoom.id} room={relatedRoom} />)}</div></section>}
        <ShareDialog
          open={shareOpen}
          title={`${room.name} at ${room.hostelName ?? 'Hostel'}`}
          shareText={roomShareText}
          shareUrl={roomShareUrl}
          onClose={() => setShareOpen(false)}
        />
        <EnquirySuccessDialog
          open={enquiryDialogOpen}
          roomName={roomLabel(room)}
          hostelName={room.hostelName ?? 'Dabi hostel'}
          onClose={() => setEnquiryDialogOpen(false)}
        />
      </article>
    </FindRoomShell>
  );
}