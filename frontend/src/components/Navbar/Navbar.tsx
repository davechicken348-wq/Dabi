import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  IconMenu,
  IconClose,
  IconChevronDown,
  IconSearch,
  IconPin,
  IconUser,
  IconMap,
  IconCrosshair,
  IconCompass,
  IconList,
  IconSparkles,
  IconArrowUpRight,
} from "../Icons/Icons";
import Wordmark from "../Wordmark/Wordmark";
import styles from "./Navbar.module.css";

type MenuIcon = (p: { size?: number }) => JSX.Element;

type MenuEntry = {
  label: string;
  to: string;
  desc: string;
  Icon: MenuIcon;
};

type PrimaryLink = {
  label: string;
  to: string;
  menu?: MenuEntry[];
};

const primaryLinks: PrimaryLink[] = [
  {
    label: "Find a Hostel",
    to: "/find-hostel",
    menu: [
      { label: "Search hostels", to: "/find-hostel", desc: "Filter by price, area & facilities", Icon: IconSearch },
      { label: "Browse the map", to: "/locations", desc: "See what's near campus", Icon: IconMap },
    ],
  },
  {
    label: "Locations",
    to: "/locations",
    menu: [
      { label: "All areas", to: "/locations", desc: "Every verified neighbourhood", Icon: IconPin },
      { label: "Near campus", to: "/locations", desc: "Shortest walk to lectures", Icon: IconCrosshair },
    ],
  },
  {
    label: "How It Works",
    to: "/how-it-works",
    menu: [
      { label: "For students", to: "/how-it-works", desc: "Find a room in minutes", Icon: IconCompass },
      { label: "For owners", to: "/how-it-works", desc: "List your hostel — free", Icon: IconUser },
      { label: "Step by step", to: "/how-it-works", desc: "How Dabi matches you", Icon: IconList },
    ],
  },
  { label: "About", to: "/about" },
];

const moreLinks: MenuEntry[] = [
  { label: "Contact", to: "/contact", desc: "Questions or feedback", Icon: IconPin },
  { label: "Admin sign in", to: "/admin", desc: "Manage hostels & listings", Icon: IconUser },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

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

  const mobileEntries = primaryLinks.flatMap((l) =>
    l.menu ? [{ label: l.label, to: l.to }, ...l.menu] : [{ label: l.label, to: l.to }]
  );

  return (
    <header className={`${styles.header} ${styles.solid}`}>
      {bannerOpen && (
        <div className={styles.banner}>
          <IconSparkles size={15} className={styles.bannerIcon} />
          <span className={styles.bannerText}>
            School &amp; campus picker is coming soon — explore verified hostels near STU now.
          </span>
          <Link to="/find-hostel" className={styles.bannerLink}>
            Search
            <IconArrowUpRight size={13} />
          </Link>
          <button
            type="button"
            className={styles.bannerClose}
            aria-label="Dismiss announcement"
            onClick={() => setBannerOpen(false)}
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      <div className={`dabi-container ${styles.bar}`}>
        <Link to="/home" className={styles.brand} aria-label="Dabi home">
          <Wordmark invert={false} />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {primaryLinks.map((l) => (
            <div key={l.label} className={styles.item}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `${styles.link} ${l.menu ? styles.linkCaret : ""} ${isActive ? styles.linkActive : ""}`
                }
              >
                {l.label}
                {l.menu && <IconChevronDown size={14} className={styles.caret} />}
              </NavLink>

              {l.menu && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownInner}>
                    {l.menu.map((m) => (
                      <Link key={m.label} to={m.to} className={styles.entry} role="menuitem">
                        <span className={styles.entryIcon}>
                          <m.Icon size={18} />
                        </span>
                        <span className={styles.entryText}>
                          <span className={styles.entryTitle}>{m.label}</span>
                          <span className={styles.entryDesc}>{m.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className={styles.item}>
            <button type="button" className={`${styles.link} ${styles.linkCaret}`} tabIndex={0}>
              More
              <IconChevronDown size={14} className={styles.caret} />
            </button>
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownInner}>
                {moreLinks.map((m) => (
                  <Link key={m.label} to={m.to} className={styles.entry} role="menuitem">
                    <span className={styles.entryIcon}>
                      <m.Icon size={18} />
                    </span>
                    <span className={styles.entryText}>
                      <span className={styles.entryTitle}>{m.label}</span>
                      <span className={styles.entryDesc}>{m.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className={styles.actions}>
          <Link to="/find-hostel" className={styles.search} aria-label="Search hostels">
            <IconSearch size={18} />
          </Link>

          <Link to="/admin" className={styles.signin}>
            <IconUser size={16} />
            Sign in
          </Link>

          <Link to="/find-hostel" className={`dabi-btn dabi-btn-primary ${styles.cta}`}>
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
          {mobileEntries.map((m, i) => (
            <Link
              key={`${m.label}-${i}`}
              to={m.to}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {m.label}
            </Link>
          ))}
          {moreLinks.map((m) => (
            <Link
              key={m.label}
              to={m.to}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {m.label}
            </Link>
          ))}
          <Link
            to="/find-hostel"
            className={`dabi-btn dabi-btn-primary ${styles.mobileCta}`}
            onClick={() => setOpen(false)}
          >
            Find a Hostel
          </Link>
        </nav>
      </div>
    </header>
  );
}
