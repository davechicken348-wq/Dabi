import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import HostelCard from "../../components/HostelCard/HostelCard";
import VerificationBadge from "../../components/VerificationBadge/VerificationBadge";
import {
  IconPin,
  IconBed,
  IconCheck,
  IconClose,
  IconShield,
  IconMap,
} from "../../components/Icons/Icons";
import { FacilityGlyph } from "../../services/facilityIcons";
import { useFacilities } from "../../context/FacilitiesContext";
import { fetchHostel, fetchHostels } from "../../services/api";
import type { AdminHostel } from "../../admin/types";
import { usePolling } from "../../admin/usePolling";
import LiveControls from "../../admin/components/LiveControls";
import type { Hostel } from "../../data/hostels";
import type { HostelDetail, Facility, GalleryImage, RoomType } from "../../data/hostelDetails";
import { areaCoords, haversineKm } from "../../data/geo";
import { useSchool } from "../../context/SchoolContext";
import HostelLocationMap from "../../components/HostelLocationMap/HostelLocationMap";
import Gallery from "./Gallery";
import Lightbox from "./Lightbox";
import EnquiryModal from "./EnquiryModal";
import styles from "./HostelDetails.module.css";

const availabilityClass = {
  Available: styles.availAvailable,
  Limited: styles.availLimited,
  Full: styles.availFull,
} as const;

const FALLBACK_IMAGE = "/images/dorm2.webp";

function roomCapacityOf(name: string): number {
  const m = name.match(/(\d+)\s*-?\s*in\s*-?\s*1/i);
  const n = m ? parseInt(m[1], 10) : 1;
  return n >= 1 ? n : 1;
}

function toHostelDetail(
  h: AdminHostel,
  get: (key: string) => Facility | undefined,
): HostelDetail {
  const cover = h.image || FALLBACK_IMAGE;
  const area = h.location.split(",")[0].trim() || h.location;
  const fallback = areaCoords(area);
  const lat = h.latitude ?? fallback?.[0];
  const lng = h.longitude ?? fallback?.[1];
  const facilities: Facility[] = h.facilities.map((id) => {
    const f = get(id);
    return {
      id,
      label: f?.label ?? id.charAt(0).toUpperCase() + id.slice(1),
      iconKey: f?.iconKey ?? null,
      category: f?.category ?? null,
    };
  });
  const gallerySources = h.photos && h.photos.length ? h.photos : [cover];
  const images: GalleryImage[] = gallerySources.map((src, i) => ({
    id: `${h.id}-${i}`,
    src,
    alt: i === 0 ? `${h.name} cover photo` : `${h.name} photo ${i + 1}`,
    category: i === 0 ? "Cover" : "Photo",
  }));
  const roomTypes: RoomType[] = [
    {
      id: h.roomType || "standard",
      name: h.roomType,
      pricePerYear: h.pricePerYear,
      capacity: roomCapacityOf(h.roomType),
      availability: h.availability,
      totalBeds: h.totalBeds,
      availableBeds: h.availableBeds,
    },
  ];
  return {
    id: h.id,
    name: h.name,
    location: h.location,
    area,
    distanceFromSTU: h.distanceFromSTU != null ? `${h.distanceFromSTU} km` : "—",
    lat,
    lng,
    verified: h.verified,
    lastVerified: h.createdAt,
    availability: h.availability,
    totalBeds: h.totalBeds,
    availableBeds: h.availableBeds,
    lastChecked: "Recently",
    description:
      h.note ??
      `A student hostel in ${area}, listed on Dabi. Reach out to the owner to confirm rooms, price and availability.`,
    facilities,
    roomTypes,
    images,
    coverImage: cover,
    pricePerYear: h.pricePerYear,
    roomTypeSummary: h.roomType,
  };
}

function FacilityIcon({ iconKey }: { iconKey?: string | null }) {
  return <FacilityGlyph iconKey={iconKey} size={20} />;
}

function groupFacilities(list: Facility[]): { category: string; items: Facility[] }[] {
  const order: string[] = [];
  const map = new Map<string, Facility[]>();
  for (const f of list) {
    const cat = f.category?.trim() || "Other";
    if (!map.has(cat)) {
      map.set(cat, []);
      order.push(cat);
    }
    map.get(cat)!.push(f);
  }
  return order.map((category) => ({ category, items: map.get(category)! }));
}

function formatPrice(value: number) {
  return `GH₵${value.toLocaleString("en-GH")}`;
}

export default function HostelDetails() {
  const { id } = useParams();
  const { school } = useSchool();
  const { get } = useFacilities();
  const [detail, setDetail] = useState<HostelDetail | null>(null);
  const [similar, setSimilar] = useState<Hostel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  function handleInterested() {
    if (liveHostAvail === "Full") {
      setFullOpen(true);
    } else {
      setEnquiryOpen(true);
    }
  }

  function loadHostel(showLoading = true) {
    if (!id) {
      setStatus("notfound");
      return;
    }
    if (showLoading) setStatus("loading");
    Promise.all([fetchHostel(id), fetchHostels().catch(() => [])])
      .then(([h, all]) => {
        setDetail(toHostelDetail(h, get));
        setSimilar(all.filter((x) => x.id !== h.id).slice(0, 3));
        setLastUpdated(new Date());
        setStatus("ready");
      })
      .catch(() => {
        if (showLoading) setStatus("notfound");
      });
  }

  const isLoading = status === "loading";

  usePolling(() => loadHostel(false));
  useEffect(() => {
    loadHostel();
  }, [id]);

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className={styles.notFound}>
          <h1>Loading hostel…</h1>
          <p>Finding the details you asked for.</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <Navbar />
        <main className={styles.notFound}>
          <img
            className={styles.notFoundIllustration}
            src="/illustrations/Page-Not-Found-1--Streamline-New-York.png"
            alt="Illustration of a missing page"
          />
          <h1>We can&rsquo;t find that hostel</h1>
          <p>
            The listing you&rsquo;re looking for isn&rsquo;t here &mdash; it may have moved, been
            updated, or removed. Let&rsquo;s get you back to browsing.
          </p>
          <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
            Browse hostels
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prevImage = () =>
    setLightbox((i) => (i === null ? i : (i - 1 + detail.images.length) % detail.images.length));
  const nextImage = () =>
    setLightbox((i) => (i === null ? i : (i + 1) % detail.images.length));

  const hasCoords = detail.lat != null && detail.lng != null;
  const distanceKm = hasCoords
    ? haversineKm(detail.lat!, detail.lng!, school.lat, school.lng)
    : null;
  const distanceLabel =
    distanceKm != null ? `${distanceKm.toFixed(1)} km (straight line)` : detail.distanceFromSTU;

  const liveRooms: RoomType[] = detail.roomTypes;
  const liveHostAvail = detail.availability;

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className="dabi-container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/find-hostel">Find a Hostel</Link>
            <span aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent}>{detail.name}</span>
          </nav>

          <Gallery images={detail.images} onOpen={openLightbox} />

          <header className={styles.identity}>
            <div>
              <h1 className={styles.name}>{detail.name}</h1>
              <div className={styles.identityMeta}>
                <span className={styles.metaItem}>
                  <IconPin size={18} className={styles.metaIcon} /> {detail.location}
                </span>
                <span className={styles.metaItem}>
                  Approximately {distanceLabel} from {school.short}
                </span>
              </div>
            </div>
            <div className={styles.identityActions}>
              <LiveControls
                lastUpdated={lastUpdated}
                loading={isLoading}
                onRefresh={() => loadHostel()}
              />
              {detail.verified && <VerificationBadge />}
            </div>
          </header>

          <section className={styles.priceStrip} aria-label="Price and availability">
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Price</span>
              <span className={styles.priceValue}>
                {formatPrice(detail.pricePerYear)} <small>/ year</small>
              </span>
              <span className={styles.priceRoom}>{detail.roomTypeSummary}</span>
            </div>
            <div className={styles.availBlock}>
              <span className={`${styles.avail} ${availabilityClass[liveHostAvail]}`}>
                <span className={styles.availDot} />
                {liveHostAvail === "Available"
                  ? "Available"
                  : liveHostAvail === "Limited"
                    ? "Limited availability"
                    : "Currently full"}
              </span>
              <span className={styles.lastChecked}>
                {detail.totalBeds != null && detail.availableBeds != null
                  ? `${detail.availableBeds} of ${detail.totalBeds} beds free`
                  : `Availability last checked: ${detail.lastChecked}`}
              </span>
            </div>
          </section>

          <div className={styles.layout}>
            <div className={styles.content}>
              <section className={styles.block}>
                <h2 className={styles.blockTitle}>About this hostel</h2>
                <p className={styles.prose}>{detail.description}</p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockTitle}>What this hostel offers</h2>
                {groupFacilities(detail.facilities).map((group) => (
                  <div key={group.category} className={styles.facilityGroup}>
                    <h3 className={styles.facilityGroupTitle}>{group.category}</h3>
                    <ul className={styles.facilities}>
                      {group.items.map((f) => (
                        <li key={f.id} className={styles.facility}>
                          <span className={styles.facilityIcon}>
                            <FacilityIcon iconKey={f.iconKey} />
                          </span>
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              {detail.roomTypes.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockTitle}>Rooms</h2>
                  <div className={styles.rooms}>
                    {liveRooms.map((r) => (
                      <div key={r.id} className={styles.roomCard}>
                        <div className={styles.roomHead}>
                          <h3 className={styles.roomName}>{r.name}</h3>
                          <span className={`${styles.avail} ${availabilityClass[r.availability]}`}>
                            <span className={styles.availDot} />
                            {r.availability}
                          </span>
                        </div>
                        <p className={styles.roomPrice}>{formatPrice(r.pricePerYear)} / year</p>
                        <p className={styles.roomCap}>
                          <IconBed size={16} /> {r.capacity} student{r.capacity > 1 ? "s" : ""}
                        </p>
                        {r.totalBeds != null && r.availableBeds != null && (
                          <p className={styles.roomBeds}>
                            {r.availableBeds} of {r.totalBeds} beds free
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className={styles.block}>
                <div className={styles.locationHeader}>
                  <img
                    className={styles.locationIllustration}
                    src="/illustrations/Travel--Streamline-Manchester.png"
                    alt="Illustration of travel and directions"
                  />
                  <h2 className={styles.blockTitle}>Where is it?</h2>
                </div>

                <div className={styles.locationGrid}>
                  <div className={styles.locationCard}>
                    <span className={styles.locationLabel}>
                      <IconPin size={14} /> Area
                    </span>
                    <span className={styles.locationValue}>{detail.area}</span>
                  </div>
                  <div className={styles.locationCard}>
                    <span className={styles.locationLabel}>
                      <IconPin size={14} /> Town
                    </span>
                    <span className={styles.locationValue}>{detail.location}</span>
                  </div>
                  <div className={styles.locationCard}>
                    <span className={styles.locationLabel}>
                      <IconMap size={14} /> From {school.short}
                    </span>
                    <span className={styles.locationValue}>{distanceLabel}</span>
                  </div>
                </div>

                {hasCoords ? (
                  <HostelLocationMap
                    key={`${school.id}-${detail.id}`}
                    hostelName={detail.name}
                    hostelLat={detail.lat as number}
                    hostelLng={detail.lng as number}
                    schoolName={school.name}
                    schoolLat={school.lat}
                    schoolLng={school.lng}
                  />
                ) : (
                  <div className={styles.map}>
                    <div className={styles.mapPin} aria-hidden="true">
                      <IconMap size={26} />
                      <span className={styles.mapLabel}>{detail.area}</span>
                    </div>
                    <div className={styles.mapStu} aria-hidden="true">
                      <IconMap size={22} />
                      <span className={styles.mapLabel}>{school.short}</span>
                    </div>
                    <span className={styles.mapRoute} aria-hidden="true" />
                    <span className={styles.mapDistance}>{distanceLabel}</span>
                  </div>
                )}

                <p className={styles.locationNote}>
                  Approximately {distanceLabel} from {school.name}
                  {school.id === "stu" ? " (STU)" : ""}.
                </p>
              </section>

              <section className={`${styles.block} ${styles.verifyBlock}`}>
                <span className="dabi-eyebrow">Trust</span>
                <h2 className={styles.blockTitle}>
                  <IconShield size={24} className={styles.verifyIcon} /> Dabi Verified
                </h2>
                <p className={styles.prose}>
                  This listing has been visited or checked by the Dabi team.
                </p>
                <ul className={styles.verifyList}>
                  <li>
                    <IconCheck size={18} /> Location checked
                  </li>
                  <li>
                    <IconCheck size={18} /> Photos collected
                  </li>
                  <li>
                    <IconCheck size={18} /> Price confirmed
                  </li>
                  <li>
                    <IconCheck size={18} /> Availability checked
                  </li>
                </ul>
                <p className={styles.lastVerified}>
                  Last verified:{" "}
                  {new Date(detail.lastVerified).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </section>

              <section className={`${styles.block} ${styles.infoBlock}`}>
                <h2 className={styles.blockTitle}>Before you enquire</h2>
                <ul className={styles.infoList}>
                  <li>Prices may change.</li>
                  <li>Availability is subject to confirmation.</li>
                  <li>Students should inspect the hostel before making payment.</li>
                  <li>Dabi should not be assumed to be the hostel owner unless explicitly stated.</li>
                  <li>Do not send money to anyone claiming to represent Dabi without confirmation.</li>
                </ul>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.enquiryCard}>
                <span className={styles.enquiryPrice}>
                  {formatPrice(detail.pricePerYear)} <small>/ year</small>
                </span>
                <span className={styles.enquiryRoom}>{detail.roomTypeSummary}</span>
                <span className={`${styles.avail} ${availabilityClass[liveHostAvail]}`}>
                  <span className={styles.availDot} />
                  {liveHostAvail === "Available"
                    ? "Available"
                    : liveHostAvail === "Limited"
                      ? "Limited availability"
                      : "Currently full"}
                </span>
                {detail.verified && <VerificationBadge />}
                <button
                  type="button"
                  className="dabi-btn dabi-btn-primary"
                  onClick={handleInterested}
                >
                  I&rsquo;m Interested
                </button>
                <p className={styles.enquiryNote}>
                  We&rsquo;ll help connect you with the hostel owner.
                </p>
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <section className={styles.similar}>
              <h2 className={styles.blockTitle}>You might also like</h2>
              <div className={styles.similarGrid}>
                {similar.map((h) => (
                  <HostelCard key={h.id} hostel={h} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className={styles.mobileBar}>
        <span className={styles.mobilePrice}>
          {formatPrice(detail.pricePerYear)} <small>/ year</small>
        </span>
        <button
          type="button"
          className="dabi-btn dabi-btn-primary"
          onClick={handleInterested}
        >
          I&rsquo;m Interested
        </button>
      </div>

      <Footer />

      {lightbox !== null && (
        <Lightbox
          images={detail.images}
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

        {enquiryOpen && (
          <EnquiryModal
            hostelId={detail.id}
            hostelName={detail.name}
            roomTypes={liveRooms}
            onClose={() => setEnquiryOpen(false)}
          />
        )}

        {fullOpen && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Hostel full">
            <div className={`${styles.modal} ${styles.successModal}`}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setFullOpen(false)}
                aria-label="Close"
              >
                <IconClose size={22} />
              </button>
              <div className={styles.successHero}>
                <img
                  className={styles.successIllustration}
                  src="/illustrations/Post-It-3--Streamline-Brooklyn.png"
                  alt="A post-it note illustration"
                />
                <span className={styles.successIcon}>
                  <IconCheck size={30} />
                </span>
              </div>
              <h2 className={styles.modalTitle}>This hostel is fully booked</h2>
              <p className={styles.modalText}>
                Every bed at <strong>{detail.name}</strong> is currently taken. Leave your details
                and we&rsquo;ll let you know the moment a room opens up &mdash; or we can point you
                to similar hostels nearby.
              </p>
              <button
                type="button"
                className="dabi-btn dabi-btn-primary"
                onClick={() => setFullOpen(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}
    </>
  );
}
