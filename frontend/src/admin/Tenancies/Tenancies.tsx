import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTenancies,
  confirmTenancy as apiConfirm,
  endTenancy as apiEnd,
  deleteTenancy as apiDelete,
  type TenancyDTO,
} from "../../services/api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import RecordModal from "../components/RecordModal";
import AdminEmptyState from "../components/AdminEmptyState";
import { usePolling } from "../usePolling";
import {
  IconSearch,
  IconEye,
  IconTrash,
  IconCheck,
  IconRefresh,
  IconChevronDown,
} from "../../components/Icons/Icons";
import {
  IconMessageSquareMore,
  IconTextSearch,
  IconInfo,
  IconBookOpen,
  IconArrowUpRight,
} from "../../components/Icons/Icons";
import adv from "../Enquiries/Enquiries.module.css";
import admin from "../admin.module.css";

type TenancyStatus = "pending" | "active" | "ended";

const AVATAR_TONES = ["#176b4d", "#1f6fb8", "#9c7415", "#1f8a55", "#7a4fb5"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function personColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

interface Tenancy {
  id: string;
  hostelId: string;
  hostelName: string;
  roomTypeName: string;
  occupantName: string;
  phone: string;
  beds: number;
  moveIn?: string;
  moveOut?: string;
  status: TenancyStatus;
  source: "self" | "admin";
  createdAt: string;
}

const STATUS_TABS: TenancyStatus[] = ["pending", "active", "ended"];

const statusVariant: Record<TenancyStatus, "New" | "Active" | "Resolved"> = {
  pending: "New",
  active: "Active",
  ended: "Resolved",
};

const statusLabel: Record<TenancyStatus, string> = {
  pending: "Pending",
  active: "Active",
  ended: "Ended",
};

/* Maps tenancy status onto the reference's error / warning / info
   iconography and colour tokens (pending = attention, active = in
   progress, ended = done). */
const STATUS_TAB: Record<
  TenancyStatus,
  { iconClass: string; label: string; countLabel: (n: number) => string }
> = {
  pending: {
    iconClass: adv.tabIconError,
    label: "Pending",
    countLabel: (n) => `${n} pending`,
  },
  active: {
    iconClass: adv.tabIconWarning,
    label: "Active",
    countLabel: (n) => `${n} active`,
  },
  ended: {
    iconClass: adv.tabIconInfo,
    label: "Ended",
    countLabel: (n) => `${n} ended`,
  },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

function normalize(dto: TenancyDTO): Tenancy {
  return {
    id: dto.id,
    hostelId: dto.hostelId,
    hostelName: dto.hostelName,
    roomTypeName: dto.roomType,
    occupantName: dto.occupantName,
    phone: dto.phone,
    beds: dto.beds,
    moveIn: dto.moveInDate,
    moveOut: dto.moveOutDate,
    status: dto.status.toLowerCase() as TenancyStatus,
    source: dto.source === "admin" ? "admin" : "self",
    createdAt: dto.createdAt,
  };
}

function exportCsv(rows: Tenancy[]) {
  const headers = [
    "Occupant",
    "Phone",
    "Hostel",
    "Room type",
    "Beds",
    "Move-in",
    "Source",
    "Status",
    "Created",
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.occupantName,
      r.phone,
      r.hostelName,
      r.roomTypeName,
      r.beds,
      r.moveIn ?? "",
      r.source === "admin" ? "Dabi" : "Student request",
      r.status,
      r.createdAt,
    ]
      .map(escape)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tenancies.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Tenancies() {
  const navigate = useNavigate();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"All" | TenancyStatus>("All");
  const [view, setView] = useState<Tenancy | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(false);

  async function refresh(showLoading = true): Promise<Tenancy[]> {
    if (showLoading) {
      setLoadState("loading");
      setError(null);
    }
    try {
      const list = (await fetchTenancies()).map(normalize);
      setTenancies(list);
      setLastUpdated(new Date());
      setLoadState("ready");
      return list;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load tenancies.";
      if (showLoading) {
        setError(message);
        setLoadState("error");
      }
      return [];
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  usePolling(() => {
    void refresh(false);
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenancies.filter((t) => {
      const matchesQuery =
        !q ||
        t.occupantName.toLowerCase().includes(q) ||
        t.hostelName.toLowerCase().includes(q) ||
        t.roomTypeName.toLowerCase().includes(q);
      const matchesStatus = activeStatus === "All" || t.status === activeStatus;
      return matchesQuery && matchesStatus;
    });
  }, [tenancies, query, activeStatus]);

  const pendingCount = tenancies.filter((t) => t.status === "pending").length;
  const activeCount = tenancies.filter((t) => t.status === "active").length;
  const endedCount = tenancies.filter((t) => t.status === "ended").length;

  const updatedLabel = useMemo(() => {
    if (!lastUpdated) return "";
    const secs = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (secs < 5) return "Updated just now";
    if (secs < 60) return `Updated ${secs}s ago`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `Updated ${mins}m ago`;
    return `Updated ${Math.round(mins / 60)}h ago`;
  }, [lastUpdated]);

  async function handleConfirm() {
    if (!view) return;
    await apiConfirm(view.id);
    const list = await refresh(false);
    setView(list.find((t) => t.id === view.id) ?? null);
  }

  async function handleEnd() {
    if (!view) return;
    await apiEnd(view.id);
    const list = await refresh(false);
    setView(list.find((t) => t.id === view.id) ?? null);
  }

  async function handleDelete() {
    if (!confirmId) return;
    await apiDelete(confirmId);
    setConfirmId(null);
    setView(null);
    refresh(false);
  }

  const emptyCopy: Record<string, { title: string; text: string }> = {
    All: {
      title: "No tenancies detected",
      text: "When a student requests to reserve a room, the pending tenancy will appear here for you to confirm with the owner.",
    },
    pending: {
      title: "No pending tenancies",
      text: "Every request has been confirmed or ended. Nice work keeping availability honest.",
    },
    active: {
      title: "No active tenancies",
      text: "No students are currently settled into a room.",
    },
    ended: {
      title: "No ended tenancies",
      text: "Completed stays will be archived here for reference.",
    },
  };

  if (loadState === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load tenancies"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading tenancies. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: () => refresh() }}
      />
    );
  }

  const railItems: { key: "All" | TenancyStatus; dot: string; count: number }[] = [
    { key: "All", dot: adv.railDotAll, count: tenancies.length },
    { key: "pending", dot: adv.railDotNew, count: pendingCount },
    { key: "active", dot: adv.railDotContacted, count: activeCount },
    { key: "ended", dot: adv.railDotResolved, count: endedCount },
  ];

  return (
    <div className={adv.shell}>
      <div className={adv.panels}>
        {/* ---------- Left rail ---------- */}
        <aside className={adv.rail}>
          <div className={adv.railHead}>
            <span className={adv.railTitle}>Tenancies</span>
          </div>
          <div className={adv.railBody}>
            {!bannerHidden && (
              <div className={adv.banner}>
                <span className={adv.bannerBadge}>New</span>
                <span className={adv.bannerTitle}>One-tap confirm</span>
                <span className={adv.bannerText}>
                  Confirm a pending request straight from its row or detail view.
                  A tap frees the bed and keeps availability honest.
                </span>
                <button
                  type="button"
                  className={adv.bannerBtn}
                  onClick={() => setBannerHidden(true)}
                >
                  Got it
                </button>
              </div>
            )}

            <span className={adv.railLabel}>Views</span>
            <nav className={adv.railNav}>
              {railItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`${adv.railItem} ${
                    activeStatus === item.key ? adv.railItemActive : ""
                  }`}
                  onClick={() => {
                    setActiveStatus(item.key);
                    setFilterOpen(false);
                  }}
                >
                  <span className={`${adv.railDot} ${item.dot}`} />
                  <span className={adv.railName}>
                    {item.key === "All" ? "All tenancies" : statusLabel[item.key as TenancyStatus]}
                  </span>
                  <span className={adv.railCount}>{item.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ---------- Main panel ---------- */}
        <section className={adv.main}>
          <div className={adv.mainHead}>
            <div>
              <h1 className={adv.mainTitle}>
                {activeStatus === "All" ? "All tenancies" : `${statusLabel[activeStatus]} tenancies`}
              </h1>
              <p className={adv.mainSub}>
                {activeStatus === "All"
                  ? "Every room reservation across Dabi."
                  : `Tenancies marked “${statusLabel[activeStatus]}”.`}
              </p>
            </div>
            <button type="button" className={adv.docBtn} onClick={() => navigate("/admin/docs")}>
              <IconBookOpen size={15} />
              <span>Docs</span>
              <IconArrowUpRight size={13} />
            </button>
          </div>

          {/* Status tabs — error / warning / info icons repurposed */}
          <div className={adv.tabs} role="tablist" aria-label="Tenancy status">
            {STATUS_TABS.map((s) => {
              const tab = STATUS_TAB[s];
              const active = activeStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${adv.tab} ${active ? adv.tabActive : ""}`}
                  onClick={() => {
                    setActiveStatus(s);
                    setFilterOpen(false);
                  }}
                >
                  <span className={adv.tabRow}>
                    <span className={`${adv.tabIcon} ${tab.iconClass}`}>
                      <IconMessageSquareMore size={14} />
                    </span>
                    <span>{tab.label}</span>
                    <span className={adv.tabInfo}>
                      <IconInfo size={12} />
                    </span>
                  </span>
                  <span className={adv.tabCount}>{tab.countLabel(
                    s === "pending" ? pendingCount : s === "active" ? activeCount : endedCount
                  )}</span>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className={adv.toolbar}>
            <div className={adv.filterPop}>
              <button
                type="button"
                className={`${adv.toolBtn} ${adv.toolBtnDashed}`}
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
              >
                <IconSearch size={14} />
                <span>Filter</span>
                <IconChevronDown size={13} />
              </button>
              {filterOpen && (
                <div className={adv.filterMenu}>
                  <input
                    className={adv.filterInput}
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search occupant, hostel or room…"
                  />
                  <p className={adv.filterHint}>
                    Matches against the occupant’s name, hostel and room type.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              className={adv.toolBtn}
              onClick={() => refresh()}
              disabled={loadState === "loading"}
            >
              <IconRefresh size={14} className={loadState === "loading" ? admin.liveSpin : undefined} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className={`${adv.toolBtn} ${adv.toolBtnPrimary}`}
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <span>Export</span>
            </button>

            <span className={adv.toolSpacer} />
            {updatedLabel && <span className={adv.updated}>{updatedLabel}</span>}
          </div>

          {/* Loading bar */}
          {loadState === "loading" && <div className={adv.loadBar} />}

          {/* Data grid */}
          <div className={adv.grid}>
            <div className={adv.gridHead}>
              <div className={adv.gridHeadCell}>Occupant</div>
              <div className={adv.gridHeadCell}>Hostel / room</div>
              <div className={adv.gridHeadCell}>Details</div>
              <div className={adv.gridHeadCell} />
            </div>
            <div className={adv.gridBody}>
              {loadState === "loading" ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={adv.gridRow}>
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className={adv.emptyState}>
                  <span className={adv.emptyStateIcon}>
                    <IconTextSearch size={26} />
                  </span>
                  <span className={adv.emptyStateTitle}>
                    {emptyCopy[activeStatus].title}
                  </span>
                  <span className={adv.emptyStateText}>
                    {emptyCopy[activeStatus].text}
                  </span>
                </div>
              ) : (
                filtered.map((t) => (
                  <div key={t.id} className={adv.gridRow}>
                    <div className={adv.cellStudent}>
                      <span
                        className={adv.cellAvatar}
                        style={{ background: personColor(t.occupantName) }}
                      >
                        {initials(t.occupantName)}
                      </span>
                      <div className={adv.cellMeta}>
                        <span className={adv.cellName}>{t.occupantName}</span>
                        <span className={adv.cellPhone}>{t.phone}</span>
                      </div>
                    </div>
                    <div className={adv.cellMeta}>
                      <span className={adv.cellMetaMain}>{t.hostelName}</span>
                      <span className={adv.cellMetaSub}>
                        {t.roomTypeName} · {formatDate(t.moveIn)}
                      </span>
                    </div>
                    <div className={adv.cellDesc}>
                      <span className={adv.cellMsg}>
                        {t.beds} bed{t.beds === 1 ? "" : "s"}
                        {t.source === "admin" ? " · Added by Dabi" : ""}
                      </span>
                      <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
                    </div>
                    <div className={adv.cellRowActions}>
                      <button
                        type="button"
                        className={admin.btnIcon}
                        onClick={() => setView(t)}
                        aria-label={`View ${t.occupantName}`}
                      >
                        <IconEye size={16} />
                      </button>
                      {t.status === "pending" && (
                        <button
                          type="button"
                          className={`${admin.btnIcon} ${admin.btnIconOk}`}
                          onClick={async () => {
                            await apiConfirm(t.id);
                            await refresh(false);
                            setLastUpdated(new Date());
                          }}
                          aria-label={`Confirm ${t.occupantName}`}
                        >
                          <IconCheck size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${admin.btnIcon} ${admin.btnIconDanger}`}
                        onClick={() => setConfirmId(t.id)}
                        aria-label={`Delete ${t.occupantName}`}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={adv.footer}>
            <div className={adv.footerCol}>
              <span className={adv.footerTitle}>Reset view</span>
              <span className={adv.footerText}>
                Clear the search and status filter to see every tenancy.
              </span>
              <button
                type="button"
                className={adv.footerBtn}
                onClick={() => {
                  setQuery("");
                  setActiveStatus("All");
                }}
              >
                Reset filters
              </button>
            </div>
            <div className={adv.footerCol}>
              <span className={adv.footerTitle}>Re-run fetch</span>
              <span className={adv.footerText}>
                Tenancies are pulled live from your Dabi backend. Re-run to check
                for new reservations.
              </span>
              <button
                type="button"
                className={adv.footerBtn}
                onClick={() => refresh()}
              >
                <IconRefresh size={14} />
                Re-run fetch
              </button>
            </div>
            <div className={adv.footerCol}>
              <span className={adv.footerTitle}>How is this generated?</span>
              <span className={adv.footerText}>
                Tenancies are created when a student reserves a room, or when an
                admin adds one directly.
              </span>
            </div>
          </div>
        </section>
      </div>

      {view && (
        <RecordModal
          name={view.occupantName}
          sub={
            <>
              <b>{view.hostelName}</b> · {view.phone}
            </>
          }
          status={{ label: statusLabel[view.status], variant: statusVariant[view.status] }}
          avatarText={initials(view.occupantName)}
          avatarColor={personColor(view.occupantName)}
          onClose={() => setView(null)}
        >
          <div className={admin.detailList}>
            <div className={admin.detailRow}>
              <span className={admin.detailKey}>Room type</span>
              <span>{view.roomTypeName}</span>
            </div>
            <div className={admin.detailRow}>
              <span className={admin.detailKey}>Beds</span>
              <span>{view.beds}</span>
            </div>
            <div className={admin.detailRow}>
              <span className={admin.detailKey}>Move-in</span>
              <span>{formatDate(view.moveIn)}</span>
            </div>
            <div className={admin.detailRow}>
              <span className={admin.detailKey}>Source</span>
              <span>{view.source === "self" ? "Student request" : "Dabi"}</span>
            </div>
          </div>

          <div className={admin.formActions}>
            {view.status === "pending" && (
              <button className={admin.btnPrimary} onClick={handleConfirm}>
                <IconCheck size={16} /> Confirm tenancy
              </button>
            )}
            {view.status === "active" && (
              <button className={admin.btnPrimary} onClick={handleEnd}>
                End tenancy
              </button>
            )}
            <button className={admin.btnDanger} onClick={() => setConfirmId(view.id)}>
              <IconTrash size={16} /> Delete
            </button>
            <button className={admin.btnGhost} onClick={() => setView(null)}>
              Done
            </button>
          </div>
        </RecordModal>
      )}

      {confirmId && (
        <Modal title="Delete tenancy?" onClose={() => setConfirmId(null)}>
          <p className={admin.muted} style={{ marginBottom: 18 }}>
            This tenancy record will be permanently removed.
          </p>
          <div className={admin.formActions}>
            <button className={admin.btnGhost} onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className={admin.btnDanger} onClick={handleDelete}>
              <IconTrash size={16} /> Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
