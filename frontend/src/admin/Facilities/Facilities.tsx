import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams, useNavigate, NavLink } from "react-router-dom";
import {
  fetchHostels,
  createFacility,
  updateFacility,
  deleteFacility,
  type FacilityInput,
} from "../../services/api";
import type { Facility } from "../../admin/types";
import { useFacilities } from "../../context/FacilitiesContext";
import { ICON_CHOICES, CATEGORY_CHOICES, FacilityGlyph } from "../../services/facilityIcons";
import type { AdminHostel } from "../types";
import { usePolling } from "../usePolling";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconTag,
  IconSliders,
  IconStar,
} from "../../components/Icons/Icons";
import {
  IconGrid,
  IconBook,
  IconSearch,
  IconChevronDown,
  IconList,
  IconSquarePlus,
  IconArrowUpRight,
  IconLayers,
} from "../Hostels/hostelPageIcons";
import shared from "../admin.module.css";
import styles from "./Facilities.module.css";

function describeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  const lower = msg.toLowerCase();
  if (lower.includes("already exists")) {
    return "A facility with that key already exists. Try a different key or edit the existing one.";
  }
  if (lower.includes("required")) {
    return "Both a key and a label are required.";
  }
  if (lower.includes("could not reach")) {
    return "We couldn't reach the server. Check your connection or make sure the backend is running, then try again.";
  }
  return msg;
}

type ViewMode = "grid" | "list";
const VIEW_KEY = "dabi.admin.facilities.view";

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

export default function Facilities() {
  const { facilities, refresh } = useFacilities();
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<"name" | "usage">("name");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "grid" || saved === "list" ? saved : "grid";
  });
  function changeView(next: ViewMode) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  }

  async function refreshAll(showLoading = true) {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    try {
      const [h] = await Promise.all([fetchHostels().catch(() => [])]);
      setHostels(h as AdminHostel[]);
      await refresh();
      setLastUpdated(new Date());
      setState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load facilities.";
      if (showLoading) {
        setError(message);
        setState("error");
      }
    }
  }

  usePolling(() => refreshAll(false));
  useEffect(() => {
    refreshAll();
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

  const usageByKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of hostels) {
      for (const key of h.facilities ?? []) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [hostels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = facilities.filter((f) => {
      const matchesQuery =
        !q ||
        f.label.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        (f.category ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "All" || (f.category ?? "Other") === category;
      return matchesQuery && matchesCategory;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "usage") {
        return (usageByKey.get(b.key) ?? 0) - (usageByKey.get(a.key) ?? 0);
      }
      return a.label.localeCompare(b.label);
    });
    return sorted;
  }, [facilities, query, category, sort, usageByKey]);

  const popular = useMemo(() => {
    return [...facilities]
      .sort((a, b) => (usageByKey.get(b.key) ?? 0) - (usageByKey.get(a.key) ?? 0))
      .slice(0, 4);
  }, [facilities, usageByKey]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(f: Facility) {
    setEditing(f);
    setFormOpen(true);
  }
  async function handleDelete() {
    if (!confirmId) return;
    await deleteFacility(confirmId);
    setConfirmId(null);
    refreshAll();
  }

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    return (
      <AdminEmptyState
        variant="error"
        title="We couldn’t load facilities"
        text={
          isConnectionError
            ? "We can’t reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
            : "Something went wrong while loading facilities. Please try again."
        }
        detail={!isConnectionError ? error ?? undefined : undefined}
        action={{ label: "Try again", onClick: () => refreshAll() }}
      />
    );
  }

  const sidebarItem = (active: boolean) =>
    `${shared.sbSubItem} ${active ? shared.sbSubItemActive : ""}`;

  return (
    <div className={shared.sbShell}>
      {/* Internal sub-sidebar — mirrors the Hostels' sbSubNav */}
      <aside className={shared.sbSubNav}>
        <div className={shared.sbSubNavHeader}>
          <h4 className={shared.sbSubNavTitle}>Catalog</h4>
        </div>
        <nav className={shared.sbSubNavNav}>
          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Manage</div>
            <div className={shared.sbSubGroupItems}>
              <button
                type="button"
                className={sidebarItem(category === "All")}
                onClick={() => setCategory("All")}
              >
                <span className={shared.sbSubItemIcon}>
                  <IconGrid size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Explore all</span>
              </button>
            </div>
          </div>

          <div className={shared.sbSubDivider} />

          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Categories</div>
            <div className={shared.sbSubGroupItems}>
              {CATEGORY_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={sidebarItem(category === c)}
                  onClick={() => setCategory(c)}
                >
                  <span className={shared.sbSubItemIcon}>
                    <IconLayers size={16} />
                  </span>
                  <span className={shared.sbSubItemLabel}>{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={shared.sbSubDivider} />

          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Resources</div>
            <div className={shared.sbSubGroupItems}>
              <button type="button" className={sidebarItem(false)} onClick={openCreate}>
                <span className={shared.sbSubItemIcon}>
                  <IconSquarePlus size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Add facility</span>
                <IconArrowUpRight width={11} height={11} className="opacity-50" />
              </button>
              <NavLink
                to="/admin/docs"
                className={({ isActive }) =>
                  `${shared.sbSubItem} ${isActive ? shared.sbSubItemActive : ""}`
                }
              >
                <span className={shared.sbSubItemIcon}>
                  <IconBook size={16} />
                </span>
                <span className={shared.sbSubItemLabel}>Docs</span>
                <IconArrowUpRight width={11} height={11} className="opacity-50" />
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
              <h1 className={styles.title}>Facilities</h1>
              <div className={styles.sub}>
                Define the facilities students can filter by. Add as many as you like —
                the catalog is yours to shape.
              </div>
            </div>
            <div className={styles.pageHeaderActions}>
              <button className={styles.docsBtn} type="button" onClick={() => navigate("/admin/docs")}>
                <span className={styles.docsBtnIcon}>
                  <IconBook size={14} />
                </span>
                Docs
              </button>
              <button className={styles.addBtn} type="button" onClick={openCreate}>
                <IconPlus size={16} />
                Add facility
              </button>
            </div>
          </div>
        </header>

        <div className={styles.contentPad}>
          {state === "ready" && popular.length > 0 && (
            <section className={styles.featured}>
              <div className={styles.featuredHead}>
                <h2 className={styles.sectionTitle}>Popular facilities</h2>
              </div>
              <div className={styles.featuredGrid}>
                {popular.map((f) => {
                  const used = (f.key && usageByKey.get(f.key)) || 0;
                  return (
                    <div key={f.id} className={styles.featCard}>
                      <div className={styles.featSmallInner}>
                        <div className={styles.featSmallTop}>
                          <span className={styles.cardThumbFallback}>
                            <FacilityGlyph iconKey={f.iconKey} size={20} />
                          </span>
                        </div>
                        <div className={styles.featSmallName}>{f.label}</div>
                        <p className={styles.featSmallDesc}>{f.key}</p>
                        <div className={styles.featSmallFoot}>
                          <span className={`${styles.badge} ${styles.badgeCategory}`}>
                            {f.category ?? "Other"}
                          </span>
                          <span className={styles.builtBy}>
                            {used} {used === 1 ? "use" : "uses"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                placeholder="Search facilities…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Dropdown
              label="Category"
              value={category}
              options={[
                { value: "All", label: "All" },
                ...CATEGORY_CHOICES.map((c) => ({ value: c, label: c })),
              ]}
              onChange={setCategory}
            />
            <Dropdown
              label="Sort"
              value={sort}
              options={[
                { value: "name", label: "Name A–Z" },
                { value: "usage", label: "Most used" },
              ]}
              onChange={(v) => setSort(v as typeof sort)}
            />
            <LiveControls
              lastUpdated={lastUpdated}
              loading={state === "loading"}
              onRefresh={() => refreshAll()}
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

          <p className={styles.resultsLine}>
            Showing <b>{filtered.length}</b> of <b>{facilities.length}</b> facilities
          </p>

          {state === "loading" ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <AdminEmptyState
              variant="empty"
              illustration="/illustrations/Astronaut-Riding-Doge--Streamline-Brooklyn.webp"
              title={query || category !== "All" ? "No matches found" : "No facilities yet"}
              text={
                query || category !== "All"
                  ? "We couldn't find any facilities matching your filters. Try clearing a filter or a different search."
                  : "Facilities power the filters students use to find the right hostel. Add your first one to get started."
              }
              action={{
                label: (
                  <>
                    <IconPlus size={16} /> Add facility
                  </>
                ),
                onClick: openCreate,
              }}
            />
          ) : view === "grid" ? (
            <div className={styles.grid}>
              {filtered.map((f) => {
                const used = (f.key && usageByKey.get(f.key)) || 0;
                return (
                  <div key={f.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardThumbFallback}>
                        <FacilityGlyph iconKey={f.iconKey} size={20} />
                      </span>
                      <div className={styles.rowActions}>
                        <button
                          className={shared.btnIcon}
                          onClick={() => openEdit(f)}
                          aria-label={`Edit ${f.label}`}
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          className={`${shared.btnIcon} ${shared.btnIconDanger}`}
                          onClick={() => setConfirmId(f.id)}
                          aria-label={`Delete ${f.label}`}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardName}>{f.label}</div>
                    <div className={styles.cardDesc}>
                      <span className={styles.facCode}>{f.key}</span>
                    </div>
                    <div className={styles.cardFoot}>
                      <span className={`${styles.badge} ${styles.badgeCategory}`}>
                        {f.category ?? "Other"}
                      </span>
                      <span className={styles.builtBy}>
                        {used} {used === 1 ? "hostel uses" : "hostels use"} this
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.gridList}>
              {filtered.map((f) => {
                const used = (f.key && usageByKey.get(f.key)) || 0;
                return (
                  <div key={f.id} className={styles.listRow}>
                    <span className={styles.listThumbFallback}>
                      <FacilityGlyph iconKey={f.iconKey} size={20} />
                    </span>
                    <div className={styles.listMain}>
                      <div className={styles.listName}>{f.label}</div>
                      <p className={styles.listDesc}>
                        {f.category ?? "Other"} · {used} {used === 1 ? "hostel uses" : "hostels use"} this
                      </p>
                    </div>
                    <div className={styles.listMeta}>
                      <span className={`${styles.badge} ${styles.badgeCategory}`}>
                        {f.category ?? "Other"}
                      </span>
                      <span className={styles.listKey}>{f.key}</span>
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        className={shared.btnIcon}
                        onClick={() => openEdit(f)}
                        aria-label={`Edit ${f.label}`}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        className={`${shared.btnIcon} ${shared.btnIconDanger}`}
                        onClick={() => setConfirmId(f.id)}
                        aria-label={`Delete ${f.label}`}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <FacilityForm
          initial={editing}
          onClose={() => setFormOpen(false)}
          onDelete={editing ? () => setConfirmId(editing.id) : undefined}
          onSubmit={async (input) => {
            if (editing) await updateFacility(editing.id, input);
            else await createFacility(input);
            setFormOpen(false);
            refreshAll();
          }}
        />
      )}

      {confirmId && (
        <Modal title="Remove facility?" onClose={() => setConfirmId(null)}>
          <p className={shared.muted} style={{ marginBottom: 18 }}>
            The facility will be removed from every hostel that uses it. This
            can&rsquo;t be undone.
          </p>
          <div className={shared.formActions}>
            <button className="dabi-btn dabi-btn-ghost" onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className="dabi-btn dabi-btn-danger" onClick={handleDelete}>
              <IconTrash size={16} />
              Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface FormProps {
  initial: Facility | null;
  onClose: () => void;
  onSubmit: (input: FacilityInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

function FacilityForm({ initial, onClose, onSubmit, onDelete }: FormProps) {
  const [key, setKey] = useState(initial?.key ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORY_CHOICES[0]);
  const [iconKey, setIconKey] = useState(initial?.iconKey ?? ICON_CHOICES[0].key);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        key: key.trim(),
        label: label.trim(),
        category,
        iconKey,
      });
    } catch (err) {
      setError(describeError(err));
    }
  }

  const keyError = !!error && /key/i.test(error);

  return (
    <Modal
      title={initial ? "Edit facility" : "Create a new facility"}
      onClose={onClose}
      narrow
    >
      <form className={shared.ownerForm} onSubmit={handleSubmit}>
        <div className={shared.ownerFormDivider} />
        <div className={shared.ownerFormBody}>
          {error && (
            <div className={shared.formError} role="alert">
              {error}
            </div>
          )}

          <div className={shared.ownerField}>
            <label className={shared.ownerFieldLabel} htmlFor="f-key">
              Key
            </label>
            <div className={shared.ownerFieldWrap}>
              <span className={shared.ownerFieldIcon}>
                <IconTag size={18} />
              </span>
              <input
                id="f-key"
                className={`${shared.input} ${shared.ownerInputIcon} ${
                  keyError ? shared.inputError : ""
                }`}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={!!initial}
                placeholder="e.g. wifi"
                required
              />
            </div>
            {keyError && (
              <span className={shared.fieldError}>This key is already in use.</span>
            )}
          </div>

          <div className={shared.ownerField}>
            <label className={shared.ownerFieldLabel} htmlFor="f-label">
              Label
            </label>
            <div className={shared.ownerFieldWrap}>
              <span className={shared.ownerFieldIcon}>
                <IconSliders size={18} />
              </span>
              <input
                id="f-label"
                className={`${shared.input} ${shared.ownerInputIcon}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Wi-Fi"
                required
              />
            </div>
          </div>

          <div className={shared.ownerField}>
            <label className={shared.ownerFieldLabel} htmlFor="f-category">
              Category
            </label>
            <div className={shared.ownerFieldWrap}>
              <span className={shared.ownerFieldIcon}>
                <IconLayers size={18} />
              </span>
              <select
                id="f-category"
                className={`${shared.input} ${shared.ownerInputIcon}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_CHOICES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={shared.ownerField}>
            <label className={shared.ownerFieldLabel} htmlFor="f-icon">
              Icon
            </label>
            <div className={shared.ownerFieldWrap}>
              <span className={shared.ownerFieldIcon}>
                <IconStar size={18} />
              </span>
              <select
                id="f-icon"
                className={`${shared.input} ${shared.ownerInputIcon}`}
                value={iconKey}
                onChange={(e) => setIconKey(e.target.value)}
              >
                {ICON_CHOICES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className={shared.ownerHelper}>
            <span className={shared.facilityPreview}>
              <FacilityGlyph iconKey={iconKey} size={18} />
              {label || "Facility label"}
            </span>
          </p>

          {onDelete && (
            <button
              type="button"
              className={`${shared.ownerBtn} ${shared.ownerBtnDanger} ${shared.ownerDelete}`}
              onClick={onDelete}
            >
              <IconTrash size={16} />
              Remove facility
            </button>
          )}

          <button
            type="submit"
            className={`${shared.ownerBtn} ${shared.ownerBtnPrimary} ${shared.ownerBtnBlock}`}
          >
            {initial ? "Save changes" : "Create facility"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
