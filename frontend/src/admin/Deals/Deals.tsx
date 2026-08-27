import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  fetchDeals,
  fetchHostels,
  createDeal,
  updateDeal,
  deleteDeal,
  type DealInput,
} from "../../services/api";
import type { Deal, AdminHostel } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconTag,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconBed,
  IconCalendar,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const [d, h] = await Promise.all([fetchDeals(), fetchHostels()]);
      setDeals(d);
      setHostels(h);
      setLastUpdated(new Date());
      setState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load deals.";
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
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams, setEditing, setFormOpen]);

  const hostelName = useMemo(() => {
    const map = new Map<string, string>();
    hostels.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hostels]);

  const summary = useMemo(() => {
    const active = deals.filter((d) => d.active).length;
    const avg =
      deals.length === 0
        ? 0
        : Math.round(deals.reduce((s, d) => s + d.discountPercent, 0) / deals.length);
    return { total: deals.length, active, avg };
  }, [deals]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(d: Deal) {
    setEditing(d);
    setFormOpen(true);
  }
  async function handleDelete() {
    if (!confirmId) return;
    await deleteDeal(confirmId);
    setConfirmId(null);
    refresh();
  }

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load deals"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading deals. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: refresh }}
      />
    );
  }

  return (
    <div className={styles.sbShell}>
      <aside className={styles.sbSubNav}>
        <div className={styles.sbSubNavHeader}>
          <h4 className={styles.sbSubNavTitle}>Deals</h4>
        </div>
        <nav className={styles.sbSubNavNav}>
          <div className={styles.sbSubGroup}>
            <div className={styles.sbSubGroupLabel}>Manage</div>
            <div className={styles.sbSubGroupItems}>
              <NavLink
                to="/admin/deals"
                end
                className={({ isActive }) =>
                  `${styles.sbSubItem} ${isActive ? styles.sbSubItemActive : ""}`
                }
              >
                <span className={styles.sbSubItemIcon}>
                  <IconTag size={16} />
                </span>
                <span className={styles.sbSubItemLabel}>All deals</span>
              </NavLink>
            </div>
          </div>
          <div className={styles.sbSubDivider} />
          <div className={styles.sbSubGroup}>
            <div className={styles.sbSubGroupLabel}>Resources</div>
            <div className={styles.sbSubGroupItems}>
              <button type="button" className={styles.sbSubItem} onClick={openCreate}>
                <span className={styles.sbSubItemIcon}>
                  <IconPlus size={16} />
                </span>
                <span className={styles.sbSubItemLabel}>Add deal</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div className={styles.sbContent}>
        <div className={styles.dealsTop}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Deals</h1>
              <p className={styles.pageSubtitle}>Promotions and discount codes.</p>
            </div>
            <div className={styles.headerActions}>
              <LiveControls
                lastUpdated={lastUpdated}
                loading={state === "loading"}
                onRefresh={() => refresh()}
              />
              <button className={styles.addBtn} onClick={openCreate}>
                <IconPlus size={14} />
                Add deal
              </button>
            </div>
          </div>

          <div className={styles.statGrid} style={{ marginBottom: 22 }}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total deals</span>
              <span className={styles.statValue}>{summary.total}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active</span>
              <span className={styles.statValue}>{summary.active}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg. discount</span>
              <span className={styles.statValue}>{summary.avg}%</span>
            </div>
          </div>
        </div>

        <div className={styles.dealsScroll}>
          <div className={styles.panel}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
            <thead>
              <tr>
                <th>Deal</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Applies to</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state === "loading" ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className={styles.skeleton} style={{ height: 18, margin: "8px 0" }} />
                    </td>
                  </tr>
                ))
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState
                      variant="empty"
                      illustration="/illustrations/Deal-Failed-1--Streamline-New-York.webp"
                      title="No deals yet"
                      text="Promotions and discount codes you create will appear here. Add your first deal when you’re ready."
                      action={{
                        label: (
                          <>
                            <IconPlus size={16} /> Add deal
                          </>
                        ),
                        onClick: openCreate,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                deals.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className={styles.cellTitle}>{d.title}</div>
                      {d.description && (
                        <div className={styles.cellSub}>{d.description}</div>
                      )}
                    </td>
                    <td>
                      <code className={styles.cellSub} style={{ fontWeight: 700 }}>
                        {d.code}
                      </code>
                    </td>
                    <td>{d.discountPercent}%</td>
                    <td className={styles.cellSub}>
                      {d.hostelId ? hostelName.get(d.hostelId) ?? "—" : "All hostels"}
                    </td>
                    <td className={styles.cellSub}>{d.expiresAt ?? "—"}</td>
                    <td>
                      <Badge variant={d.active ? "Active" : "Inactive"}>
                        {d.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.btnIcon}
                          onClick={() => openEdit(d)}
                          aria-label={`Edit ${d.title}`}
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                          onClick={() => setConfirmId(d.id)}
                          aria-label={`Delete ${d.title}`}
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
      </div>

      {formOpen && (
        <DealForm
          initial={editing}
          hostels={hostels}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            if (editing) await updateDeal(editing.id, input);
            else await createDeal(input);
            setFormOpen(false);
            refresh();
          }}
        />
      )}

      {confirmId && (
        <Modal title="Delete deal?" onClose={() => setConfirmId(null)}>
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            This promotion will be permanently removed.
          </p>
          <div className={styles.formActions}>
            <button className="dabi-btn dabi-btn-ghost" onClick={() => setConfirmId(null)}>
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
    </div>
  );
}

interface FormProps {
  initial: Deal | null;
  hostels: AdminHostel[];
  onClose: () => void;
  onSubmit: (input: DealInput) => void | Promise<void>;
}

function DealForm({ initial, hostels, onClose, onSubmit }: FormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [discount, setDiscount] = useState(initial?.discountPercent?.toString() ?? "10");
  const [hostelId, setHostelId] = useState(initial?.hostelId ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      code: code.trim().toUpperCase(),
      discountPercent: Number(discount) || 0,
      hostelId: hostelId || undefined,
      active,
      expiresAt: expiresAt || undefined,
    });
  }

  return (
    <Modal title={initial ? "Edit deal" : "Add deal"} onClose={onClose} wide>
      <form className={styles.ownerForm} onSubmit={handleSubmit}>
        <div className={styles.ownerFormDivider} />
        <div className={styles.ownerFormBody}>
          <div className={styles.ownerField}>
            <label className={styles.ownerFieldLabel} htmlFor="d-title">
              Title
            </label>
            <div className={styles.ownerFieldWrap}>
              <span className={styles.ownerFieldIcon}>
                <IconTag size={18} />
              </span>
              <input
                id="d-title"
                className={`${styles.input} ${styles.ownerInputIcon}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Special"
                required
              />
            </div>
          </div>

          <div className={styles.ownerField}>
            <label className={styles.ownerFieldLabel} htmlFor="d-desc">
              Description
            </label>
            <textarea
              id="d-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this promotion about?"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.ownerField}>
              <label className={styles.ownerFieldLabel} htmlFor="d-code">
                Code
              </label>
              <input
                id="d-code"
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUMMER10"
                required
              />
            </div>
            <div className={styles.ownerField}>
              <label className={styles.ownerFieldLabel} htmlFor="d-discount">
                Discount %
              </label>
              <input
                id="d-discount"
                className={styles.input}
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.ownerField}>
              <label className={styles.ownerFieldLabel} htmlFor="d-hostel">
                Applies to
              </label>
              <div className={styles.ownerFieldWrap}>
                <span className={styles.ownerFieldIcon}>
                  <IconBed size={18} />
                </span>
                <select
                  id="d-hostel"
                  className={`${styles.select} ${styles.ownerInputIcon}`}
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                >
                  <option value="">All hostels</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.ownerField}>
              <label className={styles.ownerFieldLabel} htmlFor="d-expires">
                Expires
              </label>
              <div className={styles.ownerFieldWrap}>
                <span className={styles.ownerFieldIcon}>
                  <IconCalendar size={18} />
                </span>
                <input
                  id="d-expires"
                  className={`${styles.input} ${styles.ownerInputIcon}`}
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.ownerCheckRow}>
            <button
              type="button"
              className={`${styles.ownerCheck} ${active ? styles.ownerCheckOn : ""}`}
              onClick={() => setActive(!active)}
              aria-pressed={active}
              aria-label="Toggle active promotion"
            >
              <IconCheck size={14} />
            </button>
            <label
              className={styles.ownerCheckLabel}
              onClick={() => setActive(!active)}
            >
              Active promotion
            </label>
          </div>
          <p className={styles.ownerHelper}>
            {active
              ? "Active deals are live and can be applied at checkout."
              : "Inactive deals are hidden from customers."}
          </p>

          <button
            type="submit"
            className={`${styles.ownerBtn} ${styles.ownerBtnPrimary} ${styles.ownerBtnBlock}`}
          >
            <IconTag size={16} />
            {initial ? "Save changes" : "Create deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
