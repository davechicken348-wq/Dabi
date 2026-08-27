import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveImage from "../components/ResponsiveImage/ResponsiveImage";
import styles from "./HelpCenter.module.css";

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const SearchIcon = () => (
  <Icon size={16}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </Icon>
);

const XIcon = () => (
  <Icon size={16}>
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </Icon>
);

const ChevronIcon = () => (
  <Icon size={16}>
    <path d="m6 9 6 6 6-6"></path>
  </Icon>
);

type Faq = { q: string; a: string };

const FAQ: Faq[] = [
  {
    q: "How do I add a new hostel?",
    a: "Press ⌘K (or Ctrl+K) and choose “Add hostel”, or open Hostels and use the Add button. Enter the name, location, yearly price, room type and availability, then upload a cover photo. Saving publishes it to the public site.",
  },
  {
    q: "How do I verify a listing?",
    a: "Open Hostels, filter by “Unverified”, then open the hostel and toggle Verified. Verified hostels get a badge on the public site and stop showing up in the “needs verification” notifications.",
  },
  {
    q: "What do the availability states mean?",
    a: "Available, Limited and Full describe how many rooms are left. Use the availability filter on Hostels to surface Limited/Full listings that need an update, then edit the counts.",
  },
  {
    q: "How do enquiries work?",
    a: "Enquiries are messages from students interested in a hostel. Open Enquiries to read and reply. When a booking is confirmed you can use the “Record” action on an enquiry to create a tenancy directly.",
  },
  {
    q: "How do I create a tenancy?",
    a: "Tenancies are usually created by recording a reservation from an enquiry, but you can also add one from the Tenancies page. Set the occupant, hostel, room type, move-in/move-out dates and a status (Pending, Active or Ended).",
  },
  {
    q: "How do I confirm or end a tenancy?",
    a: "Open the tenancy and use Confirm to move it from Pending to Active, or End to record the move-out date and mark it Ended. Ended tenancies stay in the list for your records.",
  },
  {
    q: "How do deals and discounts work?",
    a: "Open Deals and create a promotion with a discount percentage. Active deals are shown to students on the public site, so they’re a quick way to fill Limited/Full hostels.",
  },
  {
    q: "How do I manage owners?",
    a: "Owners are the hostel managers. Add one from the Owners page (or ⌘K → “Add owner”), then link their hostels so they appear under Managed hostels. You stay the admin and can edit anything.",
  },
  {
    q: "What are facilities?",
    a: "Facilities are amenities like wifi, laundry or a study room that you attach to hostels. Manage the master list on the Facilities page, then toggle them on each hostel.",
  },
  {
    q: "How do I use the command menu?",
    a: "Press ⌘K (or Ctrl+K) anywhere, or click the Search pill. Type to filter, use ↑/↓ to move, ↵ to run, Esc to close. It jumps you to any section and opens create forms instantly — it’s the fastest way to operate the dashboard.",
  },
  {
    q: "Are there other keyboard shortcuts?",
    a: "⌘K / Ctrl+K opens the command menu. Esc closes any open dialog or panel. Inside the command menu, ↑/↓ navigate and ↵ selects.",
  },
  {
    q: "How do I view the public site?",
    a: "Open the command menu and choose “View public site”, or click your avatar in the top-right and pick “View public site”.",
  },
  {
    q: "How do I sign out?",
    a: "Click your avatar in the top-right and choose “Sign out”, or use the command menu “Sign out” action. Your session ends and you’ll return to the login screen.",
  },
];

export default function HelpCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setOpenIds(new Set());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (q: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });
  };

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayShow : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Help and support"
        aria-hidden={!open}
      >
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Help &amp; Support</span>
            <span className={styles.headerSub}>Your Dabi control-center guide</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close help"
          >
            <XIcon />
          </button>
        </header>

        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            className={styles.searchInput}
            placeholder="Search help…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help"
          />
        </div>

        <div className={styles.body}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              No answers match “{query}”. Try a different keyword, or contact
              support from the public site.
            </div>
          ) : (
            <div className={styles.faq}>
              {filtered.map((f) => {
                const isOpen = openIds.has(f.q);
                return (
                  <div className={styles.faqItem} key={f.q}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() => toggle(f.q)}
                      aria-expanded={isOpen}
                    >
                      <span>{f.q}</span>
                      <span
                        className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ""}`}
                      >
                        <ChevronIcon />
                      </span>
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{f.a}</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.heroCard}>
            <ResponsiveImage
              name="hostel_bedroom_isometric"
              alt="Isometric illustration of a hostel bedroom"
              className={styles.heroImg}
              sizes="(max-width: 480px) 100vw, 440px"
            />
            <div className={styles.heroOverlay}>
              <p className={styles.heroText}>Your Dabi workspace, visualized.</p>
              <button className={styles.heroBtn} onClick={() => go("/admin")}>
                Open dashboard
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.footLink} onClick={() => go("/")}>
              View public site
            </button>
            <span className={styles.footSep}>·</span>
            <button className={styles.footLink} onClick={() => go("/contact")}>
              Contact support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
