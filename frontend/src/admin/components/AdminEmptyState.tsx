import type { ReactNode } from "react";
import styles from "../admin.module.css";

const EMPTY_ART = "/illustrations/Drafts-Empty-No-Drafts--Streamline-Lagos.png";
const ERROR_ART = "/illustrations/No-Connection-1--Streamline-Brooklyn.png";

interface AdminEmptyStateProps {
  variant: "error" | "empty";
  title: string;
  text: string;
  /** Override the default illustration (empty -> Drafts, error -> No-Connection). */
  illustration?: string;
  illustrationAlt?: string;
  /** Small uppercase label shown above the title. */
  eyebrow?: string;
  /** Optional supporting message under the text (e.g. hint pill). */
  hint?: string;
  /** Optional technical detail, usually the raw error message. */
  detail?: string;
  /** Primary action button. */
  action?: { label: ReactNode; onClick: () => void };
}

export default function AdminEmptyState({
  variant,
  title,
  text,
  illustration,
  illustrationAlt,
  eyebrow,
  hint,
  detail,
  action,
}: AdminEmptyStateProps) {
  const src = illustration ?? (variant === "error" ? ERROR_ART : EMPTY_ART);
  return (
    <div className={styles.empty}>
      <img
        className={styles.emptyArt}
        src={src}
        alt={illustrationAlt ?? ""}
        width={168}
        height={168}
      />
      {eyebrow && <span className={styles.emptyEyebrow}>{eyebrow}</span>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyText}>{text}</p>
      {detail && <p className={styles.emptyDetail}>{detail}</p>}
      {hint && <span className={styles.emptyHint}>{hint}</span>}
      {action && (
        <button
          type="button"
          className={`dabi-btn dabi-btn-primary ${styles.emptyAction} ${styles.btnSm}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
