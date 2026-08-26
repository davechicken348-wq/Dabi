import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Reveal from "../../components/Reveal/Reveal";
import HostelCard from "../../components/HostelCard/HostelGridCard";
import CTASection from "../../components/CTASection/CTASection";
import { IconPin, IconDirections } from "../../components/Icons/Icons";
import type { Hostel } from "../../data/hostels";
import { fetchHostels } from "../../services/api";
import type { AdminHostel } from "../../admin/types";
import { usePolling } from "../../admin/usePolling";
import LiveControls from "../../admin/components/LiveControls";
import { areaCoords, hostelDistanceKm } from "../../data/geo";
import { useSchool } from "../../context/SchoolContext";
import styles from "./Locations.module.css";

interface AreaGroup {
  slug: string;
  name: string;
  hostels: Hostel[];
  nearestKm: number | null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toHostel(h: AdminHostel): Hostel {
  // Fall back to the area centre when a hostel has no precise coordinates
  // yet, so it still plots and routes in the directions preview.
  const fallback = areaCoords(h.location);
  return {
    id: h.id,
    name: h.name,
    location: h.location,
    pricePerYear: h.pricePerYear,
    roomType: h.roomType,
    availability: h.availability,
    verified: h.verified,
    image: h.image,
    photos: h.photos,
    note: h.note,
    distanceFromSTU: h.distanceFromSTU,
    lat: h.latitude ?? fallback?.[0],
    lng: h.longitude ?? fallback?.[1],
    facilities: h.facilities,
    recentlyVerified: h.verified,
  };
}

export default function Locations() {
  const { school } = useSchool();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function loadHostels(showLoading = true) {
    if (showLoading) setStatus("loading");
    fetchHostels()
      .then((list) => {
        setHostels(list.map(toHostel));
        setLastUpdated(new Date());
        setStatus("ready");
      })
      .catch(() => {
        if (showLoading) setStatus("error");
      });
  }

  usePolling(() => loadHostels(false));
  useEffect(() => {
    loadHostels();
  }, []);

  const isLoading = status === "loading";

  const areas = useMemo<AreaGroup[]>(() => {
    const groups = new Map<string, Hostel[]>();
    for (const h of hostels) {
      const list = groups.get(h.location) ?? [];
      list.push(h);
      groups.set(h.location, list);
    }
    return Array.from(groups.entries()).map(([name, list]) => {
      const distances = list.map((h) => hostelDistanceKm(h, school));
      const nearest = distances.some((d) => Number.isFinite(d))
        ? Math.min(...distances.filter((d) => Number.isFinite(d)))
        : null;
      return {
        slug: slugify(name),
        name,
        hostels: list,
        nearestKm: nearest,
      };
    });
  }, [hostels]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="loc-hero-title">
          <div className="dabi-container">
            <div className={styles.heroCopy}>
              <span className="dabi-eyebrow">Locations</span>
              <h1 id="loc-hero-title" className={styles.heroTitle}>
                Hostels around STU, by area.
              </h1>
              <p className={styles.heroLead}>
                Dabi lists hostels across the areas students around STU actually stay. Browse what&rsquo;s
                available where you want to be.
              </p>
              <div className={styles.heroActions}>
                <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                  Find a Hostel
                </Link>
                <Link to="/how-it-works" className="dabi-btn dabi-btn-secondary">
                  How Dabi Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className={`${styles.section} ${styles.areas}`} aria-labelledby="loc-areas-title">
          <div className="dabi-container">
            {status === "loading" ? (
              <p className={styles.loading}>Loading areas…</p>
            ) : areas.length === 0 ? (
              <div className={styles.empty}>
                <img
                  className={styles.emptyArt}
                  src={status === "error"
                    ? "/illustrations/No-Connection-1--Streamline-Brooklyn.webp"
                    : "/illustrations/Drafts-Empty-No-Drafts--Streamline-Lagos.webp"}
                  alt=""
                  width={180}
                  height={180}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className={styles.emptyTitle}>
                  {status === "error" ? "We couldn’t load hostels" : "No hostels listed yet"}
                </h3>
                <p className={styles.emptyText}>
                  {status === "error"
                    ? "Something went wrong while loading listings. Please try again in a moment."
                    : "We’re still adding hostels around STU. Check back soon — new areas appear as we verify more listings."}
                </p>
                {status === "error" ? (
                  <button type="button" className="dabi-btn dabi-btn-primary" onClick={() => loadHostels()}>
                    Try again
                  </button>
                ) : (
                  <Link to="/contact" className="dabi-btn dabi-btn-secondary">
                    Talk to Dabi
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className={styles.areaIndex} aria-label="Jump to an area">
                  {areas.map((area) => (
                    <a key={area.slug} href={`#${area.slug}`} className={styles.areaIndexChip}>
                      <IconPin size={15} />
                      {area.name}
                      <span className={styles.areaIndexCount}>{area.hostels.length}</span>
                    </a>
                  ))}
                </div>

                <h2 id="loc-areas-title" className="dabi-eyebrow" style={{ marginBottom: "1.5rem" }}>
                  Areas we cover
                </h2>

                <div className={styles.liveRow}>
                  <LiveControls
                    lastUpdated={lastUpdated}
                    loading={isLoading}
                    onRefresh={() => loadHostels()}
                  />
                </div>

                {areas.map((area) => (
                  <div key={area.slug} id={area.slug} className={styles.area}>
                    <Reveal className={styles.areaHead}>
                      <h3 className={styles.areaName}>{area.name}</h3>
                      <span className={styles.areaMeta}>
                        <IconPin size={16} className={styles.areaMetaPin} />
                        {area.hostels.length} {area.hostels.length === 1 ? "hostel" : "hostels"}
                        {area.nearestKm !== null && (
                          <>
                            <span className={styles.areaMetaDot} />
                            nearest {area.nearestKm} km from STU
                          </>
                        )}
                      </span>
                    </Reveal>

                    <div className={styles.areaGrid}>
                      {area.hostels.map((h) => (
                        <HostelCard key={h.id} hostel={h} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Coverage note */}
        <section className={`${styles.section} ${styles.coverage}`} aria-labelledby="loc-coverage-title">
          <div className="dabi-container">
            <div className={styles.coverageInner}>
              <span className={styles.coverageIcon}>
                <IconDirections size={26} />
              </span>
              <p id="loc-coverage-title" className={styles.coverageText}>
                Dabi is starting locally around STU. We add areas as we verify more hostels, so this
                list grows over time. If you&rsquo;re looking near an area we don&rsquo;t list yet,{" "}
                <Link to="/contact" style={{ color: "var(--dabi-green)", fontWeight: 700 }}>
                  talk to Dabi
                </Link>{" "}
                and we&rsquo;ll see what we can do.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA — reused component */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
