import { useState } from "react";
import { IconPin, IconBed, IconSearch, IconChevronDown } from "../Icons/Icons";
import styles from "./SearchBar.module.css";

const locations = ["Anywhere", "Fiapre", "New Dormaa", "Abesim", "Odeneho Kwadaso"];
const budgets = ["Any budget", "GH₵1,500 – 2,000", "GH₵2,000 – 2,500", "GH₵2,500+"];
const roomTypes = ["Any room type", "1-in-1", "2-in-1", "3-in-1"];

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={`${styles.wrap} ${expanded ? styles.expanded : ""}`}
      aria-label="Find a hostel"
    >
      <div className={`dabi-container ${styles.panel}`}>
        <button
          type="button"
          className={styles.pill}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={styles.pillIcon}>
            <IconSearch size={18} />
          </span>
          <span className={styles.pillText}>Find a hostel</span>
          <span className={styles.pillCaret}>
            <IconChevronDown size={16} />
          </span>
        </button>

        <div className={styles.inner}>
          <div className={styles.innerBody}>
            <p className={styles.heading}>Find a hostel that fits you.</p>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.field}>
                <label htmlFor="loc" className={styles.label}>
                  <IconPin size={16} className={styles.locIcon} /> Location
                </label>
                <select id="loc" name="location" className={styles.control} defaultValue="Anywhere">
                  {locations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="budget" className={styles.label}>
                  <IconSearch size={16} /> Budget
                </label>
                <select id="budget" name="budget" className={styles.control} defaultValue="Any budget">
                  {budgets.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="room" className={styles.label}>
                  <IconBed size={16} /> Room type
                </label>
                <select id="room" name="roomType" className={styles.control} defaultValue="Any room type">
                  {roomTypes.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className={`dabi-btn dabi-btn-primary ${styles.submit}`}>
                <IconSearch size={18} /> Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
