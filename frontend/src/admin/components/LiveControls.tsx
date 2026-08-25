import { useEffect, useState } from "react";
import { IconRefresh } from "../../components/Icons/Icons";
import styles from "../admin.module.css";

function relativeTime(from: Date, now: number): string {
  const secs = Math.max(0, Math.round((now - from.getTime()) / 1000));
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function LiveControls({
  lastUpdated,
  loading = false,
  onRefresh,
  dark = false,
}: {
  lastUpdated: Date | null;
  loading?: boolean;
  onRefresh: () => void;
  dark?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`${styles.liveControls} ${dark ? styles.onDark : ""}`}>
      <span
        className={`${styles.livePill} ${loading ? styles.livePillBusy : ""}`}
        title={loading ? "Refreshing…" : "Updates automatically"}
      >
        <span className={styles.liveDot} />
        Live
      </span>
      <span className={styles.liveUpdated}>
        {lastUpdated ? `Updated ${relativeTime(lastUpdated, now)}` : "Not yet loaded"}
      </span>
      <button
        type="button"
        className={styles.liveBtn}
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh now"
        title="Refresh now"
      >
        <IconRefresh size={16} className={loading ? styles.liveSpin : undefined} />
      </button>
    </div>
  );
}
