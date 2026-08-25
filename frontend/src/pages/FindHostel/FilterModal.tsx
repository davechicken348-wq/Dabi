import { useEffect, useMemo, useRef, useState } from "react";
import { IconClose, IconCheck } from "../../components/Icons/Icons";
import {
  AVAILABILITY_OPTIONS,
  DEFAULT_FILTERS,
  type Filters,
} from "./options";
import { useFacilities } from "../../context/FacilitiesContext";
import { FacilityGlyph } from "../../services/facilityIcons";
import styles from "./FindHostel.module.css";

interface Props {
  open: boolean;
  value: Filters;
  /** Facility keys that exist in the current result set (for adaptive display). */
  availableFacilities?: string[];
  onClose: () => void;
  onApply: (next: Filters) => void;
}

export default function FilterModal({
  open,
  value,
  availableFacilities,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState<Filters>(value);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { facilities } = useFacilities();

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const toggleFacility = (id: string) =>
    setDraft((d) => ({
      ...d,
      facilities: d.facilities.includes(id)
        ? d.facilities.filter((x) => x !== id)
        : [...d.facilities, id],
    }));

  const visibleFacilities = useMemo(() => {
    const available = new Set(availableFacilities ?? []);
    const selected = new Set(draft.facilities);
    const candidates = facilities.filter(
      (f) => available.has(f.key) || selected.has(f.key),
    );
    return candidates.sort((a, b) => {
      const aAvail = available.has(a.key) ? 0 : 1;
      const bAvail = available.has(b.key) ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      return a.label.localeCompare(b.label);
    });
  }, [facilities, availableFacilities, draft.facilities]);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <div>
            <span className="dabi-eyebrow">Find what fits you</span>
            <h2 id="filter-title" className={styles.modalTitle}>
              Filters
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.modalClose}
            aria-label="Close filters"
            onClick={onClose}
          >
            <IconClose size={22} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <fieldset className={styles.filterGroup}>
            <legend className={styles.groupTitle}>Availability</legend>
            <select
              className={styles.control}
              value={draft.availability}
              onChange={(e) => set("availability", e.target.value)}
            >
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.filterGroup}>
            <legend className={styles.groupTitle}>Facilities</legend>
            {visibleFacilities.length === 0 ? (
              <p className={styles.groupHint}>
                No facilities available in the current results.
              </p>
            ) : (
              <div className={styles.facilityGrid}>
                {visibleFacilities.map((f) => {
                  const active = draft.facilities.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      className={`${styles.facilityChip} ${active ? styles.facilityActive : ""}`}
                      aria-pressed={active}
                      onClick={() => toggleFacility(f.key)}
                    >
                      <FacilityGlyph iconKey={f.iconKey} size={16} />
                      {active && <IconCheck size={15} strokeWidth={2.6} />}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>

          <fieldset className={styles.filterGroup}>
            <legend className={styles.groupTitle}>Verification</legend>
            <button
              type="button"
              className={`${styles.toggleRow} ${draft.recentlyVerified ? styles.toggleOn : ""}`}
              aria-pressed={draft.recentlyVerified}
              onClick={() => set("recentlyVerified", !draft.recentlyVerified)}
            >
              <span>Recently verified only</span>
              <span className={styles.switch} aria-hidden="true" />
            </button>
          </fieldset>
        </div>

        <div className={styles.modalFoot}>
          <button
            type="button"
            className="dabi-btn dabi-btn-secondary"
            onClick={() => setDraft(DEFAULT_FILTERS)}
          >
            Clear All
          </button>
          <button
            type="button"
            className="dabi-btn dabi-btn-primary"
            onClick={() => onApply(draft)}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
