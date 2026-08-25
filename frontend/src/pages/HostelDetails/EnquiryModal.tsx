import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { RoomType } from "../../data/hostelDetails";
import { bedsHint } from "../../data/hostelDetails";
import { createEnquiry } from "../../services/api";
import {
  IconClose,
  IconCheck,
  IconPhone,
  IconCalendar,
  IconBed,
  IconArrow,
} from "../../components/Icons/Icons";
import styles from "./HostelDetails.module.css";

interface EnquiryModalProps {
  hostelId: string;
  hostelName: string;
  roomTypes: RoomType[];
  onClose: () => void;
}

const availClass = {
  Available: styles.availAvailable,
  Limited: styles.availLimited,
  Full: styles.availFull,
} as const;

function formatPrice(value: number) {
  return `GH₵${value.toLocaleString("en-GH")}`;
}

function firstAvailableId(rooms: RoomType[]): string {
  return (rooms.find((r) => r.availability !== "Full") ?? rooms[0])?.id ?? "";
}

export default function EnquiryModal({ hostelId, hostelName, roomTypes, onClose }: EnquiryModalProps) {
  const [submittedAs, setSubmittedAs] = useState<"enquiry" | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState(() => firstAvailableId(roomTypes));
  const [submittedRoom, setSubmittedRoom] = useState<RoomType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const availableCount = useMemo(
    () => roomTypes.filter((r) => r.availability !== "Full").length,
    [roomTypes],
  );

  function selectedRoom(): RoomType | undefined {
    return roomTypes.find((r) => r.id === selectedRoomId);
  }

  function handleEnquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const room = selectedRoom();
    setSubmitting(true);
    setError(null);
    createEnquiry({
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      school: data.get("school") ? String(data.get("school")) : undefined,
      hostelId,
      hostelName,
      roomType: room?.name,
      moveInDate: data.get("moveIn") ? String(data.get("moveIn")) : undefined,
      message: data.get("message") ? String(data.get("message")) : undefined,
    })
      .then(() => {
        setSubmittedRoom(room ?? null);
        setSubmittedAs("enquiry");
      })
      .catch(() => setError("We couldn't send your enquiry. Please try again."))
      .finally(() => setSubmitting(false));
  }

  if (submittedAs) {
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Enquiry sent">
        <div className={`${styles.modal} ${styles.successModal}`}>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose size={22} />
          </button>
          <div className={styles.successHero}>
            <img
              className={styles.successIllustration}
              src="/illustrations/Welcome-5--Streamline-Brooklyn.png"
              alt="A friendly welcome illustration"
            />
            <span className={styles.successIcon}>
              <IconCheck size={30} />
            </span>
          </div>
          <h2 className={styles.modalTitle}>You&rsquo;re all set.</h2>
          <p className={styles.modalText}>
            Thanks for reaching out. Your enquiry about{" "}
            {submittedRoom ? `the ${submittedRoom.name} rooms` : ` ${hostelName}`} is on its way
            to the Dabi team, and we&rsquo;ll be in touch shortly to help with the next steps.
          </p>
          <Link to="/find-hostel" className="dabi-btn dabi-btn-primary" onClick={onClose}>
            Browse more hostels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Enquiry form">
      <div className={styles.modal}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          <IconClose size={22} />
        </button>
        <h2 className={styles.modalTitle}>Interested in {hostelName}?</h2>
        <p className={styles.modalText}>
          Tell us which room you&rsquo;re after and a Dabi representative will confirm live
          availability with the owner — then walk you to the hostel.
        </p>

        <div className={styles.availSummary}>
          <span className={`${styles.availDot} ${availableCount > 0 ? styles.summaryDotOn : styles.summaryDotOff}`} />
          {availableCount > 0
            ? `${availableCount} of ${roomTypes.length} room type${roomTypes.length === 1 ? "" : "s"} available now`
            : "Currently fully booked — we can suggest alternatives"}
        </div>

        <form ref={formRef} className={styles.form} onSubmit={handleEnquiry}>
          <fieldset className={styles.roomPicker}>
            <legend className={styles.roomPickerLegend}>Which room?</legend>
            <div className={styles.roomOptions}>
              {roomTypes.map((room) => {
                const isSelected = room.id === selectedRoomId;
                const isFull = room.availability === "Full";
                return (
                  <button
                    type="button"
                    key={room.id}
                    className={`${styles.roomOption} ${isSelected ? styles.roomOptionSelected : ""} ${
                      isFull ? styles.roomOptionDisabled : ""
                    }`}
                    aria-pressed={isSelected}
                    disabled={isFull}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <span className={styles.roomOptionHead}>
                      <span className={styles.roomOptionName}>{room.name}</span>
                      <span className={`${styles.avail} ${availClass[room.availability]}`}>
                        <span className={styles.availDot} />
                        {isFull ? "Full" : room.availability}
                      </span>
                    </span>
                    <span className={styles.roomOptionMeta}>
                      <span>
                        <IconBed size={14} /> {room.capacity} bed{room.capacity > 1 ? "s" : ""}
                      </span>
                      <span>{formatPrice(room.pricePerYear)} / yr</span>
                    </span>
                    {bedsHint(room) && <span className={styles.roomBeds}>{bedsHint(room)}</span>}
                    {isFull && (
                      <span className={styles.roomFullNote}>No beds free right now</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className={styles.field}>
            <label htmlFor="enq-name">Name</label>
            <input
              ref={firstField}
              id="enq-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your full name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="enq-phone">
              <IconPhone size={15} /> Phone number
            </label>
            <input
              id="enq-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="e.g. 024 000 0000"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="enq-school">School</label>
            <input
              id="enq-school"
              name="school"
              type="text"
              placeholder="e.g. Sunyani Technical University"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="enq-date">
              <IconCalendar size={15} /> Preferred move-in date
            </label>
            <input id="enq-date" name="moveIn" type="date" />
          </div>

          <div className={styles.field}>
            <label htmlFor="enq-message">Message</label>
            <textarea
              id="enq-message"
              name="message"
              rows={3}
              placeholder="Anything you'd like Dabi to know?"
            />
          </div>

          <button type="submit" className={`dabi-btn dabi-btn-primary ${styles.submit}`} disabled={submitting}>
            {submitting ? "Sending…" : "Send Enquiry"}
          </button>
          {error && <p className={styles.formError}>{error}</p>}
        </form>

        <Link to="/find-hostel" className={styles.modalCancel} onClick={onClose}>
          Cancel <IconArrow size={16} />
        </Link>
      </div>
    </div>
  );
}
