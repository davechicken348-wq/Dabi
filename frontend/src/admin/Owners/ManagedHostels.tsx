import { useEffect, useMemo, useState } from "react";
import {
  fetchHostels,
  fetchOwners,
  updateHostel,
  updateOwner,
} from "../../services/api";
import type { AdminHostel, Owner } from "../types";
import { usePolling } from "../usePolling";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import OwnerSection from "./OwnerSection";
import styles from "../admin.module.css";
import {
  IconBed,
  IconPin,
  IconSearch,
  IconRefresh,
} from "../../components/Icons/Icons";

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

export default function ManagedHostels() {
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const ownerMap = useMemo(() => {
    const map = new Map<string, Owner>();
    owners.forEach((o) => map.set(o.id, o));
    return map;
  }, [owners]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hostels;
    return hostels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.ownerId ? ownerMap.get(h.ownerId)?.name.toLowerCase().includes(q) ?? false : false),
    );
  }, [hostels, query, ownerMap]);

  async function assign(hostelId: string, rawOwnerId: string) {
    const ownerId = rawOwnerId || undefined;
    const hostel = hostels.find((h) => h.id === hostelId);
    if (!hostel) return;
    const prevOwnerId = hostel.ownerId ?? "";
    if (prevOwnerId === (ownerId ?? "")) return;

    setSavingId(hostelId);

    // Optimistically reflect the change in both views.
    const nextOwners = owners.map((o) => {
      if (o.id === ownerId) {
        return {
          ...o,
          hostelIds: o.hostelIds.includes(hostelId)
            ? o.hostelIds
            : [...o.hostelIds, hostelId],
        };
      }
      if (o.id === prevOwnerId) {
        return { ...o, hostelIds: o.hostelIds.filter((id) => id !== hostelId) };
      }
      return o;
    });

    setHostels((prev) =>
      prev.map((h) => (h.id === hostelId ? { ...h, ownerId } : h)),
    );
    setOwners(nextOwners);

    try {
      await updateHostel(hostelId, { ownerId });
      if (ownerId) {
        const next = nextOwners.find((o) => o.id === ownerId);
        if (next) await updateOwner(ownerId, { hostelIds: next.hostelIds });
      }
      if (prevOwnerId) {
        const prev = nextOwners.find((o) => o.id === prevOwnerId);
        if (prev) await updateOwner(prevOwnerId, { hostelIds: prev.hostelIds });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign the hostel.";
      setError(message);
      refresh();
    } finally {
      setSavingId(null);
    }
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
    <OwnerSection title="Owner management">
      <div className={styles.sbPage}>
        <div className={styles.sbHeader}>
          <h2 className={styles.sbTitle}>Managed hostels</h2>
          <div className={styles.sbHeaderActions} />
        </div>

        <div className={styles.sbToolbar}>
          <div className={styles.sbSearchGroup}>
            <div className={styles.sbSearchField}>
              <IconSearch size={15} />
              <input
                className={styles.sbSearchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hostels or owners…"
              />
            </div>
          </div>
          <span className={styles.sbSpacer} />
          <LiveControls
            lastUpdated={lastUpdated}
            loading={state === "loading"}
            onRefresh={() => refresh()}
          />
        </div>

        <div className={styles.sbScroll}>
          {state === "loading" ? (
            <div className={`${styles.panel} ${styles.panelFlat}`}>
              <div className={styles.panelBody}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skTableRow} />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`${styles.panel} ${styles.panelFlat}`}>
              <AdminEmptyState
                variant="empty"
                illustration="/illustrations/Rest-3--Streamline-Brooklyn.webp"
                title={query ? "No hostels match" : "No hostels yet"}
                text={
                  query
                    ? "Try a different hostel or owner name."
                    : "Add a hostel from the Hostels page, then assign an owner here."
                }
              />
            </div>
          ) : (
            <div className={`${styles.panel} ${styles.panelFlat}`}>
              <div className={styles.panelBody}>
                <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Hostel</th>
                        <th>Location</th>
                        <th>Managing owner</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((h) => {
                        const owner = h.ownerId ? ownerMap.get(h.ownerId) : undefined;
                        return (
                          <tr key={h.id}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <img
                                  className={styles.cellThumb}
                                  src={h.image}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                />
                                <div>
                                  <div className={styles.cellTitle}>{h.name}</div>
                                  <div className={styles.cellSub}>
                                    <IconBed size={12} style={{ verticalAlign: "-2px" }} />{" "}
                                    {h.roomType}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={styles.cellSub}>
                              <IconPin size={12} style={{ verticalAlign: "-2px" }} />{" "}
                              {h.location}
                            </td>
                            <td>
                              <select
                                className={styles.selectInline}
                                value={h.ownerId ?? ""}
                                onChange={(e) => assign(h.id, e.target.value)}
                                aria-label={`Managing owner for ${h.name}`}
                              >
                                <option value="">Unassigned</option>
                                {owners.map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              {savingId === h.id ? (
                                <span className={styles.sbLoading}>
                                  <IconRefresh size={13} className={styles.sbSpin} />
                                  Saving…
                                </span>
                              ) : owner ? (
                                <span className={styles.ownerCell}>
                                  <span className={styles.ownerDot}>
                                    {ownerInitials(owner.name)}
                                  </span>
                                  {owner.name}
                                </span>
                              ) : (
                                <span className={styles.cellSub}>
                                  {dateFmt.format(new Date(h.createdAt))}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sbFooter}>
          <span>
            Showing <b>{filtered.length}</b> of <b>{hostels.length}</b> hostels
          </span>
        </div>
      </div>
    </OwnerSection>
  );
}
