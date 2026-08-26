import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import LiveControls from "../components/LiveControls";
import AdminEmptyState from "../components/AdminEmptyState";
import {
  IconSliders,
  IconPlus,
  IconEdit,
  IconTrash,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

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

export default function Facilities() {
  const { facilities, refresh } = useFacilities();
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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

  const usageByKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of hostels) {
      for (const key of h.facilities ?? []) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [hostels]);

  const filtered = facilities.filter((f) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      f.label.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q) ||
      (f.category ?? "").toLowerCase().includes(q)
    );
  });

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

  return (
    <div>
      <div className={styles.ownersHero}>
        <div className={styles.ownersHeroMain}>
          <span className={styles.ownersHeroEyebrow}>
            <IconSliders size={14} /> Catalog
          </span>
          <h1 className={styles.ownersHeroTitle}>Facilities</h1>
          <p className={styles.ownersHeroSub}>
            Define the facilities students can filter by. Add as many as you like —
            the catalog is yours to shape.
          </p>
        </div>
        <div className={styles.ownersHeroActions}>
          <LiveControls
            lastUpdated={lastUpdated}
            loading={state === "loading"}
            onRefresh={() => refreshAll()}
          />
          <button className="dabi-btn dabi-btn-primary" onClick={openCreate}>
            <IconPlus size={18} />
            Add facility
          </button>
        </div>
        <div className={styles.ownersHeroArt} aria-hidden="true">
          <IconSliders size={124} />
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <IconSliders size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search facilities…"
          />
        </label>
      </div>

      <p className={styles.resultsLine}>
        Showing <b>{filtered.length}</b> of <b>{facilities.length}</b> facilities
      </p>

      {state === "loading" ? (
        <div className={styles.ownersGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.ownerSkeleton} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          variant="empty"
          illustration="/illustrations/Astronaut-Riding-Doge--Streamline-Brooklyn.webp"
          title={query ? "No matches found" : "No facilities yet"}
          text={
            query
              ? `We couldn't find any facilities matching “${query}”. Try a different search.`
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
      ) : (
        <div className={styles.ownersGrid}>
          {filtered.map((f) => {
            const used = (f.key && usageByKey.get(f.key)) || 0;
            return (
              <div key={f.id} className={styles.ownerTile}>
                <div className={styles.ownerTileHead}>
                  <span className={styles.ownerTileAvatar}>
                    <FacilityGlyph iconKey={f.iconKey} size={24} />
                  </span>
                  <div className={styles.ownerTileId}>
                    <span className={styles.ownerTileName}>{f.label}</span>
                    <Badge variant="Active">{f.category ?? "Uncategorised"}</Badge>
                  </div>
                </div>
                <div className={styles.ownerTileBody}>
                  <div className={styles.ownerTileRow}>
                    <span className={styles.ownerTileRowText}>
                      <code>{f.key}</code>
                    </span>
                  </div>
                  <div className={styles.ownerTileRow}>
                    <span className={styles.ownerTileFootMeta}>
                      {used} {used === 1 ? "hostel uses" : "hostels use"} this
                    </span>
                  </div>
                </div>
                <div className={styles.ownerTileFoot}>
                  <span className={styles.ownerTileFootMeta}>Facility</span>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.btnIcon}
                      onClick={() => openEdit(f)}
                      aria-label={`Edit ${f.label}`}
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                      onClick={() => setConfirmId(f.id)}
                      aria-label={`Delete ${f.label}`}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <FacilityForm
          initial={editing}
          onClose={() => setFormOpen(false)}
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
          <p className={styles.muted} style={{ marginBottom: 18 }}>
            The facility will be removed from every hostel that uses it. This
            can&rsquo;t be undone.
          </p>
          <div className={styles.formActions}>
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
}

function FacilityForm({ initial, onClose, onSubmit }: FormProps) {
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
      title={initial ? "Edit facility" : "Add facility"}
      onClose={onClose}
      wide
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.ownerFormHero}>
          <span className={styles.ownerFormAvatar}>
            <IconSliders size={24} />
          </span>
          <div>
            <span className={styles.ownerFormEyebrow}>
              {initial ? "Edit catalog item" : "New facility"}
            </span>
            <p className={styles.ownerFormLead}>
              {initial
                ? `Update how “${initial.label}” appears across Dabi.`
                : "Give students a new way to find the right hostel."}
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>Details</div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="f-key">
                Key
              </label>
              <input
                id="f-key"
                className={`${styles.input} ${keyError ? styles.inputError : ""}`}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={!!initial}
                placeholder="e.g. wifi"
                required
              />
              {keyError && (
                <span className={styles.fieldError}>This key is already in use.</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="f-label">
                Label
              </label>
              <input
                id="f-label"
                className={styles.input}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Wi-Fi"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="f-category">
                Category
              </label>
              <select
                id="f-category"
                className={styles.input}
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
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="f-icon">
                Icon
              </label>
              <select
                id="f-icon"
                className={styles.input}
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

          <div className={styles.formSectionHint}>
            <span className={styles.ownerTileFootMeta}>Preview</span>
            <span className={styles.facilityPreview}>
              <FacilityGlyph iconKey={iconKey} size={20} />
              {label || "Facility label"}
            </span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="dabi-btn dabi-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="dabi-btn dabi-btn-primary">
            <IconSliders size={16} />
            {initial ? "Save changes" : "Create facility"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
