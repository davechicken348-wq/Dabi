import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchHostels,
  fetchOwners,
  deleteHostel,
  updateHostel,
} from "../../services/api";
import type { AdminHostel, Owner, Availability } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPin,
  IconEye,
  IconMore,
  IconCheck,
  IconShield,
  IconBolt,
  IconBed,
  IconList,
  IconGrid,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

const AVAILABILITY: Availability[] = ["Available", "Limited", "Full"];

const ghs = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  type ViewMode = "table" | "grid";
  const VIEW_KEY = "dabi.admin.hostels.view";
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "grid" || saved === "table" ? saved : "table";
  });
  function changeView(next: ViewMode) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  }

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
    let unverified = 0;
    for (const h of hostels) {
      if (h.availability === "Available") available++;
      if (h.availability === "Limited" || h.availability === "Full") needsAttention++;
      if (!h.verified) unverified++;
    }
    return { total: hostels.length, available, needsAttention, unverified };
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
    <div>
      <section className={styles.dashHero}>
        <div className={styles.dashHeroMain}>
          <span className={styles.dashEyebrow}>
            <IconBed size={14} /> Listings
          </span>
          <h1 className={styles.dashGreeting}>
            Every hostel is a home waiting to happen.
          </h1>
          <p className={styles.dashGreetingSub}>
            You&rsquo;re caring for <b>{counts.total}</b>{" "}
            {counts.total === 1 ? "listing" : "listings"}
            {counts.needsAttention > 0
              ? `, and ${counts.needsAttention} ${counts.needsAttention === 1 ? "needs" : "need"} your attention.`
              : ". All looking healthy — lovely."}
          </p>
          <div
            className={styles.dashHeroLive}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
          >
            <LiveControls
              lastUpdated={lastUpdated}
              loading={state === "loading"}
              onRefresh={() => refresh()}
            />
            <button
              className={`dabi-btn dabi-btn-primary ${styles.btnPrimary}`}
              onClick={() => navigate("/admin/hostels/new")}
            >
              <IconPlus size={18} />
              Add hostel
            </button>
          </div>
        </div>
        <div className={styles.dashHeroArt} aria-hidden="true">
          <img
            src="/illustrations/Travel--Streamline-Manchester.png"
            alt=""
            width={138}
            height={138}
          />
        </div>
      </section>

      <div className={styles.statGrid}>
        <div className={`${styles.statCard} ${styles.toneGreen}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total listings</span>
            <span className={styles.statIcon}>
              <IconBed size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.total}</div>
          <div className={styles.statHint}>Homes on Dabi</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneEmerald}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Available</span>
            <span className={styles.statIcon}>
              <IconCheck size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.available}</div>
          <div className={styles.statHint}>Ready for students</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneGold}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Needs attention</span>
            <span className={styles.statIcon}>
              <IconBolt size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.needsAttention}</div>
          <div className={styles.statHint}>Limited or full</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneBlue}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Unverified</span>
            <span className={styles.statIcon}>
              <IconShield size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.unverified}</div>
          <div className={styles.statHint}>Awaiting your review</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <IconSearch size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, location or owner…"
          />
        </label>
        <div className={styles.filterGroup}>
          {(["All", ...AVAILABILITY] as const).map((a) => (
            <button
              key={a}
              className={`${styles.chip} ${availFilter === a ? styles.chipActive : ""}`}
              onClick={() => setAvailFilter(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <select
          className={styles.selectInline}
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
          aria-label="Filter by verification"
        >
          <option value="All">All listings</option>
          <option value="Verified">Verified</option>
          <option value="Unverified">Needs review</option>
        </select>
        <span className={styles.spacer} />
        <select
          className={styles.selectInline}
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          aria-label="Filter by owner"
        >
          <option value="all">All owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          className={styles.selectInline}
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort hostels"
        >
          <option value="name">Name A–Z</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest first</option>
        </select>
        <div className={styles.viewToggle} role="group" aria-label="List layout">
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "table" ? styles.viewBtnActive : ""}`}
            onClick={() => changeView("table")}
            aria-pressed={view === "table"}
            aria-label="Table view"
            title="Table view"
          >
            <IconList size={17} />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
            onClick={() => changeView("grid")}
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            title="Grid view"
          >
            <IconGrid size={17} />
          </button>
        </div>
      </div>

      <p className={styles.resultsLine}>
        Showing <b>{filtered.length}</b> of <b>{hostels.length}</b> hostels
      </p>

      {state === "loading" ? (
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skTableRow} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
          <div className={styles.panel}>
            <AdminEmptyState
              variant="empty"
              illustration="/illustrations/Rest-3--Streamline-Brooklyn.png"
              title="No hostels match"
              text="Try clearing a filter, or add a new listing to get started."
              action={{
                label: (
                  <>
                    <IconPlus size={16} /> Add hostel
                  </>
                ),
                onClick: () => navigate("/admin/hostels/new"),
              }}
            />
          </div>
      ) : (
        <div className={styles.listArea} data-view={view}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hostel</th>
                  <th>Price</th>
                  <th>Room</th>
                  <th>Availability</th>
                  <th>Verified</th>
                  <th>Owner</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => {
                  const owner = h.ownerId ? ownerName.get(h.ownerId) : undefined;
                  return (
                    <tr key={h.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img className={styles.cellThumb} src={h.image} alt="" />
                          <div>
                            <div className={styles.cellTitle}>{h.name}</div>
                            <div className={styles.cellSub}>
                              <IconPin size={12} style={{ verticalAlign: "-2px" }} /> {h.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.priceCell}>
                        {ghs.format(h.pricePerYear)} <small>/yr</small>
                      </td>
                       <td className={styles.cellSub}>
                         {h.roomType}
                         {h.totalRooms != null ? ` · ${h.totalRooms} rooms` : ""}
                       </td>
                      <td>
                        <Badge variant={h.availability}>{h.availability}</Badge>
                      </td>
                      <td>
                        {h.verified ? (
                          <span className={styles.verifiedCell}>
                            <IconCheck size={14} /> Yes
                          </span>
                        ) : (
                          <span className={styles.verifiedNo}>—</span>
                        )}
                      </td>
                      <td>
                        {owner ? (
                          <span className={styles.ownerCell}>
                            <span className={styles.ownerDot}>
                              {ownerInitials(owner.name)}
                            </span>
                            {owner.name}
                          </span>
                        ) : (
                          <span className={styles.cellSub}>Unassigned</span>
                        )}
                      </td>
                      <td className={styles.cellSub}>{dateFmt.format(new Date(h.createdAt))}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <a
                            className={styles.btnIcon}
                            href={`/hostel/${h.id}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View ${h.name}`}
                            title="View on site"
                          >
                            <IconEye size={16} />
                          </a>
                          <div className={styles.actionMenuWrap}>
                            <button
                              className={styles.btnIcon}
                              onClick={() => setMenuId(menuId === h.id ? null : h.id)}
                              aria-label={`Actions for ${h.name}`}
                            >
                              <IconMore size={16} />
                            </button>
                            {menuId === h.id && (
                              <>
                                <button
                                  className={styles.scrim}
                                  style={{ position: "fixed", zIndex: 35 }}
                                  aria-label="Close menu"
                                  onClick={() => setMenuId(null)}
                                />
                                <div className={styles.actionMenu}>
                                  <div className={styles.actionMenuLabel}>Manage</div>
                                  <button
                                    className={styles.actionMenuItem}
                                    onClick={() => {
                                      setMenuId(null);
                                      navigate(`/admin/hostels/${h.id}/edit`);
                                    }}
                                  >
                                    <IconEdit size={16} /> Edit details
                                  </button>
                                  <button
                                    className={styles.actionMenuItem}
                                    onClick={() => toggleVerify(h)}
                                  >
                                    <IconShield size={16} />
                                    {h.verified ? "Remove verification" : "Mark verified"}
                                  </button>
                                  <button
                                    className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                                    onClick={() => {
                                      setMenuId(null);
                                      setConfirmId(h.id);
                                    }}
                                  >
                                    <IconTrash size={16} /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.hostelGrid}>
            {filtered.map((h) => {
              const owner = h.ownerId ? ownerName.get(h.ownerId) : undefined;
              return (
                <div key={h.id} className={styles.hostelCard}>
                  <div className={styles.hostelCardMedia}>
                    <img className={styles.hostelCardImg} src={h.image} alt="" />
                    {h.verified && (
                      <span className={styles.hostelCardVerified}>
                        <IconCheck size={12} /> Verified
                      </span>
                    )}
                    <a
                      className={styles.hostelCardView}
                      href={`/hostel/${h.id}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View ${h.name} on site`}
                      title="View on site"
                    >
                      <IconEye size={15} />
                    </a>
                    <span className={styles.hostelCardPrice}>
                      {ghs.format(h.pricePerYear)} <small>/yr</small>
                    </span>
                  </div>
                  <div className={styles.hostelCardBody}>
                    <div className={styles.hostelCardHead}>
                      <div className={styles.hostelCardName}>{h.name}</div>
                      <div className={styles.hostelCardLoc}>
                        <IconPin size={12} style={{ verticalAlign: "-2px" }} /> {h.location}
                      </div>
                    </div>
                    <div className={styles.hostelCardStats}>
                      <span className={styles.hostelCardRoom}>
                        {h.roomType}
                        {h.totalRooms != null ? ` · ${h.totalRooms} rooms` : ""}
                      </span>
                      <Badge variant={h.availability}>{h.availability}</Badge>
                    </div>
                    <div className={styles.hostelCardFoot}>
                      {owner ? (
                        <span className={styles.ownerCell}>
                          <span className={styles.ownerDot}>
                            {ownerInitials(owner.name)}
                          </span>
                          {owner.name}
                        </span>
                      ) : (
                        <span className={styles.cellSub}>Unassigned</span>
                      )}
                      <span className={styles.cellSub}>
                        {dateFmt.format(new Date(h.createdAt))}
                      </span>
                    </div>
                  </div>
                  <div className={styles.hostelCardActions}>
                    <button
                      className={styles.btnIcon}
                      onClick={() => navigate(`/admin/hostels/${h.id}/edit`)}
                      aria-label={`Edit ${h.name}`}
                      title="Edit details"
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      className={styles.btnIcon}
                      onClick={() => toggleVerify(h)}
                      aria-label={`${h.verified ? "Remove verification" : "Mark verified"} for ${h.name}`}
                      title={h.verified ? "Remove verification" : "Mark verified"}
                    >
                      <IconShield size={16} />
                    </button>
                    <button
                      className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                      onClick={() => setConfirmId(h.id)}
                      aria-label={`Delete ${h.name}`}
                      title="Delete"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmId && (
        <Modal title="Delete hostel?" onClose={() => setConfirmId(null)}>
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            This will permanently remove the listing and unassign it from its
            owner. This action can&rsquo;t be undone.
          </p>
          <div className={styles.formActions}>
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
