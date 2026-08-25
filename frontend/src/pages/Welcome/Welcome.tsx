import { Link } from "react-router-dom";
import { IconPin, IconArrow } from "../../components/Icons/Icons";
import Wordmark from "../../components/Wordmark/Wordmark";
import styles from "./Welcome.module.css";

export default function Welcome() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand} aria-label="Dabi home">
          <Wordmark invert />
        </Link>
        <Link to="/find-hostel" className={styles.topCta}>
          Find a Hostel
        </Link>
      </header>

      <div className={`dabi-container ${styles.grid}`}>
        <section className={styles.panel}>
          <span className={`dabi-eyebrow ${styles.eyebrow}`}>Welcome to Dabi</span>
          <h1 className={styles.title}>
            Find a place.
            <br />
            <span className={styles.accent}>Find it easier.</span>
          </h1>
          <p className={styles.lead}>
            Verified hostels for students at Sunyani Technical University — real rooms, real
            prices, and real availability. Skip the campus walk and move in with confidence.
          </p>
          <div className={styles.actions}>
            <Link to="/home" className="dabi-btn dabi-btn-primary">
              Enter Dabi <IconArrow size={18} />
            </Link>
            <Link to="/find-hostel" className="dabi-btn dabi-btn-secondary">
              Find a Hostel
            </Link>
          </div>
          <p className={styles.note}>
            <IconPin size={15} className={styles.noteIcon} /> A trusted local accommodation expert
            for STU students.
          </p>
        </section>
      </div>
    </main>
  );
}
