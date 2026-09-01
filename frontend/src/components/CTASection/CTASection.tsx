import { Link } from "react-router-dom";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className={`dabi-container ${styles.inner}`}>
        <p className={styles.eyebrow}>Ready when you are</p>
        <h2 className={styles.title}>Your next place is out there.<br />Let's find it.</h2>
        <Link to="/find-hostel" className={`dabi-btn ${styles.btn}`}>
          Find a Hostel
        </Link>
      </div>
    </section>
  );
}
