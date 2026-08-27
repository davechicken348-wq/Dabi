import { Link } from "react-router-dom";
import {
  IconWhatsapp,
  IconFacebook,
  IconInstagram,
  IconPin,
  IconUser,
  IconPlus,
  IconCompass,
  IconSearch,
  IconMap,
  IconMail,
  IconArrowUpRight,
} from "../Icons/Icons";
import Wordmark from "../Wordmark/Wordmark";
import styles from "./Footer.module.css";

const exploreLinks = [
  { label: "Find a Hostel", to: "/find-hostel", Icon: IconSearch },
  { label: "Locations", to: "/locations", Icon: IconMap },
  { label: "How It Works", to: "/how-it-works", Icon: IconCompass },
];

const companyLinks = [
  { label: "About", to: "/about", Icon: IconPin },
  { label: "Contact", to: "/contact", Icon: IconMail },
];

const adminLinks = [
  { label: "Admin sign in", to: "/admin", Icon: IconUser },
  { label: "Add a hostel", to: "/admin", Icon: IconPlus },
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
            A local hostel discovery service helping students around STU find real, verified
            places to stay.
          </p>
          <div className={styles.social}>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="WhatsApp (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
              <IconWhatsapp size={20} />
            </a>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="Facebook (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
              <IconFacebook size={20} />
            </a>
            <a
              className={styles.socialLink}
              href="#"
              aria-label="Instagram (placeholder)"
              onClick={(e) => e.preventDefault()}
            >
              <IconInstagram size={20} />
            </a>
          </div>
        </div>

        <nav className={styles.col} aria-label="Explore">
          <h3 className={styles.colTitle}>Explore</h3>
          {exploreLinks.map((l) => (
            <Link key={l.label} to={l.to} className={styles.link}>
              <l.Icon size={16} className={styles.linkIcon} />
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Company">
          <h3 className={styles.colTitle}>Company</h3>
          {companyLinks.map((l) => (
            <Link key={l.label} to={l.to} className={styles.link}>
              <l.Icon size={16} className={styles.linkIcon} />
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Admin">
          <h3 className={styles.colTitle}>Admin</h3>
          {adminLinks.map((l) => (
            <Link key={l.label} to={l.to} className={styles.link}>
              <l.Icon size={16} className={styles.linkIcon} />
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={`dabi-container ${styles.bottom}`}>
        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} Dabi. A local hostel discovery service around STU.
        </p>
        <div className={styles.bottomRight}>
          <span className={styles.status}>
            <span className={styles.statusDot} />
            All systems normal
          </span>
          <Link to="/find-hostel" className={styles.backTop}>
            Back to top
            <IconArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
