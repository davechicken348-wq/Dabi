import type { GalleryImage } from "../../data/hostelDetails";
import { IconImages } from "../../components/Icons/Icons";
import styles from "./HostelDetails.module.css";

interface GalleryProps {
  images: GalleryImage[];
  onOpen: (index: number) => void;
  title?: string;
}

export default function Gallery({ images, onOpen, title }: GalleryProps) {
  const [main, ...rest] = images;
  const side = rest.slice(0, 4);
  const extra = rest.length - side.length;

  return (
    <div className={styles.gallery}>
      <button
        type="button"
        className={`${styles.galleryMain} ${styles.galleryBtn}`}
        onClick={() => onOpen(0)}
        aria-label={`Open photo: ${main.alt}`}
      >
        <img src={main.src} alt={main.alt} className={styles.galleryImg} loading="eager" />
        <span className={styles.galleryScrim} aria-hidden="true" />
        <span className={styles.galleryCaption}>
          <span className={styles.galleryEyebrow}>Gallery</span>
          <span className={styles.galleryCaptionTitle}>{title ?? "A look inside"}</span>
        </span>
      </button>

      <div className={styles.gallerySide}>
        {side.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className={`${styles.galleryThumb} ${styles.galleryBtn}`}
            onClick={() => onOpen(i + 1)}
            aria-label={`Open photo: ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} className={styles.galleryImg} loading="lazy" />
            <span className={styles.galleryThumbScrim} aria-hidden="true" />
            {i === side.length - 1 && extra > 0 && (
              <span className={styles.galleryMore} aria-hidden="true">
                +{extra} more
              </span>
            )}
          </button>
        ))}
      </div>

      <button type="button" className={styles.galleryAll} onClick={() => onOpen(0)}>
        <IconImages size={18} /> View all {images.length} photos
      </button>
    </div>
  );
}
