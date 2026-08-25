import { useEffect, type ReactNode } from "react";
import { IconClose } from "../../components/Icons/Icons";
import Badge from "./Badge";
import styles from "../admin.module.css";

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
  /** Background colour of the avatar (and hero accent). */
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
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div
        className={`${styles.modal} ${wide ? styles.modalWide : ""} ${styles.recordModal}`}
      >
        <div className={styles.recordHero} style={{ ["--rec" as string]: avatarColor }}>
          <button
            type="button"
            className={styles.recordClose}
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose size={20} />
          </button>
          <span
            className={styles.recordAvatar}
            style={{ background: avatarColor }}
          >
            {avatarText}
          </span>
          <div className={styles.recordHeroText}>
            <h2 className={styles.recordName}>{name}</h2>
            {sub && <p className={styles.recordSub}>{sub}</p>}
          </div>
          {status && (
            <span className={styles.recordStatus}>
              <Badge variant={status.variant}>{status.label}</Badge>
            </span>
          )}
        </div>
        <div className={styles.recordBody}>{children}</div>
      </div>
    </div>
  );
}
