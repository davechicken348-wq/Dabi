import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, NavLink, useSearchParams } from "react-router-dom";
import shared from "../admin.module.css";
import {
  fetchHostels,
  fetchOwners,
  deleteHostel,
  updateHostel,
} from "../../services/api";
import type { AdminHostel, Owner, Availability } from "../types";
import { usePolling } from "../usePolling";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPin,
  IconEye,
  IconMore,
  IconCheck,
  IconShield,
  IconBed,
} from "../../components/Icons/Icons";
import {
  IconGrid,
  IconBook,
  IconSquarePlus,
  IconSearch,
  IconChevronDown,
  IconList,
} from "./hostelPageIcons";
import styles from "./Hostels.module.css";

const AVAILABILITY: Availability[] = ["Available", "Limited", "Full"];

const ghs = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

function availabilityBadge(a: Availability): string {
  if (a === "Available") return styles.badgeAvailable;
  if (a === "Limited") return styles.badgeLimited;
  return styles.badgeFull;
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const current = options.find((o) => o.value === value);
  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <button
        type="button"
        className={styles.filterBtn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={styles.filterBtnText}>
          {label}: <span className={styles.filterValue}>{current?.label ?? value}</span>
        </span>
        <span className={styles.filterChevron}>
          <IconChevronDown size={14} />
        </span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitem"
              className={`${styles.menuItem} ${o.value === value ? styles.menuItemActive : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Hostels() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [availFilter, setAvailFilter] = useState<"All" | Availability>("All");
  const [verifiedFilter, setVerifiedFilter] = useState<"All" | "Verified" | "Unverified">("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc" | "newest">("name");

  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-kebab]")) setMenuId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuId(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  type ViewMode = "grid" | "list";
  const VIEW_KEY = "dabi.admin.hostels.view";
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "grid" || saved === "list" ? saved : "grid";
  });
  function changeView(next: ViewMode) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  }

  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const avail = params.get("avail");
    const verified = params.get("verified");
    if (avail === "Limited" || avail === "Full") setAvailFilter(avail);
    if (verified === "Verified" || verified === "Unverified")
      setVerifiedFilter(verified);
    if (avail || verified) {
      if (avail) params.delete("avail");
      if (verified) params.delete("verified");
      setParams(params, { replace: true });
    }
  }, [params, setParams, setAvailFilter, setVerifiedFilter]);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const [h, o] = await Promise.all([fetchHostels(), fetchOwners()]);
      setHostels(h);
      setOwners(o);
      setLastUpdated(new Date());
      setState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load hostels.";
      if (showLoading) {
        setError(message);
        setState("error");
      }
    }
  }

  usePolling(() => refresh(false));

  useEffect(() => {
    refresh();
  }, []);

  const ownerName = useMemo(() => {
    const map = new Map<string, Owner>();
    owners.forEach((o) => map.set(o.id, o));
    return map;
  }, [owners]);

  const counts = useMemo(() => {
    let available = 0;
    let needsAttention = 0;
    let verified = 0;
    for (const h of hostels) {
      if (h.availability === "Available") available++;
      if (h.availability === "Limited" || h.availability === "Full") needsAttention++;
      if (h.verified) verified++;
    }
    return { total: hostels.length, available, needsAttention, verified };
  }, [hostels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = hostels.filter((h) => {
      const matchesQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (ownerName.get(h.ownerId ?? "")?.name.toLowerCase().includes(q) ?? false);
      const matchesAvail = availFilter === "All" || h.availability === availFilter;
      const matchesVerified =
        verifiedFilter === "All" ||
        (verifiedFilter === "Verified" ? h.verified : !h.verified);
      const matchesOwner = ownerFilter === "all" || h.ownerId === ownerFilter;
      return matchesQuery && matchesAvail && matchesVerified && matchesOwner;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.pricePerYear - b.pricePerYear;
        case "price-desc":
          return b.pricePerYear - a.pricePerYear;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [hostels, query, availFilter, verifiedFilter, ownerFilter, sort, ownerName]);

  const verifiedHostels = useMemo(
    () => hostels.filter((h) => h.verified),
    [hostels]
  );
  const featured = useMemo(() => {
    const base = verifiedHostels.length > 0 ? verifiedHostels : hostels;
    return base.slice(0, 3);
  }, [verifiedHostels, hostels]);
  const [wide, ...wideRest] = featured;

  async function handleDelete() {
    if (!confirmId) return;
    await deleteHostel(confirmId);
    setConfirmId(null);
    refresh();
  }

  async function toggleVerify(h: AdminHostel) {
    await updateHostel(h.id, { verified: !h.verified });
    setMenuId(null);
    refresh();
  }

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load hostels"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading hostels. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: refresh }}
      />
    );
  }

  return (
    <div className={shared.sbShell}>
      {/* Internal sub-sidebar — mirrors the Owners' sbSubNav */}
      <aside className={shared.sbSubNav}>
        <div className={shared.sbSubNavHeader}>
          <h4 className={shared.sbSubNavTitle}>Hostels</h4>
        </div>
        <nav className={shared.sbSubNavNav}>
          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Manage</div>
            <div className={shared.sbSubGroupItems}>
              <NavLink
                to="/admin/hostels"
                end
                className={({ isActive }) =>
                  `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                }
              >
                <span className={shared.sbSubItemIcon}>
                  <IconGrid size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Explore all</span>
              </NavLink>
            </div>
          </div>

          <div className={shared.sbSubDivider} />

          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Verified · {counts.verified}</div>
            <div className={shared.sbSubGroupItems}>
              {verifiedHostels.slice(0, 8).map((h) =>
                h.image ? (
                  <NavLink
                    key={h.id}
                    to={`/admin/hostels/${h.id}/edit`}
                    className={({ isActive }) =>
                      `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                    }
                  >
                    <img
                      src={h.image}
                      alt=""
                      loading="lazy"
                      className={shared.sbSubItemIcon}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid var(--adm-line-strong)",
                        background: "var(--adm-white)",
                      }}
                    />
                    <span className={shared.sbSubItemLabel}>{h.name}</span>
                  </NavLink>
                ) : (
                  <NavLink
                    key={h.id}
                    to={`/admin/hostels/${h.id}/edit`}
                    className={({ isActive }) =>
                      `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                    }
                  >
                    <span className={shared.sbSubItemIcon}>
                      <IconBed size={16} />
                    </span>
                    <span className={shared.sbSubItemLabel}>{h.name}</span>
                  </NavLink>
                )
              )}
            </div>
          </div>

          <div className={shared.sbSubDivider} />

          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Resources</div>
            <div className={shared.sbSubGroupItems}>
              <NavLink
                to="/admin/hostels/new"
                className={({ isActive }) =>
                  `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                }
              >
                <span className={shared.sbSubItemIcon}>
                  <IconSquarePlus size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Add listing</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-up-right opacity-50"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
              </NavLink>
              <NavLink
                to="/admin/hostels/new"
                className={({ isActive }) =>
                  `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                }
              >
                <span className={shared.sbSubItemIcon}>
                  <IconSquarePlus size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Add listing</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-up-right opacity-50"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className={shared.sbContent}>
          <header className={styles.pageHeader}>
            <div className={styles.pageHeaderMeta}>
              <div className={styles.pageHeaderSummary}>
                <h1 className={styles.title}>Your hostels</h1>
                <div className={styles.sub}>
                  Explore and manage every Dabi listing from one place — {counts.total}{" "}
                  {counts.total === 1 ? "home" : "homes"} on the map.
                </div>
              </div>
              <div className={styles.pageHeaderActions}>
                <button className={styles.docsBtn} type="button" onClick={() => navigate("/admin/docs")}>
                  <span className={styles.docsBtnIcon}>
                    <IconBook size={14} />
                  </span>
                  Docs
                </button>
                <button className={styles.addBtn} type="button" onClick={() => navigate("/admin/hostels/new")}>
                  <IconPlus size={16} />
                  Add hostel
                </button>
              </div>
            </div>
          </header>

          <div className={styles.contentPad}>
            {state === "ready" && featured.length > 0 && (
              <section className={styles.featured}>
                <div className={styles.featuredHead}>
                  <h2 className={styles.sectionTitle}>Featured hostels</h2>
                </div>
                <div className={styles.featuredGrid}>
                  <div className={`${styles.featCard} ${styles.featCardWide}`}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={styles.featWideInner}
                      onClick={() => navigate(`/admin/hostels/${wide.id}/edit`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/admin/hostels/${wide.id}/edit`);
                      }}
                    >
                      <div className={styles.featWideBody}>
                        <div className={styles.featWideName}>{wide.name}</div>
                        <p className={styles.featWideDesc}>
                          {wide.location} · {wide.roomType}
                          {wide.totalRooms != null ? ` · ${wide.totalRooms} rooms` : ""}
                        </p>
                        <div className={styles.featWideFoot}>
                          <span className={`${styles.badge} ${availabilityBadge(wide.availability)}`}>
                            {wide.availability}
                          </span>
                          {wide.verified && (
                            <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
                          )}
                          <span className={styles.builtBy}>
                            {ghs.format(wide.pricePerYear)} <span>/yr</span>
                          </span>
                        </div>
                      </div>
                      <span
                        className={styles.featWideCover}
                        style={{ backgroundImage: `url(${wide.image})` }}
                      />
                    </div>
                  </div>
                  {wideRest.map((h) => (
                    <div key={h.id} className={styles.featCard}>
                      <div
                        role="button"
                        tabIndex={0}
                        className={styles.featSmallInner}
                        onClick={() => navigate(`/admin/hostels/${h.id}/edit`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") navigate(`/admin/hostels/${h.id}/edit`);
                        }}
                      >
                        <div className={styles.featSmallTop}>
                          {h.image ? (
                            <img className={styles.cardThumb} src={h.image} alt="" loading="lazy" />
                          ) : (
                            <span className={styles.cardThumbFallback}>
                              <IconBed size={20} />
                            </span>
                          )}
                        </div>
                        <div className={styles.featSmallName}>{h.name}</div>
                        <p className={styles.featSmallDesc}>{h.location}</p>
                        <div className={styles.featSmallFoot}>
                          <span className={`${styles.badge} ${availabilityBadge(h.availability)}`}>
                            {h.availability}
                          </span>
                          <span className={styles.builtBy}>
                            {ghs.format(h.pricePerYear)} <span>/yr</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                  <IconSearch size={14} />
                </span>
                <input
                  className={styles.searchInput}
                  placeholder="Search name, location or owner…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Dropdown
                label="Availability"
                value={availFilter}
                options={[
                  { value: "All", label: "All" },
                  ...AVAILABILITY.map((a) => ({ value: a, label: a })),
                ]}
                onChange={(v) => setAvailFilter(v as typeof availFilter)}
              />
              <Dropdown
                label="Status"
                value={verifiedFilter}
                options={[
                  { value: "All", label: "All" },
                  { value: "Verified", label: "Verified" },
                  { value: "Unverified", label: "Needs review" },
                ]}
                onChange={(v) => setVerifiedFilter(v as typeof verifiedFilter)}
              />
              <Dropdown
                label="Owner"
                value={ownerFilter}
                options={[
                  { value: "all", label: "All owners" },
                  ...owners.map((o) => ({ value: o.id, label: o.name })),
                ]}
                onChange={setOwnerFilter}
              />
              <Dropdown
                label="Sort"
                value={sort}
                options={[
                  { value: "name", label: "Name A–Z" },
                  { value: "price-asc", label: "Price ↑" },
                  { value: "price-desc", label: "Price ↓" },
                  { value: "newest", label: "Newest" },
                ]}
                onChange={(v) => setSort(v as typeof sort)}
              />
              <LiveControls
                lastUpdated={lastUpdated}
                loading={state === "loading"}
                onRefresh={() => refresh()}
              />
              <div className={styles.spacer} />
              <div className={styles.viewToggle} role="group" aria-label="List layout">
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                  onClick={() => changeView("grid")}
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <IconGrid size={13} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                  onClick={() => changeView("list")}
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  title="List view"
                >
                  <IconList size={13} />
                </button>
              </div>
            </div>

            {state === "loading" ? (
              <div className={styles.loadingGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyTitle}>No hostels match</div>
                <div className={styles.emptyText}>
                  Try clearing a filter, or add a new listing to get started.
                </div>
              </div>
            ) : view === "grid" ? (
              <div className={styles.grid}>
                {filtered.map((h) => {
                  const owner = h.ownerId ? ownerName.get(h.ownerId) : undefined;
                  return (
                    <div key={h.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        {h.image ? (
                          <img className={styles.cardThumb} src={h.image} alt="" loading="lazy" />
                        ) : (
                          <span className={styles.cardThumbFallback}>
                            <IconBed size={20} />
                          </span>
                        )}
                        <button
                          className={styles.cardKebab}
                          type="button"
                          data-kebab
                          aria-label={`Actions for ${h.name}`}
                          onClick={() => setMenuId(menuId === h.id ? null : h.id)}
                        >
                          <IconMore size={16} />
                        </button>
                        {menuId === h.id && (
                          <div className={styles.kebabMenu} data-kebab>
                            <button
                              className={styles.kebabItem}
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                window.open(`/hostel/${h.id}`, "_blank", "noreferrer");
                              }}
                            >
                              <IconEye size={16} /> View on site
                            </button>
                            <button
                              className={styles.kebabItem}
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                navigate(`/admin/hostels/${h.id}/edit`);
                              }}
                            >
                              <IconEdit size={16} /> Edit details
                            </button>
                            <button
                              className={styles.kebabItem}
                              type="button"
                              onClick={() => toggleVerify(h)}
                            >
                              <IconShield size={16} />
                              {h.verified ? "Remove verification" : "Mark verified"}
                            </button>
                            <button
                              className={`${styles.kebabItem} ${styles.kebabItemDanger}`}
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                setConfirmId(h.id);
                              }}
                            >
                              <IconTrash size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={styles.cardName}>{h.name}</div>
                      <p className={styles.cardDesc}>
                        <IconPin size={12} style={{ verticalAlign: "-2px" }} /> {h.location} ·{" "}
                        {h.roomType}
                        {h.totalRooms != null ? ` · ${h.totalRooms} rooms` : ""}
                      </p>
                      <div className={styles.cardFoot}>
                        <span className={`${styles.badge} ${availabilityBadge(h.availability)}`}>
                          {h.availability}
                        </span>
                        {h.verified && (
                          <span className={`${styles.badge} ${styles.badgeVerified}`}>
                            <IconCheck size={10} /> Verified
                          </span>
                        )}
                        <span className={styles.price}>
                          <b>{ghs.format(h.pricePerYear)}</b> /yr
                        </span>
                        <span className={styles.builtBy}>
                          {owner ? `by ${owner.name}` : "Unassigned"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.gridList}>
                {filtered.map((h) => {
                  const owner = h.ownerId ? ownerName.get(h.ownerId) : undefined;
                  return (
                    <div key={h.id} className={styles.listRow}>
                      {h.image ? (
                        <img className={styles.listThumb} src={h.image} alt="" loading="lazy" />
                      ) : (
                        <span className={styles.listThumbFallback}>
                          <IconBed size={20} />
                        </span>
                      )}
                      <div className={styles.listMain}>
                        <div className={styles.listName}>{h.name}</div>
                        <p className={styles.listDesc}>
                          <IconPin size={12} style={{ verticalAlign: "-2px" }} /> {h.location} ·{" "}
                          {h.roomType}
                          {h.totalRooms != null ? ` · ${h.totalRooms} rooms` : ""} ·{" "}
                          {owner ? owner.name : "Unassigned"}
                        </p>
                      </div>
                      <div className={styles.listMeta}>
                        <span className={`${styles.badge} ${availabilityBadge(h.availability)}`}>
                          {h.availability}
                        </span>
                        {h.verified && (
                          <span className={`${styles.badge} ${styles.badgeVerified}`}>
                            <IconCheck size={10} /> Verified
                          </span>
                        )}
                        <span className={styles.listPrice}>
                          <b>{ghs.format(h.pricePerYear)}</b> /yr
                        </span>
                      </div>
                      <button
                        className={styles.cardKebab}
                        type="button"
                        aria-label={`Actions for ${h.name}`}
                        onClick={() => setMenuId(menuId === h.id ? null : h.id)}
                      >
                        <IconMore size={16} />
                      </button>
                      {menuId === h.id && (
                        <div className={styles.kebabMenu}>
                          <button
                            className={styles.kebabItem}
                            type="button"
                            onClick={() => {
                              setMenuId(null);
                              window.open(`/hostel/${h.id}`, "_blank", "noreferrer");
                            }}
                          >
                            <IconEye size={16} /> View on site
                          </button>
                          <button
                            className={styles.kebabItem}
                            type="button"
                            onClick={() => {
                              setMenuId(null);
                              navigate(`/admin/hostels/${h.id}/edit`);
                            }}
                          >
                            <IconEdit size={16} /> Edit details
                          </button>
                          <button
                            className={styles.kebabItem}
                            type="button"
                            onClick={() => toggleVerify(h)}
                          >
                            <IconShield size={16} />
                            {h.verified ? "Remove verification" : "Mark verified"}
                          </button>
                          <button
                            className={`${styles.kebabItem} ${styles.kebabItemDanger}`}
                            type="button"
                            onClick={() => {
                              setMenuId(null);
                              setConfirmId(h.id);
                            }}
                          >
                            <IconTrash size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {confirmId && (
        <Modal title="Delete hostel?" onClose={() => setConfirmId(null)}>
          <p style={{ marginBottom: 18, color: "var(--adm-muted)", fontSize: "0.875rem" }}>
            This will permanently remove the listing and unassign it from its owner. This
            action can&rsquo;t be undone.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="dabi-btn dabi-btn-ghost"
              onClick={() => setConfirmId(null)}
            >
              Cancel
            </button>
            <button className="dabi-btn dabi-btn-danger" onClick={handleDelete}>
              <IconTrash size={16} />
              Delete
            </button>
          </div>
        </Modal>
      )}
      </div>
  );
}
