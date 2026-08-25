import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  IconMenu,
  IconClose,
  IconChevronDown,
  IconSearch,
  IconPin,
  IconUser,
} from "../Icons/Icons";
import Wordmark from "../Wordmark/Wordmark";
import styles from "./Navbar.module.css";

const primaryLinks = [
  { label: "Find a Hostel", to: "/find-hostel" },
  { label: "Locations", to: "/locations" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
];

const moreLinks = [
  { label: "Contact", to: "/contact", Icon: IconPin },
  { label: "Admin", to: "/admin", Icon: IconUser },
];

const allLinks = [...primaryLinks, ...moreLinks];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Mobile menu: lock body scroll, close on Escape, and close if the viewport
  // grows past the mobile breakpoint (e.g. rotate / resize to desktop).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const headerClass = `${styles.header} ${styles.solid}`;

  return (
    <header className={headerClass}>
      <div className={`dabi-container ${styles.bar}`}>
        <Link to="/home" className={styles.brand} aria-label="Dabi home">
          <Wordmark invert={false} />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className={styles.more} ref={moreRef}>
            <button
              type="button"
              className={`${styles.moreBtn} ${moreOpen ? styles.moreBtnOpen : ""}`}
              aria-haspopup="true"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
              <IconChevronDown size={15} className={styles.moreCaret} />
            </button>

            {moreOpen && (
              <div className={styles.menu} role="menu">
                {moreLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    role="menuitem"
                    className={styles.menuLink}
                    onClick={() => setMoreOpen(false)}
                  >
                    <l.Icon size={17} className={styles.menuIcon} />
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className={styles.actions}>
          <span
            className={styles.schoolComing}
            title="School picker is coming soon"
          >
            📍 Coming soon
          </span>

          <Link to="/find-hostel" className={`dabi-btn dabi-btn-primary ${styles.cta}`}>
            <IconSearch size={17} />
            Find a Hostel
          </Link>

          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobile} ${open ? styles.mobileOpen : ""}`}
        aria-hidden={!open}
      >
        <nav className={styles.mobileNav} aria-label="Mobile">
          {allLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/find-hostel"
            className={`dabi-btn dabi-btn-primary ${styles.mobileCta}`}
            onClick={() => setOpen(false)}
          >
            <IconSearch size={17} />
            Find a Hostel
          </Link>
          <span className={styles.mobileSchoolComing}>📍 School picker — coming soon</span>
        </nav>
      </div>
    </header>
  );
}
