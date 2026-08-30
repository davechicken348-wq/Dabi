import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`dabi-container ${styles.grid}`}>
        <div className={styles.copy}>
          <span className="dabi-eyebrow-pill">Hostel hunting, made easier</span>
          <h1 className={styles.title}>
            Find a place.
            <br />
            <span className={styles.accent}>Find it easier.</span>
          </h1>
          <p className={styles.lead}>
            Discover verified hostels around STU without walking around looking for one.
          </p>
          <div className={styles.actions}>
            <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
              Find a Hostel
            </Link>
            <Link to="/how-it-works" className="dabi-btn dabi-btn-secondary">
              How Dabi Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
