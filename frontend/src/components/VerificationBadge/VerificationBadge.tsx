import { IconCheck } from "../Icons/Icons";
import styles from "./VerificationBadge.module.css";

export default function VerificationBadge({
  label = "Dabi Verified",
  light = false,
}: {
  label?: string;
  light?: boolean;
}) {
  return (
    <span className={`${styles.badge} ${light ? styles.light : ""}`}>
      <span className={styles.dot}>
        <IconCheck size={12} strokeWidth={2.6} />
      </span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
