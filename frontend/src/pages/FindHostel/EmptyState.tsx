import styles from "./FindHostel.module.css";

interface EmptyStateProps {
  onClear: () => void;
  /** Filters are active, so clearing them may surface more hostels */
  filtered?: boolean;
  /** The request failed, so the action should retry */
  error?: boolean;
}

export default function EmptyState({ onClear, filtered, error }: EmptyStateProps) {
  const title = error
    ? "We couldn’t load hostels"
    : filtered
      ? "Hmm, nothing here yet."
      : "No hostels just yet";
  const text = error
    ? "Something went wrong while loading listings. Please try again in a moment."
    : filtered
      ? "We couldn’t find a hostel matching all those filters."
      : "We’re still adding places to stay near STU. Check back soon — new hostels arrive every week.";

  return (
    <div className={styles.empty}>
      <img
        className={styles.emptyArt}
        src={error
          ? "/illustrations/No-Connection-1--Streamline-Brooklyn.png"
          : "/illustrations/Drafts-Empty-No-Drafts--Streamline-Lagos.png"}
        alt=""
        width={180}
        height={180}
      />
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyText}>{text}</p>
      {!error && filtered && (
        <button type="button" className="dabi-btn dabi-btn-primary" onClick={onClear}>
          Clear Filters
        </button>
      )}
      {error && (
        <button type="button" className="dabi-btn dabi-btn-primary" onClick={onClear}>
          Try again
        </button>
      )}
      {!error && filtered && (
        <p className={styles.emptyHint}>
          Try increasing your budget or expanding your location.
        </p>
      )}
    </div>
  );
}
