import { useEffect, useMemo, useState } from "react";
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
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconSearch,
  IconEye,
  IconTrash,
  IconChat,
  IconMail,
  IconCheck,
  IconUsers,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

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

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | EnquiryStatus>("All");
  const [view, setView] = useState<Enquiry | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reservedId, setReservedId] = useState<string | null>(null);

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
        (e.hostelName ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [enquiries, query, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<EnquiryStatus, number> = { New: 0, Contacted: 0, Resolved: 0 };
    for (const e of enquiries) c[e.status]++;
    return c;
  }, [enquiries]);
  const newCount = counts.New;

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

  return (
    <div>
      <section className={styles.dashHero}>
        <div className={styles.dashHeroMain}>
          <span className={styles.dashEyebrow}>
            <IconChat size={14} /> Conversations
          </span>
          <h1 className={styles.dashGreeting}>
            Every enquiry is a student hoping to find home.
          </h1>
          <p className={styles.dashGreetingSub}>
            {newCount} new {newCount === 1 ? "message is" : "messages are"} waiting for a
            warm reply. A quick, kind response can turn a stranger into a resident.
          </p>
          <div className={styles.dashHeroLive}>
            <LiveControls
              lastUpdated={lastUpdated}
              loading={state === "loading"}
              onRefresh={() => refresh()}
            />
          </div>
        </div>
        <div className={styles.dashHeroArt} aria-hidden="true">
          <img
            src="/illustrations/I-Have-Question-1--Streamline-Brooklyn.png"
            alt=""
            width={138}
            height={138}
          />
        </div>
      </section>

      <div className={styles.statGrid}>
        <div className={`${styles.statCard} ${styles.toneBlue}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>New</span>
            <span className={styles.statIcon}>
              <IconMail size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.New}</div>
          <div className={styles.statHint}>Awaiting your first reply</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneGold}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Contacted</span>
            <span className={styles.statIcon}>
              <IconChat size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.Contacted}</div>
          <div className={styles.statHint}>In conversation</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneEmerald}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Resolved</span>
            <span className={styles.statIcon}>
              <IconCheck size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{counts.Resolved}</div>
          <div className={styles.statHint}>Happy endings</div>
        </div>
        <div className={`${styles.statCard} ${styles.toneGreen}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>All enquiries</span>
            <span className={styles.statIcon}>
              <IconUsers size={18} />
            </span>
          </div>
          <div className={styles.statValue}>{enquiries.length}</div>
          <div className={styles.statHint}>Total conversations</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <IconSearch size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search enquiries…"
          />
        </label>
        <div className={styles.filterGroup}>
          {(["All", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.resultsLine}>
        Showing <b>{filtered.length}</b> of <b>{enquiries.length}</b> enquiries
      </p>

      <div className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Received</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state === "loading" ? (
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
                        eyebrow="Inbox empty"
                        title="No enquiries yet."
                        text="When students reach out about a hostel, their questions and contact details will land right here — ready for you to reply."
                        hint="The first enquiry is usually just around the corner."
                        action={{ label: "Refresh", onClick: refresh }}
                      />
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className={styles.personCell}>
                        <span
                          className={styles.avatar}
                          style={{ background: personColor(e.name) }}
                        >
                          {initials(e.name)}
                        </span>
                        <div>
                          <div className={styles.cellTitle}>{e.name}</div>
                          <div className={styles.cellSub}>{e.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.hostelName ?? "General"}</td>
                    <td className={styles.cellSub}>{e.roomType ?? "—"}</td>
                    <td className={styles.cellSub}>
                      {dateFmt.format(new Date(e.createdAt))}
                    </td>
                    <td>
                      <Badge variant={e.status}>{e.status}</Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.btnIcon}
                          onClick={() => setView(e)}
                          aria-label={`View ${e.name}`}
                        >
                          <IconEye size={16} />
                        </button>
                        <button
                          className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                          onClick={() => setConfirmId(e.id)}
                          aria-label={`Delete ${e.name}`}
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
          <div className={styles.detailList}>
            {view.school && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>School</span>
                <span>{view.school}</span>
              </div>
            )}
            {view.roomType && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Room type</span>
                <span>{view.roomType}</span>
              </div>
            )}
            {view.moveInDate && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Move-in</span>
                <span>{view.moveInDate}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Received</span>
              <span>{dateFmt.format(new Date(view.createdAt))}</span>
            </div>
          </div>

          {view.message && (
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <span className={styles.fieldLabel}>Message</span>
              <p className={styles.muted}>{view.message}</p>
            </div>
          )}

          <div className={styles.field} style={{ marginBottom: 18 }}>
            <label className={styles.fieldLabel} htmlFor="e-status">
              Status
            </label>
            <select
              id="e-status"
              className={styles.select}
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

          <div className={styles.field} style={{ marginBottom: 18 }}>
            <label className={styles.fieldLabel}>Reservation</label>
            {reservedId === view.id ? (
              <p className={styles.muted}>
                Reservation requested{view.roomType ? ` for the ${view.roomType} rooms` : ""}
                {view.hostelName ? ` at ${view.hostelName}` : ""}.
              </p>
            ) : view.hostelId ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => reserveFromEnquiry(view)}
                disabled={reserving}
              >
                {reserving ? "Requesting…" : "Request to Reserve"}
              </button>
            ) : (
              <p className={styles.muted}>
                No hostel is linked to this enquiry, so a reservation can&rsquo;t be created.
              </p>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.btnDanger}
              onClick={() => setConfirmId(view.id)}
            >
              <IconTrash size={16} />
              Delete
            </button>
            <button className={styles.btnPrimary} onClick={() => setView(null)}>
              Done
            </button>
          </div>
        </RecordModal>
      )}

      {confirmId && (
        <Modal title="Delete enquiry?" onClose={() => setConfirmId(null)}>
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            This enquiry will be permanently removed.
          </p>
          <div className={styles.formActions}>
            <button className={styles.btnGhost} onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className={styles.btnDanger} onClick={handleDelete}>
              <IconTrash size={16} />
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
