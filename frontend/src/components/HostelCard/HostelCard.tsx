import { Link } from "react-router-dom";
import type { Hostel } from "../../data/hostels";
import { IconPin, IconBed, IconArrow } from "../Icons/Icons";
import VerificationBadge from "../VerificationBadge/VerificationBadge";
import styles from "./HostelCard.module.css";

const statusClass: Record<Hostel["availability"], string> = {
  Available: styles.available,
  Limited: styles.limited,
  Full: styles.full,
};

export default function HostelCard({ hostel }: { hostel: Hostel }) {
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
        <div className={styles.badge}>
          {hostel.verified && <VerificationBadge />}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{hostel.name}</h3>
          <span className={`${styles.status} ${statusClass[hostel.availability]}`}>
            <span className={styles.statusDot} />
            {hostel.availability}
          </span>
        </div>

        <p className={styles.loc}>
          <IconPin size={16} className={styles.locIcon} /> {hostel.location}
        </p>

        {hostel.note && <p className={styles.note}>{hostel.note}</p>}

        <div className={styles.meta}>
          <span className={styles.room}>
            <IconBed size={16} /> {hostel.roomType}
          </span>
          <span className={styles.price}>
            GH₵{price} <small>/ year</small>
          </span>
        </div>

        <Link to={`/hostel/${hostel.id}`} className={styles.cta}>
          View Hostel <IconArrow size={18} />
        </Link>
      </div>
    </article>
  );
}
