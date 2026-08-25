import { Link } from "react-router-dom";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className={`dabi-container ${styles.panel}`}>
        <div className={styles.text}>
          <h2 className={styles.title}>Still looking for a place?</h2>
          <p className={styles.lead}>
            Tell Dabi what you&rsquo;re looking for and we&rsquo;ll help you find an option that
            fits.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
            Find a Hostel
          </Link>
          <Link to="/contact" className="dabi-btn dabi-btn-secondary">
            Talk to Dabi
          </Link>
        </div>
      </div>
    </section>
  );
}
