import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  fetchEnquiries,
  updateEnquiry,
  deleteEnquiry,
  createTenancy,
} from "../../services/api";
import type { Enquiry, EnquiryStatus } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import RecordModal from "../components/RecordModal";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconSearch,
  IconEye,
  IconTrash,
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
import styles from "./Enquiries.module.css";
import admin from "../admin.module.css";

const STATUSES: EnquiryStatus[] = ["New", "Contacted", "Resolved"];

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

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

/* Maps an enquiry status onto the reference's error / warning / info
   iconography and colour tokens. */
const STATUS_TAB: Record<
  EnquiryStatus,
  { iconClass: string; label: string; countLabel: (n: number) => string }
> = {
  New: {
    iconClass: styles.tabIconError,
    label: "New",
    countLabel: (n) => `${n} new`,
  },
  Contacted: {
    iconClass: styles.tabIconWarning,
    label: "Contacted",
    countLabel: (n) => `${n} contacted`,
  },
  Resolved: {
    iconClass: styles.tabIconInfo,
    label: "Resolved",
    countLabel: (n) => `${n} resolved`,
  },
};

function exportCsv(rows: Enquiry[]) {
  const headers = [
    "Name",
    "Phone",
    "Hostel",
    "Room type",
    "School",
    "Move-in",
    "Status",
    "Received",
    "Message",
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.name,
      r.phone,
      r.hostelName ?? "",
      r.roomType ?? "",
      r.school ?? "",
      r.moveInDate ?? "",
      r.status,
      r.createdAt,
      r.message ?? "",
    ]
      .map(escape)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enquiries.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Enquiries() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"All" | EnquiryStatus>("All");
  const [view, setView] = useState<Enquiry | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reservedId, setReservedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(false);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const list = await fetchEnquiries();
      setEnquiries(list);
      setLastUpdated(new Date());
      setState("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load enquiries.";
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

  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const status = params.get("status");
    if (status === "New" || status === "Contacted" || status === "Resolved") {
      setActiveStatus(status);
      params.delete("status");
      setParams(params, { replace: true });
    }
  }, [params, setParams, setActiveStatus]);

  useEffect(() => {
    setReservedId(null);
    setReserving(false);
  }, [view?.id]);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.hostelName ?? "").toLowerCase().includes(q) ||
        (e.phone ?? "").toLowerCase().includes(q);
      const matchesStatus = activeStatus === "All" || e.status === activeStatus;
      return matchesQuery && matchesStatus;
    });
  }, [enquiries, query, activeStatus]);

  const counts = useMemo(() => {
    const c: Record<EnquiryStatus, number> = { New: 0, Contacted: 0, Resolved: 0 };
    for (const e of enquiries) c[e.status]++;
    return c;
  }, [enquiries]);

  const updatedLabel = useMemo(() => {
    if (!lastUpdated) return "";
    const secs = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (secs < 5) return "Updated just now";
    if (secs < 60) return `Updated ${secs}s ago`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `Updated ${mins}m ago`;
    return `Updated ${Math.round(mins / 60)}h ago`;
  }, [lastUpdated]);

  async function changeStatus(id: string, status: EnquiryStatus) {
    const updated = await updateEnquiry(id, { status });
    if (updated) {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setView(updated);
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    await deleteEnquiry(confirmId);
    setConfirmId(null);
    setView(null);
    refresh();
  }

  async function reserveFromEnquiry(e: Enquiry) {
    if (!e.hostelId) return;
    setReserving(true);
    try {
      await createTenancy({
        hostelId: e.hostelId,
        hostelName: e.hostelName ?? "General",
        roomType: e.roomType ?? "",
        occupantName: e.name,
        phone: e.phone,
        moveInDate: e.moveInDate,
        source: "self",
      });
      setReservedId(e.id);
    } catch {
      setReservedId(null);
    } finally {
      setReserving(false);
    }
  }

  const emptyCopy: Record<string, { title: string; text: string }> = {
    All: {
      title: "No enquiries detected",
      text: "When students reach out about a hostel, their questions and contact details will land right here — ready for you to reply.",
    },
    New: {
      title: "No new enquiries",
      text: "Every new message has been picked up. Nice work staying on top of it.",
    },
    Contacted: {
      title: "Nothing in progress",
      text: "No conversations are awaiting a follow-up right now.",
    },
    Resolved: {
      title: "No resolved enquiries",
      text: "Resolved conversations will be archived here for reference.",
    },
  };

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load enquiries"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading enquiries. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: refresh }}
      />
    );
  }

  const railItems: { key: "All" | EnquiryStatus; dot: string; count: number }[] = [
    { key: "All", dot: styles.railDotAll, count: enquiries.length },
    { key: "New", dot: styles.railDotNew, count: counts.New },
    { key: "Contacted", dot: styles.railDotContacted, count: counts.Contacted },
    { key: "Resolved", dot: styles.railDotResolved, count: counts.Resolved },
  ];

  return (
    <div className={styles.shell}>
      <div className={styles.panels}>
        {/* ---------- Left rail ---------- */}
        <aside className={styles.rail}>
          <div className={styles.railHead}>
            <span className={styles.railTitle}>Enquiries</span>
          </div>
          <div className={styles.railBody}>
            {!bannerHidden && (
              <div className={styles.banner}>
                <span className={styles.bannerBadge}>New</span>
                <span className={styles.bannerTitle}>Saved replies are here</span>
                <span className={styles.bannerText}>
                  Draft a reply once and reuse it for every enquiry. Turn a
                  stranger into a resident, faster.
                </span>
                <button
                  type="button"
                  className={styles.bannerBtn}
                  onClick={() => setBannerHidden(true)}
                >
                  Try it
                </button>
              </div>
            )}

            <span className={styles.railLabel}>Views</span>
            <nav className={styles.railNav}>
              {railItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.railItem} ${
                    activeStatus === item.key ? styles.railItemActive : ""
                  }`}
                  onClick={() => {
                    setActiveStatus(item.key);
                    setFilterOpen(false);
                  }}
                >
                  <span className={`${styles.railDot} ${item.dot}`} />
                  <span className={styles.railName}>{item.key === "All" ? "All enquiries" : item.key}</span>
                  <span className={styles.railCount}>{item.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ---------- Main panel ---------- */}
        <section className={styles.main}>
          <div className={styles.mainHead}>
            <div>
              <h1 className={styles.mainTitle}>
                {activeStatus === "All" ? "All enquiries" : `${activeStatus} enquiries`}
              </h1>
              <p className={styles.mainSub}>
                {activeStatus === "All"
                  ? "Every conversation students have started with Dabi."
                  : `Conversations marked “${activeStatus}”.`}
              </p>
            </div>
            <button type="button" className={styles.docBtn} onClick={() => navigate("/admin/docs")}>
              <IconBookOpen size={15} />
              <span>Docs</span>
              <IconArrowUpRight size={13} />
            </button>
          </div>

          {/* Status tabs — error / warning / info icons repurposed */}
          <div className={styles.tabs} role="tablist" aria-label="Enquiry status">
            {STATUSES.map((s) => {
              const tab = STATUS_TAB[s];
              const active = activeStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                  onClick={() => {
                    setActiveStatus(s);
                    setFilterOpen(false);
                  }}
                >
                  <span className={styles.tabRow}>
                    <span className={`${styles.tabIcon} ${tab.iconClass}`}>
                      <IconMessageSquareMore size={14} />
                    </span>
                    <span>{tab.label}</span>
                    <span className={styles.tabInfo}>
                      <IconInfo size={12} />
                    </span>
                  </span>
                  <span className={styles.tabCount}>{tab.countLabel(counts[s])}</span>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.filterPop}>
              <button
                type="button"
                className={`${styles.toolBtn} ${styles.toolBtnDashed}`}
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
              >
                <IconSearch size={14} />
                <span>Filter</span>
                <IconChevronDown size={13} />
              </button>
              {filterOpen && (
                <div className={styles.filterMenu}>
                  <input
                    className={styles.filterInput}
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, hostel or phone…"
                  />
                  <p className={styles.filterHint}>
                    Matches against the student’s name, hostel and phone number.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => refresh()}
              disabled={state === "loading"}
            >
              <IconRefresh size={14} className={state === "loading" ? admin.liveSpin : undefined} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className={`${styles.toolBtn} ${styles.toolBtnPrimary}`}
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <span>Export</span>
            </button>

            <span className={styles.toolSpacer} />
            {updatedLabel && <span className={styles.updated}>{updatedLabel}</span>}
          </div>

          {/* Loading bar */}
          {state === "loading" && <div className={styles.loadBar} />}

          {/* Data grid */}
          <div className={styles.grid}>
            <div className={styles.gridHead}>
              <div className={styles.gridHeadCell}>Student</div>
              <div className={styles.gridHeadCell}>Hostel / contact</div>
              <div className={styles.gridHeadCell}>Summary</div>
              <div className={styles.gridHeadCell} />
            </div>
            <div className={styles.gridBody}>
              {state === "loading" ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={styles.gridRow}>
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div className={admin.skeleton} style={{ height: 18 }} />
                    <div />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyStateIcon}>
                    <IconTextSearch size={26} />
                  </span>
                  <span className={styles.emptyStateTitle}>
                    {emptyCopy[activeStatus].title}
                  </span>
                  <span className={styles.emptyStateText}>
                    {emptyCopy[activeStatus].text}
                  </span>
                </div>
              ) : (
                filtered.map((e) => (
                  <div key={e.id} className={styles.gridRow}>
                    <div className={styles.cellStudent}>
                      <span
                        className={styles.cellAvatar}
                        style={{ background: personColor(e.name) }}
                      >
                        {initials(e.name)}
                      </span>
                      <div className={styles.cellMeta}>
                        <span className={styles.cellName}>{e.name}</span>
                        <span className={styles.cellPhone}>{e.phone}</span>
                      </div>
                    </div>
                    <div className={styles.cellMeta}>
                      <span className={styles.cellMetaMain}>
                        {e.hostelName ?? "General"}
                      </span>
                      <span className={styles.cellMetaSub}>
                        {e.roomType ? `${e.roomType} · ` : ""}
                        {dateFmt.format(new Date(e.createdAt))}
                      </span>
                    </div>
                    <div className={styles.cellDesc}>
                      <span className={styles.cellMsg}>
                        {e.message || "No message left."}
                      </span>
                      <Badge variant={e.status}>{e.status}</Badge>
                    </div>
                    <div className={styles.cellRowActions}>
                      <button
                        type="button"
                        className={admin.btnIcon}
                        onClick={() => setView(e)}
                        aria-label={`View ${e.name}`}
                      >
                        <IconEye size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${admin.btnIcon} ${admin.btnIconDanger}`}
                        onClick={() => setConfirmId(e.id)}
                        aria-label={`Delete ${e.name}`}
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
          <div className={styles.footer}>
            <div className={styles.footerCol}>
              <span className={styles.footerTitle}>Reset view</span>
              <span className={styles.footerText}>
                Clear the search and status filter to see every conversation.
              </span>
              <button
                type="button"
                className={styles.footerBtn}
                onClick={() => {
                  setQuery("");
                  setActiveStatus("All");
                }}
              >
                Reset filters
              </button>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerTitle}>Re-run fetch</span>
              <span className={styles.footerText}>
                Enquiries are pulled live from your Dabi backend. Re-run to check
                for new messages.
              </span>
              <button
                type="button"
                className={styles.footerBtn}
                onClick={() => refresh()}
              >
                <IconRefresh size={14} />
                Re-run fetch
              </button>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerTitle}>How is this generated?</span>
              <span className={styles.footerText}>
                Conversations come straight from student submissions across the
                Dabi site. Nothing here is auto-generated.
              </span>
            </div>
          </div>
        </section>
      </div>

      {view && (
        <RecordModal
          name={view.name}
          sub={
            <>
              <b>{view.hostelName ?? "General"}</b> · {view.phone}
            </>
          }
          status={{ label: view.status, variant: view.status }}
          avatarText={initials(view.name)}
          avatarColor={personColor(view.name)}
          onClose={() => setView(null)}
        >
          <div className={admin.detailList}>
            {view.school && (
              <div className={admin.detailRow}>
                <span className={admin.detailKey}>School</span>
                <span>{view.school}</span>
              </div>
            )}
            {view.roomType && (
              <div className={admin.detailRow}>
                <span className={admin.detailKey}>Room type</span>
                <span>{view.roomType}</span>
              </div>
            )}
            {view.moveInDate && (
              <div className={admin.detailRow}>
                <span className={admin.detailKey}>Move-in</span>
                <span>{view.moveInDate}</span>
              </div>
            )}
            <div className={admin.detailRow}>
              <span className={admin.detailKey}>Received</span>
              <span>{dateFmt.format(new Date(view.createdAt))}</span>
            </div>
          </div>

          {view.message && (
            <div className={admin.field} style={{ marginBottom: 16 }}>
              <span className={admin.fieldLabel}>Message</span>
              <p className={admin.muted}>{view.message}</p>
            </div>
          )}

          <div className={admin.field} style={{ marginBottom: 18 }}>
            <label className={admin.fieldLabel} htmlFor="e-status">
              Status
            </label>
            <select
              id="e-status"
              className={admin.select}
              value={view.status}
              onChange={(e) => changeStatus(view.id, e.target.value as EnquiryStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={admin.field} style={{ marginBottom: 18 }}>
            <label className={admin.fieldLabel}>Reservation</label>
            {reservedId === view.id ? (
              <p className={admin.muted}>
                Reservation requested{view.roomType ? ` for the ${view.roomType} rooms` : ""}
                {view.hostelName ? ` at ${view.hostelName}` : ""}.
              </p>
            ) : view.hostelId ? (
              <button
                type="button"
                className={admin.btnPrimary}
                onClick={() => reserveFromEnquiry(view)}
                disabled={reserving}
              >
                {reserving ? "Requesting…" : "Request to Reserve"}
              </button>
            ) : (
              <p className={admin.muted}>
                No hostel is linked to this enquiry, so a reservation can&rsquo;t be created.
              </p>
            )}
          </div>

          <div className={admin.formActions}>
            <button
              className={admin.btnDanger}
              onClick={() => setConfirmId(view.id)}
            >
              <IconTrash size={16} />
              Delete
            </button>
            <button className={admin.btnPrimary} onClick={() => setView(null)}>
              Done
            </button>
          </div>
        </RecordModal>
      )}

      {confirmId && (
        <Modal title="Delete enquiry?" onClose={() => setConfirmId(null)}>
          <p className={admin.muted} style={{ marginBottom: 18 }}>
            This enquiry will be permanently removed.
          </p>
          <div className={admin.formActions}>
            <button className={admin.btnGhost} onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className={admin.btnDanger} onClick={handleDelete}>
              <IconTrash size={16} />
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
