import { useState, type CSSProperties } from "react";
import { imageManifest, type ImageManifestEntry } from "../../lib/imageManifest";
import styles from "./ResponsiveImage.module.css";

interface ResponsiveImageProps {
  /** Key in the image manifest, e.g. "how_it_works1". */
  name: string;
  alt: string;
  /** Responsive `sizes` attribute. Tune per placement. */
  sizes?: string;
  /** Set for above-the-fold / LCP images (eager + high priority). */
  priority?: boolean;
  /** Image has transparency — skip the solid placeholder box. */
  transparent?: boolean;
  /** Don't crop the image to the container (e.g. art that overflows intentionally). */
  contain?: boolean;
  className?: string;
  imgClassName?: string;
}

function buildSrcSet(variants: { w: number; src: string }[]) {
  return variants.map((v) => `${v.src} ${v.w}w`).join(", ");
}

export default function ResponsiveImage({
  name,
  alt,
  sizes = "(max-width: 768px) 100vw, 760px",
  priority = false,
  transparent = false,
  contain = false,
  className,
  imgClassName,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const entry: ImageManifestEntry | undefined = imageManifest[name];

  if (!entry) {
    // Fallback to a plain path if the name is not in the manifest.
    return (
      <img
        src={`/images/${name}.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`${styles.img} ${imgClassName ?? ""}`}
      />
    );
  }

  const aspect: CSSProperties = {
    aspectRatio: `${entry.width} / ${entry.height}`,
  };

  // React 18 doesn't type the lowercase `fetchpriority` attribute, but the
  // browser needs it lowercase. Spread via a typed object to keep TS happy.
  const fetchPriorityAttr = {
    fetchpriority: (priority ? "high" : "auto") as "high" | "auto",
  } as Record<string, string>;

  return (
    <span
      className={`${styles.wrap} ${transparent ? styles.transparent : ""} ${
        contain ? styles.contain : ""
      } ${className ?? ""}`}
      style={aspect}
    >
      <img
        src={entry.lqip}
        alt=""
        aria-hidden="true"
        className={`${styles.lqip} ${loaded ? styles.lqipHidden : ""}`}
      />
      <picture>
        {entry.avif.length > 0 && (
          <source type="image/avif" srcSet={buildSrcSet(entry.avif)} sizes={sizes} />
        )}
        <source type="image/webp" srcSet={buildSrcSet(entry.webp)} sizes={sizes} />
        <img
          src={entry.webp[entry.webp.length - 1].src}
          alt={alt}
          width={entry.width}
          height={entry.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...fetchPriorityAttr}
          onLoad={() => setLoaded(true)}
          className={`${styles.img} ${loaded ? styles.loaded : ""} ${imgClassName ?? ""}`}
        />
      </picture>
    </span>
  );
}
