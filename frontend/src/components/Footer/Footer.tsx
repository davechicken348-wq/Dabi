import { Link } from "react-router-dom";
import { IconWhatsapp, IconFacebook, IconInstagram } from "../Icons/Icons";
import Wordmark from "../Wordmark/Wordmark";
import styles from "./Footer.module.css";

const exploreLinks = [
  { label: "Find a Hostel", to: "/find-hostel" },
  { label: "Locations", to: "/locations" },
  { label: "How It Works", to: "/how-it-works" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`dabi-container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Wordmark invert />
          </div>
          <p className={styles.tag}>Find a place. Find it easier.</p>
          <p className={styles.desc}>
            A local hostel discovery service helping students around STU find real, verified places
            to stay.
          </p>
          <div className={styles.social}>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="WhatsApp (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
               <IconWhatsapp size={22} />
            </a>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="Facebook (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
               <IconFacebook size={22} />
            </a>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="Instagram (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
               <IconInstagram size={22} />
            </a>
          </div>
        </div>

        <nav className={styles.col} aria-label="Explore">
          <h3 className={styles.colTitle}>Explore</h3>
          {exploreLinks.map((l) => (
            <Link key={l.to} to={l.to} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Company">
          <h3 className={styles.colTitle}>Company</h3>
          {companyLinks.map((l) => (
            <Link key={l.to} to={l.to} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={`dabi-container ${styles.bottom}`}>
        <p>&copy; {new Date().getFullYear()} Dabi. A local hostel discovery service around STU.</p>
        <span className={styles.built}>
          <span className={styles.builtDot} /> Built local, for STU.
        </span>
      </div>
    </footer>
  );
}
