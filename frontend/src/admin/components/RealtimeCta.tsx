import styles from "./RealtimeCta.module.css";

interface RealtimeCtaProps {
  onAction?: () => void;
  actionLabel?: string;
}

function MousePointer() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
    </svg>
  );
}

function RingMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 1.78677L44.2132 23L23 44.2132L1.7868 23L23 1.78677ZM23 0.372559L23.7071 1.07967L44.9203 22.2929L45.6274 23L44.9203 23.7071L23.7071 44.9203L23 45.6274L22.2929 44.9203L1.07969 23.7071L0.372583 23L1.07969 22.2929L22.2929 1.07967L23 0.372559Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 23C30 26.866 26.866 30 23 30C19.134 30 16 26.866 16 23C16 19.134 19.134 16 23 16C26.866 16 30 19.134 30 23ZM31 23C31 27.4183 27.4183 31 23 31C18.5817 31 15 27.4183 15 23C15 18.5817 18.5817 15 23 15C27.4183 15 31 18.5817 31 23Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function RealtimeCta({ onAction, actionLabel = "View enquiries" }: RealtimeCtaProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.art} aria-hidden="true">
        <div
          className={`${styles.cursor} ${styles.cursorWarn}`}
          style={{ transform: "translateX(70.3849px) translateY(90.8269px)" }}
        >
          <MousePointer />
        </div>
        <div
          className={`${styles.cursor} ${styles.cursorBrand}`}
          style={{ transform: "translateX(34.8094px) translateY(77.3925px)" }}
        >
          <MousePointer />
        </div>
      </div>
      <h2 className={styles.title}>Enquiries come to you</h2>
      <p className={styles.text}>
        When a customer sends an enquiry it lands here the moment they hit send.
        No setup needed — just wait and reply.
      </p>
      <button type="button" className={styles.btn} onClick={onAction}>
        <span className={styles.btnIcon}>
          <RingMark />
        </span>
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
