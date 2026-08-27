import { useEffect, type ReactNode } from "react";
import { IconClose } from "../../components/Icons/Icons";
import Badge from "./Badge";
import styles from "./RecordModal.module.css";

interface RecordStatus {
  label: string;
  variant:
    | "Available"
    | "Limited"
    | "Full"
    | "New"
    | "Contacted"
    | "Resolved"
    | "Active"
    | "Inactive"
    | "Yes"
    | "No";
}

interface RecordModalProps {
  name: string;
  /** Small line under the name, e.g. "Sunny Hostel · +233 20 123 4567". */
  sub?: ReactNode;
  status?: RecordStatus;
  /** Initials shown in the avatar. */
  avatarText: string;
  /** Background colour of the avatar. */
  avatarColor: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function RecordModal({
  name,
  sub,
  status,
  avatarText,
  avatarColor,
  onClose,
  children,
  wide,
}: RecordModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${styles.card} ${wide ? styles.wide : ""}`}>
        <div className={styles.header}>
          <span className={styles.avatar} style={{ background: avatarColor }}>
            {avatarText}
          </span>
          <div className={styles.titleBlock}>
            <h2 className={styles.name}>{name}</h2>
            {sub && <p className={styles.sub}>{sub}</p>}
          </div>
          <div className={styles.headerRight}>
            {status && (
              <span className={styles.recordStatus}>
                <Badge variant={status.variant}>{status.label}</Badge>
              </span>
            )}
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close"
            >
              <IconClose size={18} />
            </button>
          </div>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
