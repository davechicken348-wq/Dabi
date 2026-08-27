import { useEffect, type ReactNode } from "react";
import { IconClose } from "../../components/Icons/Icons";
import styles from "../admin.module.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  xwide?: boolean;
  narrow?: boolean;
}

export default function Modal({ title, onClose, children, wide, xwide, narrow }: ModalProps) {
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
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`${styles.modal} ${wide ? styles.modalWide : ""} ${
          xwide ? styles.modalXWide : ""
        } ${narrow ? styles.modalNarrow : ""}`}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
