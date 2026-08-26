import { Link } from "react-router-dom";
import type { Hostel } from "../../data/hostels";
import { IconPin, IconBed, IconArrow } from "../Icons/Icons";
import VerificationBadge from "../VerificationBadge/VerificationBadge";
import styles from "./HostelGridCard.module.css";

const statusClass: Record<Hostel["availability"], string> = {
  Available: styles.available,
  Limited: styles.limited,
  Full: styles.full,
};

export default function HostelGridCard({ hostel }: { hostel: Hostel }) {
  const price = hostel.pricePerYear.toLocaleString("en-GH");

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img
          src={hostel.image}
          alt={`${hostel.name} in ${hostel.location}`}
          className={styles.image}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
        />
        {hostel.verified && (
          <div className={styles.badge}>
            <VerificationBadge />
          </div>
        )}
        <span className={`${styles.status} ${statusClass[hostel.availability]}`}>
          {hostel.availability}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{hostel.name}</h3>

        <p className={styles.loc}>
          <IconPin size={15} className={styles.locIcon} /> {hostel.location}
          {hostel.distanceKm != null && (
            <span className={styles.dist}> · {hostel.distanceKm.toFixed(1)} km from STU</span>
          )}
        </p>

        <div className={styles.meta}>
          <span className={styles.room}>
            <IconBed size={15} />
            <span className={styles.roomText}>{hostel.roomType}</span>
          </span>
          <span className={styles.price}>
            GH₵{price}
            <small>/yr</small>
          </span>
        </div>

        <Link to={`/hostel/${hostel.id}`} className={styles.cta}>
          View Hostel <IconArrow size={16} />
        </Link>
      </div>
    </article>
  );
}
