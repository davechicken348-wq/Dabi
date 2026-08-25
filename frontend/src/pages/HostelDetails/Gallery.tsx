import type { GalleryImage } from "../../data/hostelDetails";
import { IconImages } from "../../components/Icons/Icons";
import styles from "./HostelDetails.module.css";

interface GalleryProps {
  images: GalleryImage[];
  onOpen: (index: number) => void;
}

export default function Gallery({ images, onOpen }: GalleryProps) {
  const [main, ...rest] = images;
  const side = rest.slice(0, 2);

  return (
    <div className={styles.gallery}>
      <button
        type="button"
        className={`${styles.galleryMain} ${styles.galleryBtn}`}
        onClick={() => onOpen(0)}
        aria-label={`Open photo: ${main.alt}`}
      >
        <img src={main.src} alt={main.alt} className={styles.galleryImg} loading="eager" />
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
          </button>
        ))}
      </div>

      <button type="button" className={styles.galleryAll} onClick={() => onOpen(0)}>
        <IconImages size={18} /> View all {images.length} photos
      </button>
    </div>
  );
}
