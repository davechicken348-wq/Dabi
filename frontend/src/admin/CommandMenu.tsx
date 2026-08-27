import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  IconSearch,
  IconPlus,
  IconBell,
  IconArrowUpRight,
  IconShield,
  IconBed,
  IconLogout,
} from "../components/Icons/Icons";
import {
  SbHome,
  SbBox,
  SbUsers,
  SbMessageSquare,
  SbList,
  SbTag,
  SbSliders,
  SbPanelLeftDashed,
} from "./adminIcons";
import styles from "./CommandMenu.module.css";

type CmdIcon = (p: { size?: number }) => JSX.Element;

interface Command {
  label: string;
  icon: CmdIcon;
  keywords?: string;
  run: () => void;
}

interface CommandGroup {
  heading: string;
  items: Command[];
}

export default function CommandMenu({
  open,
  onClose,
  onSignOut,
  onToggleSidebar,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
}) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (to: string) => {
      navigate(to);
      onClose();
    },
    [navigate, onClose]
  );

  const groups = useMemo<CommandGroup[]>(
    () => [
      {
        heading: "Navigate",
        items: [
          {
            label: "Go to Dashboard",
            icon: SbHome,
            keywords: "dashboard home overview stats",
            run: () => go("/admin"),
          },
          {
            label: "Go to Hostels",
            icon: SbBox,
            keywords: "hostels listings properties",
            run: () => go("/admin/hostels"),
          },
          {
            label: "Go to Owners",
            icon: SbUsers,
            keywords: "owners managers landlords",
            run: () => go("/admin/owners"),
          },
          {
            label: "Go to Enquiries",
            icon: SbMessageSquare,
            keywords: "enquiries messages leads",
            run: () => go("/admin/enquiries"),
          },
          {
            label: "Go to Tenancies",
            icon: SbList,
            keywords: "tenancies students occupants",
            run: () => go("/admin/tenancies"),
          },
          {
            label: "Go to Deals",
            icon: SbTag,
            keywords: "deals discounts promotions",
            run: () => go("/admin/deals"),
          },
          {
            label: "Go to Facilities",
            icon: SbSliders,
            keywords: "facilities amenities",
            run: () => go("/admin/facilities"),
          },
          {
            label: "Go to Managed hostels",
            icon: SbBox,
            keywords: "managed hostels owner portfolio",
            run: () => go("/admin/managed-hostels"),
          },
        ],
      },
      {
        heading: "Create",
        items: [
          {
            label: "Add hostel",
            icon: IconPlus,
            keywords: "new hostel listing property create",
            run: () => go("/admin/hostels/new"),
          },
          {
            label: "Add owner",
            icon: IconPlus,
            keywords: "new owner manager create",
            run: () => go("/admin/owners?new=1"),
          },
          {
            label: "Add deal",
            icon: IconPlus,
            keywords: "new deal discount promotion create",
            run: () => go("/admin/deals?new=1"),
          },
          {
            label: "Add facility",
            icon: IconPlus,
            keywords: "new facility amenity create",
            run: () => go("/admin/facilities?new=1"),
          },
          {
            label: "Add tenancy",
            icon: IconPlus,
            keywords: "new tenancy student occupant create",
            run: () => go("/admin/tenancies"),
          },
        ],
      },
      {
        heading: "Quick views",
        items: [
          {
            label: "View new enquiries",
            icon: IconBell,
            keywords: "new enquiries messages leads unread",
            run: () => go("/admin/enquiries?status=New"),
          },
          {
            label: "View unverified hostels",
            icon: IconShield,
            keywords: "unverified hostels listings verify",
            run: () => go("/admin/hostels?verified=Unverified"),
          },
          {
            label: "View limited & full availability",
            icon: IconBed,
            keywords: "availability limited full hostels",
            run: () => go("/admin/hostels?avail=Limited"),
          },
        ],
      },
      {
        heading: "Account",
        items: [
          {
            label: "Toggle sidebar",
            icon: SbPanelLeftDashed,
            keywords: "sidebar collapse expand",
            run: () => {
              onToggleSidebar();
              onClose();
            },
          },
          {
            label: "View public site",
            icon: IconArrowUpRight,
            keywords: "public site website",
            run: () => go("/"),
          },
          {
            label: "Sign out",
            icon: IconLogout,
            keywords: "sign out logout exit",
            run: () => {
              onSignOut();
              onClose();
            },
          },
        ],
      },
    ],
    [go, onSignOut, onToggleSidebar]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) =>
          `${it.label} ${it.keywords ?? ""}`.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

  // Mount / unmount with exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  // Reset query + selection when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Keep active index in range as the list shrinks
  useEffect(() => {
    setActive((a) => (flat.length === 0 ? 0 : Math.min(a, flat.length - 1)));
  }, [flat.length]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[active]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, visible]);

  if (!mounted) return null;

  let runningIndex = -1;

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.overlayShow : styles.overlayHide}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className={`${styles.dialog} ${visible ? styles.dialogShow : styles.dialogHide}`}
      >
        <div className={styles.srTitle}>
          <h2 className={styles.srHeading}>Command menu</h2>
          <p className={styles.srDesc}>Type a command or search</p>
        </div>

        <div className={styles.searchRow}>
          <IconSearch size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Run a command or search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
          />
        </div>

        <div className={styles.list} ref={listRef} id="cmd-list" role="listbox">
          {flat.length === 0 && (
            <div className={styles.empty}>No results found.</div>
          )}
          {filtered.map((group) => (
            <div className={styles.group} key={group.heading}>
              <div className={styles.groupHeading}>{group.heading}</div>
              <div className={styles.groupItems}>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const Icon = item.icon;
                  const selected = idx === active;
                  return (
                    <div
                      key={item.label}
                      data-idx={idx}
                      role="option"
                      aria-selected={selected}
                      className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => item.run()}
                    >
                      <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>
                          <span className={styles.itemIcon}>
                            <Icon size={20} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footHint}>
            <kbd className={styles.kbd}>↑</kbd>
            <kbd className={styles.kbd}>↓</kbd> navigate
          </span>
          <span className={styles.footHint}>
            <kbd className={styles.kbd}>↵</kbd> select
          </span>
          <span className={styles.footHint}>
            <kbd className={styles.kbd}>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
