import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import HostelCard from "../../components/HostelCard/HostelGridCard";
import {
  IconPin,
  IconSliders,
  IconMap,
  IconList,
  IconClose,
  IconChevronDown,
} from "../../components/Icons/Icons";
import type { Hostel } from "../../data/hostels";
import { fetchHostels } from "../../services/api";
import type { AdminHostel } from "../../admin/types";
import { usePolling } from "../../admin/usePolling";
import LiveControls from "../../admin/components/LiveControls";
import { useSchool } from "../../context/SchoolContext";
import { hostelDistanceKm } from "../../data/geo";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  BUDGET_OPTIONS,
  ROOM_TYPE_OPTIONS,
  DISTANCE_OPTIONS,
  type Filters,
} from "./options";
import FilterModal from "./FilterModal";
import { useFacilities } from "../../context/FacilitiesContext";
import FindHostelMap from "../../components/FindHostelMap/FindHostelMap";
import EmptyState from "./EmptyState";
import HostelSkeleton from "./HostelSkeleton";
import styles from "./FindHostel.module.css";

const PAGE_SIZE = 6;

function roomCapacity(roomType: string): number {
  const match = roomType.match(/(\d+)-in-1/);
  return match ? Number(match[1]) : 0;
}

function budgetMatch(price: number, budget: string): boolean {
  switch (budget) {
    case "under-1500":
      return price < 1500;
    case "1500-2000":
      return price >= 1500 && price <= 2000;
    case "2000-2500":
      return price >= 2000 && price <= 2500;
    case "2500+":
      return price >= 2500;
    default:
      return true;
  }
}

const AVAIL_RANK: Record<string, number> = { Available: 0, Limited: 1, Full: 2 };

function toHostel(h: AdminHostel): Hostel {
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
    lat: h.latitude,
    lng: h.longitude,
    facilities: h.facilities,
    recentlyVerified: h.verified,
  };
}

function sortHostels(list: Hostel[], sort: string): Hostel[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.pricePerYear - b.pricePerYear);
    case "price-desc":
      return copy.sort((a, b) => b.pricePerYear - a.pricePerYear);
    case "distance":
      return copy.sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    case "recent":
      return copy.sort(
        (a, b) =>
          Number(!!b.recentlyVerified) - Number(!!a.recentlyVerified) ||
          a.pricePerYear - b.pricePerYear,
      );
    case "recommended":
    default:
      return copy.sort(
        (a, b) =>
          Number(!!b.verified) - Number(!!a.verified) ||
          AVAIL_RANK[a.availability] - AVAIL_RANK[b.availability] ||
          a.pricePerYear - b.pricePerYear,
      );
  }
}

function filterHostels(list: Hostel[], f: Filters): Hostel[] {
  return list.filter((h) => {
    if (f.location !== "any") {
      const q = f.location.toLowerCase();
      const loc = (h.location ?? "").toLowerCase();
      const name = (h.name ?? "").toLowerCase();
      if (!(loc === q || loc.includes(q) || name.includes(q))) return false;
    }
    if (f.roomType !== "any") {
      const cap = roomCapacity(h.roomType);
      if (f.roomType === "4-in-1+") {
        if (cap < 4) return false;
      } else if (f.roomType !== h.roomType) {
        return false;
      }
    }
    if (!budgetMatch(h.pricePerYear, f.budget)) return false;
    if (f.availability !== "all" && h.availability !== f.availability) return false;
    if (f.distance !== "any" && (h.distanceKm ?? Infinity) > Number(f.distance)) return false;
    if (f.recentlyVerified && !h.recentlyVerified) return false;
    if (f.facilities.length && !f.facilities.every((id) => h.facilities?.includes(id)))
      return false;
    return true;
  });
}

function LocationSearch({
  value,
  suggestions,
  onChange,
}: {
  value: string;
  suggestions: string[];
  onChange: (next: string) => void;
}) {
  const [text, setText] = useState(value === "any" ? "" : value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setText(value === "any" ? "" : value);
  }, [value]);

  const q = text.trim().toLowerCase();
  const matches = (q ? suggestions.filter((s) => s.toLowerCase().includes(q)) : suggestions).slice(
    0,
    8,
  );

  const commit = (next: string) => {
    onChange(next.trim() || "any");
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className={styles.locSearch}>
      <span className={styles.locSearchIcon}>
        <IconPin size={16} />
      </span>
      <input
        type="text"
        className={styles.locInput}
        placeholder="Search area or town…"
        value={text}
        autoComplete="off"
        aria-label="Search by location"
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => {
            setOpen(false);
            onChange(text.trim() || "any");
          }, 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (active >= 0 && matches[active]) commit(matches[active]);
            else commit(text);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className={styles.locSuggest}>
          {matches.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                className={`${styles.locOption} ${i === active ? styles.locOptionActive : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  window.clearTimeout(blurTimer.current);
                  commit(s);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <IconPin size={14} className={styles.locOptionIcon} />
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q && matches.length === 0 && (
        <ul className={styles.locSuggest}>
          <li className={styles.locEmpty}>
            No matching areas — press Enter to search “{text}”
          </li>
        </ul>
      )}
    </div>
  );
}

export default function FindHostel() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"list" | "map">("list");
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { school } = useSchool();
  const { label: facilityLabel } = useFacilities();

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

  const runSearch = (next: Filters) => {
    setFilters(next);
  };

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters, sort]);

  const hostelsWithDistance = useMemo(
    () => hostels.map((h) => ({ ...h, distanceKm: hostelDistanceKm(h, school) })),
    [hostels, school],
  );

  const results = useMemo(
    () => sortHostels(filterHostels(hostelsWithDistance, filters), sort),
    [hostelsWithDistance, filters, sort],
  );

  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  // Adaptive: only surface facilities that actually exist among the results.
  const availableFacilities = useMemo(() => {
    const keys = new Set<string>();
    for (const h of results) {
      for (const key of h.facilities ?? []) keys.add(key);
    }
    return Array.from(keys);
  }, [results]);

  // Distinct areas already in the data — used to power location suggestions.
  const locationSuggestions = useMemo(() => {
    const seen = new Set<string>();
    hostels.forEach((h) => {
      if (h.location) seen.add(h.location);
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [hostels]);

  const patch = (next: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...next }));

  const chips: { id: string; label: string; onClear: () => void }[] = [];
  if (filters.availability !== "all")
    chips.push({
      id: "av",
      label: filters.availability,
      onClear: () => patch({ availability: "all" }),
    });
  if (view === "map" && filters.distance !== "any")
    chips.push({
      id: "dist",
      label: `Under ${filters.distance} km`,
      onClear: () => patch({ distance: "any" }),
    });
  if (filters.recentlyVerified)
    chips.push({
      id: "rec",
      label: "Recently verified",
      onClear: () => patch({ recentlyVerified: false }),
    });
  filters.facilities.forEach((fac) =>
    chips.push({
      id: `fac-${fac}`,
      label: facilityLabel(fac),
      onClear: () => patch({ facilities: filters.facilities.filter((x) => x !== fac) }),
    }),
  );

  const advancedActive =
    (filters.availability !== "all" ? 1 : 0) +
    filters.facilities.length +
    (view === "map" && filters.distance !== "any" ? 1 : 0) +
    (filters.recentlyVerified ? 1 : 0);

  const clearAll = () => {
    runSearch(DEFAULT_FILTERS);
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className="dabi-container">
          <header className={styles.header}>
            <span className="dabi-eyebrow">Find a Hostel</span>
            <h1 className={styles.title}>Find your next place.</h1>
            <p className={styles.subtitle}>
              Explore hostels around STU and find one that fits your location, budget and needs.
            </p>
          </header>

          <section className={styles.searchBar} aria-label="Search hostels">
            <div className={styles.searchFields}>
              {view === "map" && (
                <div className={styles.field}>
                  <label htmlFor="f-dist" className={styles.label}>
                    <IconMap size={16} className={styles.fieldIcon} /> Distance from STU
                  </label>
                  <select
                    id="f-dist"
                    className={styles.control}
                    value={filters.distance}
                    onChange={(e) => patch({ distance: e.target.value })}
                  >
                    {DISTANCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={`${styles.field} ${styles.fieldGrow}`}>
                <label htmlFor="f-loc" className={styles.label}>
                  <IconPin size={16} className={styles.fieldIcon} /> Location
                </label>
                <LocationSearch
                  value={filters.location}
                  suggestions={locationSuggestions}
                  onChange={(v) => patch({ location: v })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="f-budget" className={styles.label}>
                  Budget
                </label>
                <select
                  id="f-budget"
                  className={styles.control}
                  value={filters.budget}
                  onChange={(e) => patch({ budget: e.target.value })}
                >
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="f-room" className={styles.label}>
                  <IconList size={16} className={styles.fieldIcon} /> Room type
                </label>
                <select
                  id="f-room"
                  className={styles.control}
                  value={filters.roomType}
                  onChange={(e) => patch({ roomType: e.target.value })}
                >
                  {ROOM_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                type="button"
                className={`${styles.filterBtn} ${advancedActive > 0 ? styles.filterBtnActive : ""}`}
                onClick={() => setModalOpen(true)}
              >
                <IconSliders size={18} /> More filters
                {advancedActive > 0 && <span className={styles.filterCount}>{advancedActive}</span>}
              </button>

              {chips.length > 0 && (
                <div className={styles.chips}>
                  {chips.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={styles.chip}
                      onClick={c.onClear}
                    >
                      {c.label}
                      <IconClose size={14} className={styles.chipX} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.viewToggle} role="group" aria-label="Switch between list and map">
              <button
                type="button"
                className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <IconList size={18} />
                <span className={styles.viewLabel}>List</span>
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${view === "map" ? styles.viewBtnActive : ""}`}
                aria-pressed={view === "map"}
                onClick={() => setView("map")}
              >
                <IconMap size={18} />
                <span className={styles.viewLabel}>Map</span>
              </button>
            </div>
          </div>

          <section className={styles.resultsHead} aria-live="polite">
            <div className={styles.resultsIntro}>
              <span className={styles.resultsBadge}>
                <IconPin size={15} className={styles.resultsBadgeIcon} />
                {status === "loading"
                  ? "Searching…"
                  : `${results.length} ${results.length === 1 ? "place" : "places"}`}
              </span>
              <h2 className={styles.resultsTitle}>Places worth checking out.</h2>
              <p className={styles.resultsCount}>
                {status === "loading"
                  ? "Looking for hostels near campus…"
                  : "Hand-picked stays around STU, sorted by what fits you best."}
              </p>
            </div>

            <div className={styles.resultsTools}>
              <LiveControls
                lastUpdated={lastUpdated}
                loading={status === "loading"}
                onRefresh={() => loadHostels()}
                dark
              />

              <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>
                Sort by
              </label>
              <div className={styles.selectShell}>
                <select
                  id="sort"
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <IconChevronDown size={16} className={styles.selectChevron} />
              </div>
              </div>
            </div>
          </section>

          {view === "map" ? (
            <FindHostelMap hostels={results} />
          ) : status === "loading" ? (
            <div className={styles.grid}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <HostelSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              onClear={status === "error" ? loadHostels : clearAll}
              filtered={chips.length > 0}
              error={status === "error"}
            />
          ) : (
            <>
              <div className={styles.grid}>
                {shown.map((h) => (
                  <HostelCard key={h.id} hostel={h} />
                ))}
              </div>
              {hasMore && (
                <div className={styles.loadMoreWrap}>
                  <button
                    type="button"
                    className="dabi-btn dabi-btn-secondary"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <FilterModal
        open={modalOpen}
        value={filters}
        availableFacilities={availableFacilities}
        onClose={() => setModalOpen(false)}
        onApply={(next) => {
          runSearch(next);
          setModalOpen(false);
        }}
      />
    </>
  );
}
