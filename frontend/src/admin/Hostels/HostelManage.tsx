import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactEventHandler } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchHostel,
  fetchHostels,
  fetchOwners,
  createHostel,
  updateHostel,
  uploadHostelImage,
  type HostelInput,
} from "../../services/api";
import type { Owner, Availability, AdminHostel } from "../types";
import type { Hostel } from "../../data/hostels";
import { useFacilities } from "../../context/FacilitiesContext";
import { FacilityGlyph } from "../../services/facilityIcons";
import LocationPicker from "../../components/LocationPicker/LocationPicker";
import { getSchool } from "../../data/geo";
import Badge from "../components/Badge";
import {
  IconChevronLeft,
  IconCheck,
  IconTrash,
  IconStar,
  IconShield,
  IconBed,
  IconImages,
  IconUser,
  IconEye,
  IconUpload,
  IconRefresh,
  IconSparkles,
  IconPhone,
  IconMail,
  IconMap,
  IconTag,
} from "../../components/Icons/Icons";

import styles from "./HostelManage.module.css";

import fallbackImage from "../../assets/images/camera.avif";

const FALLBACK_IMAGE = fallbackImage;

const AVAILABILITY: { id: Availability; label: string; color: string; desc: string }[] = [
  {
    id: "Available",
    label: "Available",
    color: "#1f8a55",
    desc: "Rooms are open — students can enquire right now.",
  },
  {
    id: "Limited",
    label: "Limited",
    color: "#c98a0a",
    desc: "Only a few spaces left. Act fast.",
  },
  {
    id: "Full",
    label: "Full",
    color: "#b23b3b",
    desc: "No vacancies at the moment.",
  },
];

type VerifKey = "checkLoc" | "checkPhotos" | "checkPrice" | "checkAvail";

const VERIF_CHECKS: {
  key: VerifKey;
  label: string;
  desc: string;
  icon: typeof IconBed;
}[] = [
  { key: "checkLoc", label: "Location checked", desc: "Address & map pin confirmed.", icon: IconMap },
  { key: "checkPhotos", label: "Photos collected", desc: "Real images of the rooms on file.", icon: IconImages },
  { key: "checkPrice", label: "Price confirmed", desc: "Annual fee matches the owner.", icon: IconTag },
  { key: "checkAvail", label: "Availability confirmed", desc: "Current space status is accurate.", icon: IconCheck },
];

const ghs = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

type Tab = "place" | "rooms" | "facilities" | "photos" | "owner" | "verification" | "review";

type RoomOfferingDraft = {
  id: string;
  roomType: string;
  price: string;
  pricingPeriod: "AcademicYear" | "Semester" | "Month";
  bedsPerRoom: string;
  totalRooms: string;
  availableRooms: string;
  availability: Availability;
  description: string;
};

const ROOM_TYPE_OPTIONS = ["1-in-1", "2-in-1", "3-in-1", "4-in-1", "5-in-1", "Other"];

const TABS: { id: Tab; label: string; icon: typeof IconBed }[] = [
  { id: "place", label: "Place", icon: IconMap },
  { id: "rooms", label: "Rooms", icon: IconBed },
  { id: "facilities", label: "Facilities", icon: IconTag },
  { id: "photos", label: "Photos", icon: IconImages },
  { id: "owner", label: "Owner", icon: IconUser },
  { id: "verification", label: "Verification", icon: IconShield },
  { id: "review", label: "Review", icon: IconEye },
];

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function createEmptyRoomOffering(): RoomOfferingDraft {
  return {
    id: crypto.randomUUID(),
    roomType: "2-in-1",
    price: "",
    pricingPeriod: "AcademicYear",
    bedsPerRoom: "",
    totalRooms: "",
    availableRooms: "",
    availability: "Available",
    description: "",
  };
}

const STU = getSchool("stu");

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export default function HostelManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  // Folder used for uploaded images. Existing hostels use their real id;
  // new ones get a stable draft id so uploads stay grouped until saved.
  const [draftId] = useState(() => `temp-${crypto.randomUUID()}`);
  const imageFolder = id ?? draftId;

  const { facilities: facilityCatalog } = useFacilities();

  const [loading, setLoading] = useState(Boolean(id));
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tab, setTab] = useState<Tab>("place");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");
  const [roomOfferings, setRoomOfferings] = useState<RoomOfferingDraft[]>([createEmptyRoomOffering()]);
  const [availability, setAvailability] = useState<Availability>("Available");
  const [verified, setVerified] = useState(true);
  const [image, setImage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState("");
  const [note, setNote] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [checkLoc, setCheckLoc] = useState(true);
  const [checkPhotos, setCheckPhotos] = useState(true);
  const [checkPrice, setCheckPrice] = useState(true);
  const [checkAvail, setCheckAvail] = useState(true);

  const [allHostels, setAllHostels] = useState<AdminHostel[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const suggestedPrice = useMemo(() => {
    if (!allHostels.length || roomOfferings.length === 0) return null;
    const firstRoom = roomOfferings[0];
    if (!firstRoom.roomType.trim()) return null;
    const sameRoom = allHostels.filter((h) => h.roomType === firstRoom.roomType.trim());
    const pool = sameRoom.length >= 3 ? sameRoom : allHostels;
    const loc = location.trim().toLowerCase();
    const scored = pool.map((h) => {
      const overlap = h.facilities.filter((f) => facilities.includes(f)).length;
      const missing = facilities.filter((f) => !h.facilities.includes(f)).length;
      const locMatch = h.location.toLowerCase() === loc ? 1 : 0;
      const weight = Math.max(0.15, 1 + overlap - 0.5 * missing + 2 * locMatch);
      return { price: h.pricePerYear, weight };
    });
    const total = scored.reduce((s, x) => s + x.weight, 0);
    const avg = scored.reduce((s, x) => s + x.price * x.weight, 0) / total;
    return Math.round(avg / 50) * 50;
  }, [allHostels, roomOfferings, location, facilities]);

  // Smart suggestion: facilities common among similar hostels (same room type
  // or location) that this hostel doesn't yet list.
  const suggestedFacilities = useMemo(() => {
    if (!allHostels.length) return [];
    const firstRoomType = roomOfferings[0]?.roomType?.trim();
    const loc = location.trim().toLowerCase();
    const peers = allHostels.filter(
      (h) =>
        (firstRoomType ? h.roomType === firstRoomType : false) ||
        (loc !== "" && h.location.toLowerCase() === loc),
    );
    const pool = peers.length >= 2 ? peers : allHostels;
    const counts = new Map<string, number>();
    for (const h of pool) {
      for (const key of h.facilities ?? []) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .filter(([key, n]) => n / pool.length >= 0.5 && !facilities.includes(key))
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);
  }, [allHostels, roomOfferings, location, facilities]);

  const previewHostel: Hostel = {
    id: "preview",
    name: name.trim() || "Hostel name",
    location: location.trim() || "Location",
    pricePerYear: roomOfferings[0] ? Number(roomOfferings[0].price) || 0 : 0,
    roomType: roomOfferings[0]?.roomType.trim() || "—",
    availability,
    verified,
    image: image || FALLBACK_IMAGE,
    note: note.trim() || undefined,
    facilities,
  };

  useEffect(() => {
    let active = true;
    fetchOwners().then(setOwners).catch(() => {});
    fetchHostels().then(setAllHostels).catch(() => {});
    if (id) {
      fetchHostel(id)
        .then((h) => {
          if (!active) return;
          setName(h.name);
          setLocation(h.location);
          setLandmark(h.landmark ?? "");
          setAddress(h.address ?? "");
          setRoomOfferings(
            (h.roomOfferings && h.roomOfferings.length > 0
              ? h.roomOfferings
              : [
                  {
                    id: crypto.randomUUID(),
                    roomType: h.roomType || "2-in-1",
                    price: h.pricePerYear?.toString() ?? "",
                    pricingPeriod: "AcademicYear",
                    bedsPerRoom: "",
                    totalRooms: h.totalRooms != null ? h.totalRooms.toString() : "",
                    availableRooms: h.totalRooms != null ? h.totalRooms.toString() : "",
                    availability: h.availability ?? "Available",
                    description: h.note ?? "",
                  },
                ]
            ).map((room: Partial<RoomOfferingDraft> & { id?: string }) => ({
              id: room.id ?? crypto.randomUUID(),
              roomType: room.roomType,
              price: room.price?.toString?.() ?? "",
              pricingPeriod: room.pricingPeriod ?? "AcademicYear",
              bedsPerRoom: room.bedsPerRoom?.toString?.() ?? "",
              totalRooms: room.totalRooms?.toString?.() ?? "",
              availableRooms: room.availableRooms?.toString?.() ?? "",
              availability: room.availability ?? "Available",
              description: room.description ?? "",
            })),
          );
          setAvailability(h.availability);
          setVerified(h.verified);
          setImage(h.image);
          setPhotos(h.photos && h.photos.length ? h.photos : h.image ? [h.image] : []);
          setFacilities(h.facilities);
          setOwnerId(h.ownerId ?? "");
          setNote(h.note ?? "");
          setLat(h.latitude ?? null);
          setLng(h.longitude ?? null);
          setCheckLoc(h.verified);
          setCheckPhotos(h.verified);
          setCheckPrice(h.verified);
          setCheckAvail(h.verified);
          setLoading(false);
        })
        .catch(() => {
          if (active) navigate("/admin/hostels");
        });
    }
    return () => {
      active = false;
    };
  }, [id, navigate]);

  function toggleFacility(fid: string) {
    setFacilities((prev) =>
      prev.includes(fid) ? prev.filter((f) => f !== fid) : [...prev, fid],
    );
  }

  function updateRoomOffering(id: string, field: keyof RoomOfferingDraft, value: string) {
    setRoomOfferings((prev) =>
      prev.map((room) => (room.id === id ? { ...room, [field]: value } : room)),
    );
  }

  function addRoomOffering() {
    setRoomOfferings((prev) => [...prev, createEmptyRoomOffering()]);
  }

  function removeRoomOffering(id: string) {
    setRoomOfferings((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((room) => room.id !== id);
    });
  }

  const checkSetters: Record<VerifKey, (v: boolean) => void> = {
    checkLoc: setCheckLoc,
    checkPhotos: setCheckPhotos,
    checkPrice: setCheckPrice,
    checkAvail: setCheckAvail,
  };

  function toggleCheck(key: VerifKey) {
    const next = !checks[key];
    checkSetters[key](next);
    if (!next && verified) setVerified(false);
  }

  function markVerified() {
    if (!verifComplete) return;
    setVerified(true);
  }

  function removePhoto(src: string) {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p !== src);
      if (image === src) setImage(updated[0] ?? "");
      return updated;
    });
  }

  function setCover(src: string) {
    setImage(src);
    setPhotos((prev) => [src, ...prev.filter((p) => p !== src)]);
  }

  function movePhoto(src: string, dir: -1 | 1) {
    setPhotos((prev) => {
      const i = prev.indexOf(src);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function onImgError(e: ChangeEvent<HTMLImageElement>) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  }

  // Renders an image with a shimmer placeholder until it has painted, so the
  // user gets feedback while the (often large) uploaded photo loads back.
  function LoadableImage({
    src,
    alt,
    className,
    onError,
  }: {
    src: string;
    alt: string;
    className?: string;
    onError?: ReactEventHandler<HTMLImageElement>;
  }) {
    const [loaded, setLoaded] = useState(false);
    return (
      <>
        {!loaded && <span className={styles.imgSkeleton} aria-hidden="true" />}
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            setLoaded(true);
            onError?.(e);
          }}
          style={loaded ? undefined : { opacity: 0 }}
        />
      </>
    );
  }

  async function handleFiles(fileList: FileList | null) {
    const files = fileList
      ? Array.from(fileList).filter((f) => f.type.startsWith("image/"))
      : [];
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadHostelImage(f, imageFolder)),
      );
      setPhotos((prev) => {
        const next = [...prev];
        for (const url of urls) if (!next.includes(url)) next.push(url);
        return next;
      });
      setImage((prev) => prev || urls[0] || "");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const normalizedRoomOfferings = roomOfferings
      .filter((room) => room.roomType.trim())
      .map((room) => ({
        roomType: room.roomType.trim(),
        price: Number(room.price) || 0,
        pricingPeriod: room.pricingPeriod,
        bedsPerRoom: room.bedsPerRoom ? Number(room.bedsPerRoom) : undefined,
        totalRooms: room.totalRooms ? Number(room.totalRooms) : undefined,
        availableRooms: room.availableRooms ? Number(room.availableRooms) : undefined,
        availability: room.availability,
        description: room.description.trim() || undefined,
      }));

    const input: HostelInput = {
      name: name.trim(),
      location: location.trim(),
      landmark: landmark.trim() || undefined,
      address: address.trim() || undefined,
      pricePerYear: normalizedRoomOfferings[0]?.price ?? 0,
      roomType: normalizedRoomOfferings[0]?.roomType ?? "1-in-1",
      totalRooms: normalizedRoomOfferings[0]?.totalRooms,
      availability: normalizedRoomOfferings[0]?.availability ?? "Available",
      verified,
      image: photos[0] ?? image ?? "",
      photos,
      roomOfferings: normalizedRoomOfferings,
      facilities,
      ownerId: ownerId || undefined,
      note: note.trim() || undefined,
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
    };
    // New hostels upload images to a temporary folder before they have a real
    // id. Tell the backend so it can move them into the created hostel's folder.
    if (!id) input.tempFolder = draftId;
    if (lat != null && lng != null) {
      input.distanceFromSTU = haversineKm(STU.lat, STU.lng, lat, lng);
    }
    if (saving) return;
    setSaveError(null);
    setSaving(true);
    try {
      if (id) {
        await updateHostel(id, input);
      } else {
        await createHostel(input);
      }
      navigate("/admin/hostels");
    } catch (err) {
      setSaving(false);
      setSaveError(err instanceof Error ? err.message : "Could not save the hostel");
    }
  }

  const owner = owners.find((o) => o.id === ownerId);
  const checks: Record<VerifKey, boolean> = {
    checkLoc,
    checkPhotos,
    checkPrice,
    checkAvail,
  };
  const verifComplete = checkLoc && checkPhotos && checkPrice && checkAvail;
  const verifDone = Object.values(checks).filter(Boolean).length;
  const verifPct = Math.round((verifDone / VERIF_CHECKS.length) * 100);

  const previewInitials = owner ? ownerInitials(owner.name) : "–";

  if (loading) {
    return (
      <div>
        <div className={styles.skeleton} style={{ height: 24, width: 200, marginBottom: 18 }} />
        <div className={styles.skeleton} style={{ height: 44, marginBottom: 18 }} />
        <div className={styles.skeleton} style={{ height: 280, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className={styles.manageLayout}>
      <div className={styles.manageMain}>
        <div className={styles.manageHeader}>
        <div>
          <Link to="/admin/hostels" className={styles.backLink}>
            <IconChevronLeft size={16} /> Back to hostels
          </Link>
          <span className={styles.dashEyebrow}>
            <IconBed size={14} /> {isEdit ? "Edit listing" : "New listing"}
          </span>
          <h1 className={styles.pageTitle}>
            {isEdit ? name || "Edit hostel" : "Add a home for students"}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? "Update the listing across each section below — and make it shine."
              : "Build a warm, honest listing students will feel good about."}
          </p>
        </div>
        <div className={styles.headerActions}>
          {isEdit && (
            <Badge variant={availability}>{availability}</Badge>
          )}
          <button
            type="submit"
            form="hostel-form"
            className={styles.btnPrimary}
            disabled={saving}
          >
            {saving ? (
              <IconRefresh size={16} className={styles.liveSpin} />
            ) : (
              <IconCheck size={16} />
            )}
            {saving ? (isEdit ? "Saving…" : "Publishing…") : isEdit ? "Save changes" : "Publish hostel"}
          </button>
        </div>
      </div>
      {saveError && <p className={styles.error}>{saveError}</p>}

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={16} style={{ verticalAlign: "-3px", marginRight: 7 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      <form id="hostel-form" className={styles.form} onSubmit={handleSubmit}>
        {tab === "place" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionHead}>
                <div>
                  <div className={styles.formSectionTitle}>Where is this place?</div>
                  <div className={styles.formSectionHint}>
                    Start with the basics. Tell Dabi where this hostel is and help students understand where they'll find it.
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-name">
                    Hostel name
                  </label>
                  <input
                    id="h-name"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-loc">
                    Location / Area
                  </label>
                  <input
                    id="h-loc"
                    className={styles.input}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Fiapre"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-landmark">
                    Landmark
                  </label>
                  <input
                    id="h-landmark"
                    className={styles.input}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Fiapre Junction"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="h-address">
                  Address
                </label>
                <input
                  id="h-address"
                  className={styles.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Optional street or building address"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="h-note">
                  Description
                </label>
                <textarea
                  id="h-note"
                  className={styles.textarea}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell students a little about this place."
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Map &amp; location pin</div>
              <div className={styles.formSectionHint}>
                Search for a place or move the marker to the exact location.
              </div>

              <LocationPicker
                latitude={lat ?? undefined}
                longitude={lng ?? undefined}
                onChange={(la, ln) => {
                  setLat(la);
                  setLng(ln);
                }}
                onArea={(area) => setLocation(area)}
              />

              {lat != null && lng != null && (
                <p className={styles.coords}>
                  <IconMap size={14} style={{ verticalAlign: "-2px" }} /> Pinned at{" "}
                  {lat.toFixed(5)}, {lng.toFixed(5)} ·{" "}
                  {Math.round(haversineKm(STU.lat, STU.lng, lat, lng))} km from STU
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "rooms" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionHead}>
                <div>
                  <div className={styles.formSectionTitle}>What rooms are available?</div>
                  <div className={styles.formSectionHint}>
                    Tell us what students can actually get at this hostel.
                  </div>
                </div>
                <button type="button" className={styles.btnSecondary} onClick={addRoomOffering}>
                  + Add room type
                </button>
              </div>

              {roomOfferings.map((room, index) => (
                <div key={room.id} className={styles.formSection} style={{ padding: 16, gap: 12 }}>
                  <div className={styles.formSectionHead}>
                    <div className={styles.formSectionTitle}>Room type {index + 1}</div>
                    {roomOfferings.length > 1 && (
                      <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() => removeRoomOffering(room.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Room type</label>
                      <select
                        className={styles.select}
                        value={room.roomType}
                        onChange={(e) => updateRoomOffering(room.id, "roomType", e.target.value)}
                      >
                        {ROOM_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Price</label>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        value={room.price}
                        onChange={(e) => updateRoomOffering(room.id, "price", e.target.value)}
                        placeholder="2500"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Pricing period</label>
                      <select
                        className={styles.select}
                        value={room.pricingPeriod}
                        onChange={(e) =>
                          updateRoomOffering(
                            room.id,
                            "pricingPeriod",
                            e.target.value as RoomOfferingDraft["pricingPeriod"],
                          )
                        }
                      >
                        <option value="AcademicYear">Academic Year</option>
                        <option value="Semester">Semester</option>
                        <option value="Month">Month</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>How many students share the room?</label>
                      <input
                        className={styles.input}
                        type="number"
                        min={1}
                        value={room.bedsPerRoom}
                        onChange={(e) => updateRoomOffering(room.id, "bedsPerRoom", e.target.value)}
                        placeholder="2"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>How many rooms of this type exist?</label>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        value={room.totalRooms}
                        onChange={(e) => updateRoomOffering(room.id, "totalRooms", e.target.value)}
                        placeholder="4"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>How many are available right now?</label>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        value={room.availableRooms}
                        onChange={(e) => updateRoomOffering(room.id, "availableRooms", e.target.value)}
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Availability</label>
                      <select
                        className={styles.select}
                        value={room.availability}
                        onChange={(e) =>
                          updateRoomOffering(
                            room.id,
                            "availability",
                            e.target.value as Availability,
                          )
                        }
                      >
                        {AVAILABILITY.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Anything students should know?</label>
                    <textarea
                      className={styles.textarea}
                      value={room.description}
                      onChange={(e) => updateRoomOffering(room.id, "description", e.target.value)}
                      placeholder="Washroom inside, furnished, self-contained..."
                    />
                  </div>
                </div>
              ))}

              {suggestedPrice != null && (
                <div className={styles.suggestBox}>
                  <span className={styles.suggestIcon}>
                    <IconSparkles size={16} />
                  </span>
                  <span className={styles.suggestText}>
                    Suggested price for this setup: <strong>{ghs.format(suggestedPrice)}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.suggestApply}
                    onClick={() => {
                      const firstRoom = roomOfferings[0];
                      if (!firstRoom) return;
                      updateRoomOffering(firstRoom.id, "price", suggestedPrice.toString());
                    }}
                    disabled={Number(roomOfferings[0]?.price ?? 0) === suggestedPrice}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "facilities" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionHead}>
                <div>
                  <div className={styles.formSectionTitle}>What&rsquo;s included?</div>
                  <div className={styles.formSectionHint}>
                    Help students understand what they can expect at this hostel.
                  </div>
                </div>
                <span className={styles.facilityCount}>{facilities.length} selected</span>
              </div>

              <div className={styles.facilityGrid}>
                {facilityCatalog.map((f) => {
                  const on = facilities.includes(f.key);
                  return (
                    <label
                      key={f.key}
                      className={`${styles.facilityItem} ${on ? styles.facilityItemOn : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleFacility(f.key)}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                      />
                      <span className={styles.facilityIcon}>
                        <FacilityGlyph iconKey={f.iconKey} size={18} />
                      </span>
                      <span className={styles.facilityLabel}>{f.label}</span>
                      <span className={styles.facilityCheck}>
                        {on && <IconCheck size={13} />}
                      </span>
                    </label>
                  );
                })}
              </div>

              {suggestedFacilities.length > 0 && (
                <div className={styles.facilitySuggest}>
                  <span className={styles.facilitySuggestLabel}>
                    <IconSparkles size={15} /> Students usually expect
                  </span>
                  <div className={styles.facilitySuggestChips}>
                    {suggestedFacilities.map((key) => {
                      const f = facilityCatalog.find((x) => x.key === key);
                      if (!f) return null;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={styles.facilitySuggestChip}
                          onClick={() => toggleFacility(key)}
                        >
                          <FacilityGlyph iconKey={f.iconKey} size={15} />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "photos" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Cover image</div>
              <div className={styles.formSectionHint}>
                The first photo in your gallery is shown across Dabi.
              </div>
              <div className={styles.coverPreview}>
                {image ? (
                  <LoadableImage
                    className={styles.coverImg}
                    src={image}
                    alt="Cover"
                    onError={onImgError}
                  />
                ) : (
                  <div className={styles.coverFallback}>
                    <img src={FALLBACK_IMAGE} alt="" className={styles.fallbackArt} loading="lazy" decoding="async" />
                    <span>No cover photo yet</span>
                  </div>
                )}
                {image && (
                  <span className={styles.coverTag}>
                    <IconStar size={11} /> Cover
                  </span>
                )}
              </div>
              <p className={styles.coverCaption}>
                This is the first thing students see — make it warm and welcoming.
              </p>
            </div>
            <div className={styles.formSection}>
              <div className={styles.formSectionHead}>
                <div>
                  <div className={styles.formSectionTitle}>Gallery</div>
                  <div className={styles.formSectionHint}>
                    Upload your own photos. The first photo is the cover — reorder or pick a cover, and remove any you don&apos;t want.
                  </div>
                </div>
                <span className={styles.facilityCount}>{photos.length} added</span>
              </div>

              <label
                className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
                htmlFor="h-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <span className={styles.dropzoneIcon}>
                  <IconUpload size={22} />
                </span>
                <span className={styles.dropzoneTitle}>Drop photos here or click to upload</span>
                <span className={styles.dropzoneHint}>
                  JPG or PNG · up to 5MB each · add several at once
                </span>
                <input
                  id="h-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.uploadInput}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <p className={`${styles.uploadHint} ${styles.uploadProgress}`}>
                  <IconRefresh size={15} className={styles.liveSpin} />
                  Uploading photos… this can take a moment for large files.
                </p>
              )}
              {uploadError && <p className={styles.error}>{uploadError}</p>}

              {photos.length === 0 ? (
                <div className={styles.galleryEmpty}>
                  <img src={FALLBACK_IMAGE} alt="" className={styles.fallbackArt} loading="lazy" decoding="async" />
                  <span>No photos yet — upload one above to get started.</span>
                </div>
              ) : (
                <div className={styles.photoGrid}>
                  {photos.map((src, idx) => {
                    const isCover = image === src;
                    return (
                      <div
                        key={src + idx}
                        className={`${styles.photoCard} ${isCover ? styles.photoCardCover : ""}`}
                      >
                        <div className={styles.photoMedia}>
                          <LoadableImage
                            className={styles.photoThumb}
                            src={src}
                            alt=""
                            onError={onImgError}
                          />
                          {isCover && (
                            <span className={styles.photoCoverTag}>
                              <IconStar size={11} /> Cover
                            </span>
                          )}
                          <div className={styles.photoActions}>
                            <button
                              type="button"
                              className={styles.btnIcon}
                              onClick={() => movePhoto(src, -1)}
                              disabled={idx === 0}
                              aria-label="Move left"
                              title="Move left"
                            >
                              <IconChevronLeft size={15} />
                            </button>
                            <button
                              type="button"
                              className={styles.btnIcon}
                              onClick={() => movePhoto(src, 1)}
                              disabled={idx === photos.length - 1}
                              aria-label="Move right"
                              title="Move right"
                            >
                              <IconChevronLeft size={15} style={{ transform: "scaleX(-1)" }} />
                            </button>
                            {!isCover && (
                              <button
                                type="button"
                                className={styles.btnIcon}
                                onClick={() => setCover(src)}
                                aria-label="Set as cover"
                                title="Set as cover"
                              >
                                <IconStar size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                              onClick={() => removePhoto(src)}
                              aria-label="Remove photo"
                              title="Remove"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>
                        </div>
                        <div className={styles.photoFoot}>
                          <span className={styles.photoName}>{src.split("/").pop()}</span>
                          {isCover && <span className={styles.photoOrder}>#{idx + 1}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "owner" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Who owns this place?</div>
              <div className={styles.formSectionHint}>
                Select an existing owner or add one now. Phone is the important contact detail.
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="h-owner">
                  Assigned owner
                </label>
                <select
                  id="h-owner"
                  className={styles.select}
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              {owner ? (
                <div className={styles.ownerCard}>
                  <div className={styles.ownerCardHead}>
                    <span className={styles.ownerAvatar}>{previewInitials}</span>
                    <div className={styles.ownerId}>
                      <span className={styles.ownerName}>{owner.name}</span>
                      <span className={styles.ownerRole}>Hostel owner</span>
                    </div>
                    <span className={styles.ownerAssignedTag}>Assigned</span>
                  </div>
                  <div className={styles.ownerContacts}>
                    <a className={styles.ownerContact} href={`tel:${owner.phone}`}>
                      <span className={styles.ownerContactIcon}>
                        <IconPhone size={15} />
                      </span>
                      <span className={styles.ownerContactText}>{owner.phone}</span>
                    </a>
                    <a className={styles.ownerContact} href={`mailto:${owner.email}`}>
                      <span className={styles.ownerContactIcon}>
                        <IconMail size={15} />
                      </span>
                      <span className={styles.ownerContactText}>{owner.email ?? "No email on file"}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className={styles.ownerEmpty}>
                  <span className={styles.ownerEmptyIcon}>
                    <IconUser size={20} />
                  </span>
                  <span>No owner assigned yet.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "verification" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Dabi verification</div>
              <div className={styles.formSectionHint}>
                Complete every check, then approve the listing.
              </div>

              <div className={styles.verifPanel}>
                <div className={`${styles.verifSummary} ${verified && verifComplete ? styles.verifSummaryDone : ""}`}>
                  <div
                    className={styles.verifRing}
                    style={{ "--verif-pct": verifPct } as CSSProperties}
                  >
                    <span className={styles.verifRingNum}>{verifDone}</span>
                    <span className={styles.verifRingDen}>/{VERIF_CHECKS.length}</span>
                  </div>
                  <div className={styles.verifSummaryText}>
                    <div className={styles.verifSummaryTitle}>
                      {verified && verifComplete
                        ? "Verified"
                        : verifComplete
                          ? "Ready for review"
                          : verifDone > 0
                            ? "In progress"
                            : "Not started"}
                    </div>
                    <div className={styles.verifSummarySub}>
                      {verified && verifComplete
                        ? "All checks passed and approved."
                        : verifComplete
                          ? "All checks done — approve to verify."
                          : `${verifDone} of ${VERIF_CHECKS.length} checks complete.`}
                    </div>
                  </div>
                  <Badge variant={verified && verifComplete ? "Active" : "Limited"}>
                    {verified && verifComplete ? "Verified" : "Needs review"}
                  </Badge>
                </div>

                <div className={styles.verifChecklist}>
                  {VERIF_CHECKS.map((c) => {
                    const on = checks[c.key];
                    const Icon = c.icon;
                    return (
                      <button
                        type="button"
                        key={c.key}
                        className={`${styles.verifItem} ${on ? styles.verifItemOn : ""}`}
                        onClick={() => toggleCheck(c.key)}
                        aria-pressed={on}
                      >
                        <span className={styles.verifIconWrap}>
                          <Icon size={18} />
                        </span>
                        <span className={styles.verifItemBody}>
                          <span className={styles.verifItemLabel}>{c.label}</span>
                          <span className={styles.verifItemDesc}>{c.desc}</span>
                        </span>
                        <span className={styles.verifItemCheck}>
                          {on && <IconCheck size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.verifActions}>
                  <button
                    type="button"
                    className={`${styles.btnPrimary} ${styles.btnSm}`}
                    onClick={markVerified}
                    disabled={!verifComplete || verified}
                  >
                    <IconShield size={15} />
                    {verified ? "Verified" : "Mark as verified"}
                  </button>
                  {!verifComplete && (
                    <span className={styles.verifActionHint}>
                      Finish {VERIF_CHECKS.length - verifDone} more check
                      {VERIF_CHECKS.length - verifDone === 1 ? "" : "s"} to verify.
                    </span>
                  )}
                </div>

                <label
                  className={`${styles.verifToggle} ${!verifComplete ? styles.verifToggleLocked : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={verified}
                    disabled={!verifComplete}
                    onChange={(e) => setVerified(e.target.checked)}
                  />
                  Listed as a verified hostel on Dabi
                </label>
              </div>
            </div>
          </div>
        )}

        {tab === "review" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Looks good?</div>
              <div className={styles.formSectionHint}>
                Here&rsquo;s a quick review of what students will see.
              </div>

              <div className={styles.previewCard} style={{ maxWidth: "none", marginBottom: 0 }}>
                <div className={styles.previewMedia}>
                  <img
                    className={styles.previewImg}
                    src={previewHostel.image}
                    alt={previewHostel.name}
                    onError={onImgError}
                  />
                  <div className={styles.previewBadges}>
                    <span className={styles.previewStatus}>
                      <span
                        className={styles.previewStatusDot}
                        style={{
                          background:
                            AVAILABILITY.find((a) => a.id === previewHostel.availability)?.color ??
                            "#1f8a55",
                        }}
                      />
                      {previewHostel.availability}
                    </span>
                    {previewHostel.verified && (
                      <span className={styles.previewVerified}>
                        <IconCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.previewBody}>
                  <h3 className={styles.previewName}>{previewHostel.name}</h3>
                  <p className={styles.previewLoc}>
                    <IconMap size={14} /> {previewHostel.location}
                  </p>
                  {previewHostel.note && (
                    <p className={styles.previewNote}>{previewHostel.note}</p>
                  )}
                  <div className={styles.previewMeta}>
                    <span className={styles.previewRoom}>
                      <IconBed size={14} /> {previewHostel.roomType}
                    </span>
                    <span className={styles.previewPrice}>
                      GH₵{previewHostel.pricePerYear.toLocaleString("en-GH")} <small>price per head</small>
                    </span>
                  </div>
                  {facilities.length > 0 && (
                    <div className={styles.previewFacilities}>
                      {facilities.slice(0, 4).map((f) => {
                        const fac = facilityCatalog.find((x) => x.key === f);
                        return (
                          <span key={f} className={styles.previewChip}>
                            {fac ? fac.label : f}
                          </span>
                        );
                      })}
                      {facilities.length > 4 && (
                        <span className={styles.previewChip}>
                          +{facilities.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <Link to="/admin/hostels" className={styles.btnGhost}>
            Cancel
          </Link>
        </div>
      </form>
      </div>

      <aside className={styles.previewPane}>
        <div className={styles.previewLabel}>
          <IconEye size={15} /> Live preview
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewMedia}>
            <img
              className={styles.previewImg}
              src={previewHostel.image}
              alt={previewHostel.name}
              onError={onImgError}
            />
            <div className={styles.previewBadges}>
              <span className={styles.previewStatus}>
                <span
                  className={styles.previewStatusDot}
                  style={{
                    background:
                      AVAILABILITY.find((a) => a.id === previewHostel.availability)?.color ??
                      "#1f8a55",
                  }}
                />
                {previewHostel.availability}
              </span>
              {previewHostel.verified && (
                <span className={styles.previewVerified}>
                  <IconCheck size={12} /> Verified
                </span>
              )}
            </div>
          </div>
          <div className={styles.previewBody}>
            <h3 className={styles.previewName}>{previewHostel.name}</h3>
            <p className={styles.previewLoc}>
              <IconMap size={14} /> {previewHostel.location}
            </p>
            {previewHostel.note && (
              <p className={styles.previewNote}>{previewHostel.note}</p>
            )}
            <div className={styles.previewMeta}>
              <span className={styles.previewRoom}>
                <IconBed size={14} /> {previewHostel.roomType}
              </span>
              <span className={styles.previewPrice}>
                GH₵{previewHostel.pricePerYear.toLocaleString("en-GH")}{" "}
                <small>price per head</small>
              </span>
            </div>
            {facilities.length > 0 && (
              <div className={styles.previewFacilities}>
                {facilities.slice(0, 4).map((f) => {
                  const fac = facilityCatalog.find((x) => x.key === f);
                  return (
                    <span key={f} className={styles.previewChip}>
                      {fac ? fac.label : f}
                    </span>
                  );
                })}
                {facilities.length > 4 && (
                  <span className={styles.previewChip}>
                    +{facilities.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <p className={styles.previewHint}>
          This is how the listing appears to students on Dabi.
        </p>
      </aside>
    </div>
  );
}
