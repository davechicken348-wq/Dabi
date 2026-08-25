import styles from "./FindHostel.module.css";

export default function HostelSkeleton() {
  return (
    <article className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonMedia} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skelLine} ${styles.skelTitle}`} />
        <div className={`${styles.skelLine} ${styles.skelShort}`} />
        <div className={`${styles.skelLine} ${styles.skelWide}`} />
        <div className={styles.skelMeta}>
          <div className={`${styles.skelLine} ${styles.skelPill}`} />
          <div className={`${styles.skelLine} ${styles.skelPill}`} />
        </div>
      </div>
    </article>
  );
}
