import { useEffect, useMemo, useState } from "react";
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
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import { usePolling } from "../usePolling";
import {
  IconSearch,
  IconEye,
  IconTrash,
  IconCheck,
  IconCalendar,
  IconUsers,
  IconBed,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

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

const STATUS_FILTERS: ("All" | TenancyStatus)[] = ["All", "pending", "active", "ended"];

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

export default function Tenancies() {
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TenancyStatus>("All");
  const [view, setView] = useState<Tenancy | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tenancies, query, statusFilter]);

  const pendingCount = tenancies.filter((t) => t.status === "pending").length;
  const activeCount = tenancies.filter((t) => t.status === "active").length;
  const endedCount = tenancies.filter((t) => t.status === "ended").length;

  async function handleConfirm() {
    if (!view) return;
    await apiConfirm(view.id);
    const list = await refresh(false);
    setView(list.find((t) => t.id === view.id) ?? null);
    setLastUpdated(new Date());
  }

  async function handleEnd() {
    if (!view) return;
    await apiEnd(view.id);
    const list = await refresh(false);
    setView(list.find((t) => t.id === view.id) ?? null);
    setLastUpdated(new Date());
  }

  async function handleDelete() {
    if (!confirmId) return;
    await apiDelete(confirmId);
    setConfirmId(null);
    setView(null);
    refresh(false);
  }

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

  return (
    <div>
      <section className={styles.dashHero}>
        <div className={styles.dashHeroMain}>
          <span className={styles.dashEyebrow}>
            <IconBed size={14} /> Tenancies
          </span>
          <h1 className={styles.dashGreeting}>
            Help students settle into a place that feels like home.
          </h1>
          <p className={styles.dashGreetingSub}>
            {pendingCount} {pendingCount === 1 ? "tenancy is" : "tenancies are"} waiting for
            your confirmation. Each one you approve frees a bed and keeps a promise.
          </p>
          <div className={styles.dashHeroLive}>
            <LiveControls
              lastUpdated={lastUpdated}
              loading={loadState === "loading"}
              onRefresh={() => refresh()}
            />
          </div>
        </div>
        <div className={styles.dashHeroArt} aria-hidden="true">
          <img
            src="/illustrations/Being-Happy-1--Streamline-Brooklyn.png"
            alt=""
            width={138}
            height={138}
          />
        </div>
      </section>

      <div className={styles.statGrid}>
        <div className={`${styles.statCard} ${styles.toneGold}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statIcon}>
              <IconCalendar size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{pendingCount}</div>
          <div className={styles.statHint}>Awaiting your confirmation</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneEmerald}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statIcon}>
              <IconCheck size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{activeCount}</div>
          <div className={styles.statHint}>Students settled in</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneBlue}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Ended</span>
            <span className={styles.statIcon}>
              <IconUsers size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{endedCount}</div>
          <div className={styles.statHint}>Completed stays</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneGreen}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>All tenancies</span>
            <span className={styles.statIcon}>
              <IconBed size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{tenancies.length}</div>
          <div className={styles.statHint}>Total records</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <IconSearch size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenancies…"
          />
        </label>
        <div className={styles.filterGroup}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "All" ? "All" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.resultsLine}>
        Showing <b>{filtered.length}</b> of <b>{tenancies.length}</b> tenancies
      </p>

      <div className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Occupant</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Move-in</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loadState === "loading" ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div className={styles.skeleton} style={{ height: 18, margin: "8px 0" }} />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      variant="empty"
                      illustration="/illustrations/Faq-1--Streamline-Brooklyn.png"
                      eyebrow="No tenancies"
                      title="Nothing here yet."
                      text="When a student requests to reserve a room, the pending tenancy will appear here for you to confirm with the owner."
                      hint="Confirmations keep availability honest across the site."
                      action={{ label: "Refresh", onClick: () => refresh() }}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.personCell}>
                        <span
                          className={styles.avatar}
                          style={{ background: personColor(t.occupantName) }}
                        >
                          {initials(t.occupantName)}
                        </span>
                        <div>
                          <div className={styles.cellTitle}>{t.occupantName}</div>
                          <div className={styles.cellSub}>{t.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>{t.hostelName}</td>
                    <td className={styles.cellSub}>{t.roomTypeName}</td>
                    <td className={styles.cellSub}>{formatDate(t.moveIn)}</td>
                    <td>
                      <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.btnIcon}
                          onClick={() => setView(t)}
                          aria-label={`View ${t.occupantName}`}
                        >
                          <IconEye size={16} />
                        </button>
                        {t.status === "pending" && (
                          <button
                            className={`${styles.btnIcon} ${styles.btnIconOk}`}
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
                          className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                          onClick={() => setConfirmId(t.id)}
                          aria-label={`Delete ${t.occupantName}`}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Room type</span>
              <span>{view.roomTypeName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Beds</span>
              <span>{view.beds}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Move-in</span>
              <span>{formatDate(view.moveIn)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Source</span>
              <span>{view.source === "self" ? "Student request" : "Dabi"}</span>
            </div>
          </div>

          <div className={styles.formActions}>
            {view.status === "pending" && (
              <button className={styles.btnPrimary} onClick={handleConfirm}>
                <IconCheck size={16} /> Confirm tenancy
              </button>
            )}
            {view.status === "active" && (
              <button className={styles.btnPrimary} onClick={handleEnd}>
                End tenancy
              </button>
            )}
            <button className={styles.btnDanger} onClick={() => setConfirmId(view.id)}>
              <IconTrash size={16} /> Delete
            </button>
            <button className={styles.btnGhost} onClick={() => setView(null)}>
              Done
            </button>
          </div>
        </RecordModal>
      )}

      {confirmId && (
        <Modal title="Delete tenancy?" onClose={() => setConfirmId(null)}>
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            This tenancy record will be permanently removed.
          </p>
          <div className={styles.formActions}>
            <button className={styles.btnGhost} onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className={styles.btnDanger} onClick={handleDelete}>
              <IconTrash size={16} /> Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
