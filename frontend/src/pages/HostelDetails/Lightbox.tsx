import { useEffect, useRef } from "react";
import type { GalleryImage } from "../../data/hostelDetails";
import {
  IconClose,
  IconChevronLeft,
  IconChevronRight,
} from "../../components/Icons/Icons";
import styles from "./HostelDetails.module.css";

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = images[index];

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onPrev, onNext]);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${images.length}: ${current.alt}`}
      onClick={onClose}
    >
      <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className={styles.lightboxClose}
          onClick={onClose}
          aria-label="Close photo viewer"
        >
          <IconClose size={22} />
        </button>

        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
          onClick={onPrev}
          aria-label="Previous photo"
        >
          <IconChevronLeft size={26} />
        </button>

        <img src={current.src} alt={current.alt} className={styles.lightboxImg} />

        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxNext}`}
          onClick={onNext}
          aria-label="Next photo"
        >
          <IconChevronRight size={26} />
        </button>

        <div className={styles.lightboxCounter}>
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
