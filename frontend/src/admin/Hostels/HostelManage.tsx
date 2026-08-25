import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react";
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
import HostelCard from "../../components/HostelCard/HostelCard";
import LocationPicker from "../../components/LocationPicker/LocationPicker";
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
  IconSparkles,
  IconPhone,
  IconMail,
  IconMap,
  IconTag,
} from "../../components/Icons/Icons";

import styles from "../admin.module.css";

const FALLBACK_IMAGE = "/illustrations/Photography-Fashion--Streamline-Bangalore.png";

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

type Tab = "overview" | "photos" | "availability" | "location" | "owner" | "verification";

const TABS: { id: Tab; label: string; icon: typeof IconBed }[] = [
  { id: "overview", label: "Overview", icon: IconBed },
  { id: "photos", label: "Photos", icon: IconImages },
  { id: "availability", label: "Availability", icon: IconCheck },
  { id: "location", label: "Location", icon: IconMap },
  { id: "owner", label: "Owner", icon: IconUser },
  { id: "verification", label: "Verification", icon: IconShield },
];

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const today = () => new Date().toISOString().slice(0, 10);

const STU_COORDS: [number, number] = [7.339, -2.327];

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
  const [tab, setTab] = useState<Tab>("overview");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("2-in-1");
  const [totalRooms, setTotalRooms] = useState("");
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
  const [dragActive, setDragActive] = useState(false);

  const suggestedPrice = useMemo(() => {
    if (!allHostels.length || !roomType.trim()) return null;
    const sameRoom = allHostels.filter((h) => h.roomType === roomType.trim());
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
  }, [allHostels, roomType, location, facilities]);

  // Smart suggestion: facilities common among similar hostels (same room type
  // or location) that this hostel doesn't yet list.
  const suggestedFacilities = useMemo(() => {
    if (!allHostels.length) return [];
    const loc = location.trim().toLowerCase();
    const peers = allHostels.filter(
      (h) =>
        h.roomType === roomType.trim() ||
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
  }, [allHostels, roomType, location, facilities]);

  const previewHostel: Hostel = {
    id: "preview",
    name: name.trim() || "Hostel name",
    location: location.trim() || "Location",
    pricePerYear: Number(price) || 0,
    roomType: roomType.trim() || "—",
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
          setPrice(h.pricePerYear.toString());
          setRoomType(h.roomType);
          setTotalRooms(h.totalRooms != null ? h.totalRooms.toString() : "");
          setAvailability(h.availability);
          setVerified(h.verified);
          setImage(h.image);
          setPhotos(h.photos && h.photos.length ? h.photos : h.image ? [h.image] : []);
          setFacilities(h.facilities);
          setOwnerId(h.ownerId ?? "");
          setNote(h.note ?? "");
          setLat(h.latitude ?? null);
          setLng(h.longitude ?? null);
          setCheckLoc

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: HostelInput = {
      name: name.trim(),
      location: location.trim(),
      pricePerYear: Number(price) || 0,
      roomType: roomType.trim(),
      totalRooms: totalRooms ? Number(totalRooms) : undefined,
      availability,
      verified,
      image: photos[0] ?? image ?? "",
      photos,
      facilities,
      ownerId: ownerId || undefined,
      note: note.trim() || undefined,
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
    };
    if (lat != null && lng != null) {
      input.distanceFromSTU = haversineKm(STU_COORDS[0], STU_COORDS[1], lat, lng);
    }
    const done = id ? updateHostel(id, input) : createHostel(input);
    done.then(() => navigate("/admin/hostels"));
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
          <button type="submit" form="hostel-form" className={`dabi-btn dabi-btn-primary ${styles.btnPrimary}`}>
            <IconCheck size={16} />
            {isEdit ? "Save changes" : "Publish hostel"}
          </button>
        </div>
      </div>

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
        {tab === "overview" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Basic information</div>
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
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-loc">
                    Location
                  </label>
                  <input
                    id="h-loc"
                    className={styles.input}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
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
                  placeholder="Short description shown on the listing"
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Rooms &amp; pricing</div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-price">
                    Yearly rent (GHS)
                  </label>
                  <input
                    id="h-price"
                    className={styles.input}
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-room">
                    Room type
                  </label>
                  <input
                    id="h-room"
                    className={styles.input}
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="e.g. 2-in-1"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="h-rooms">
                    Number of rooms
                  </label>
                  <input
                    id="h-rooms"
                    className={styles.input}
                    type="number"
                    min={0}
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    placeholder="e.g. 12"
                  />
                </div>
              </div>
              {suggestedPrice != null && (
                <div className={styles.suggestBox}>
                  <span className={styles.suggestIcon}>
                    <IconSparkles size={16} />
                  </span>
                  <span className={styles.suggestText}>
                    Suggested yearly rent for this setup:{" "}
                    <strong>{ghs.format(suggestedPrice)}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.suggestApply}
                    onClick={() => setPrice(suggestedPrice.toString())}
                    disabled={Number(price) === suggestedPrice}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionHead}>
                <div>
                  <div className={styles.formSectionTitle}>Facilities</div>
                  <div className={styles.formSectionHint}>
                    What does this hostel offer?
                  </div>
                </div>
                <span className={styles.facilityCount}>
                  {facilities.length} selected
                </span>
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
                  <img
                    className={styles.coverImg}
                    src={image}
                    alt="Cover"
                    onError={onImgError}
                  />
                ) : (
                  <div className={styles.coverFallback}>
                    <img src={FALLBACK_IMAGE} alt="" className={styles.fallbackArt} />
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
                    Upload your own photos. The first photo is the cover — reorder
                    or pick a cover, and remove any you don&rsquo;t want.
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
              {uploading && <p className={styles.uploadHint}>Uploading photos…</p>}
              {uploadError && <p className={styles.error}>{uploadError}</p>}

              {photos.length === 0 ? (
                <div className={styles.galleryEmpty}>
                  <img src={FALLBACK_IMAGE} alt="" className={styles.fallbackArt} />
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
                          <img
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

        {tab === "availability" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Current status</div>
              <div className={styles.formSectionHint}>
                Let students know how many spaces are left.
              </div>
              <div className={styles.availGrid}>
                {AVAILABILITY.map((a) => {
                  const on = availability === a.id;
                  return (
                    <button
                      type="button"
                      key={a.id}
                      className={`${styles.availCard} ${on ? styles.availCardOn : ""}`}
                      style={
                        {
                          "--avail-color": a.color,
                        } as CSSProperties
                      }
                      onClick={() => setAvailability(a.id)}
                      aria-pressed={on}
                    >
                      <span className={styles.availCardHead}>
                        <span className={styles.availDot} style={{ background: a.color }} />
                        <span className={styles.availCardLabel}>{a.label}</span>
                        <span className={styles.availCheck}>
                          {on && <IconCheck size={13} />}
                        </span>
                      </span>
                      <span className={styles.availCardDesc}>{a.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className={styles.availMeta}>
                Last checked: {today()}
              </p>
              {isEdit && (
                <button
                  type="button"
                  className={`dabi-btn dabi-btn-secondary ${styles.btnSecondary} ${styles.btnSm}`}
                  style={{ marginTop: 12 }}
                  onClick={() => updateHostel(id!, { availability }).then(() => navigate("/admin/hostels"))}
                >
                  Update availability
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "location" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Hostel location</div>
              <div className={styles.formSectionHint}>
                Drop a pin on the map to mark exactly where this hostel is.
                Search an address, or use your current location — the area name
                fills in automatically and the distance to STU is calculated.
              </div>

              <LocationPicker
                latitude={lat ?? undefined}
                longitude={lng ?? undefined}
                onChange={(la, ln) => {
                  setLat(la);
                  setLng(ln);
                }}
                onAddress={(addr) => setLocation(addr)}
              />

              <div className={styles.field} style={{ marginTop: 14 }}>
                <label className={styles.fieldLabel} htmlFor="h-loc">
                  Area / address (auto-filled from the pin)
                </label>
                <input
                  id="h-loc"
                  className={styles.input}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {tab === "owner" && (
          <div className={styles.tabPanel}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}>Owner</div>
              <div className={styles.formSectionHint}>
                The person responsible for this hostel.
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
                      <span className={styles.ownerContactText}>{owner.email}</span>
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
                <div className={styles.verifSummary}>
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
                        <span className={styles.verifItemIcon}>
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
                    className={`dabi-btn dabi-btn-primary ${styles.btnPrimary} ${styles.btnSm}`}
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

        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <Link to="/admin/hostels" className="dabi-btn dabi-btn-ghost">
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
          <HostelCard hostel={previewHostel} />
        </div>
        <p className={styles.previewHint}>
          This is how the listing appears to students on Dabi.
        </p>
      </aside>
    </div>
  );
}
