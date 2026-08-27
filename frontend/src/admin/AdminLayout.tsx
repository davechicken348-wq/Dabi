import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchDashboardStats,
  fetchEnquiries,
} from "../services/api";
import { usePolling } from "./usePolling";
import {
  IconShield,
  IconChat,
  IconBed,
  IconLogout,
  IconMenu,
  IconBell,
  IconHelp,
  IconSearch,
  IconPin,
} from "../components/Icons/Icons";
import { IconBook } from "./Hostels/hostelPageIcons";
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
import CommandMenu from "./CommandMenu";
import HelpCenter from "./HelpCenter";
import styles from "./admin.module.css";

type NavIcon = (p: { size?: number }) => JSX.Element;

const groups: { items: { to: string; label: string; icon: NavIcon; end: boolean }[] }[] = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: SbHome, end: true },
      { to: "/admin/hostels", label: "Hostels", icon: SbBox, end: false },
      { to: "/admin/owners", label: "Owners", icon: SbUsers, end: false },
      { to: "/admin/enquiries", label: "Enquiries", icon: SbMessageSquare, end: false },
    ],
  },
    {
      items: [
        { to: "/admin/tenancies", label: "Tenancies", icon: SbList, end: false },
        { to: "/admin/deals", label: "Deals", icon: SbTag, end: false },
        { to: "/admin/facilities", label: "Facilities", icon: SbSliders, end: false },
        { to: "/admin/docs", label: "Docs", icon: IconBook, end: false },
      ],
    },
];

const titleMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/hostels": "Hostels",
  "/admin/owners": "Owners",
  "/admin/enquiries": "Enquiries",
  "/admin/tenancies": "Tenancies",
  "/admin/deals": "Deals",
  "/admin/facilities": "Facilities",
};

function pageTitle(path: string): string {
  if (path.startsWith("/admin/hostels") && path.includes("/edit"))
    return "Edit hostel";
  if (path.startsWith("/admin/hostels/new")) return "Add hostel";
  if (titleMap[path]) return titleMap[path];
  return "Admin";
}

const COLLAPSE_KEY = "dabi-admin-sidebar-collapsed";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const notifWrapRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const [newEnquiries, setNewEnquiries] = useState(0);
  const [staleAvail, setStaleAvail] = useState(0);
  const [unverified, setUnverified] = useState(0);

  const loadBadges = useCallback(() => {
    Promise.all([fetchDashboardStats(), fetchEnquiries()])
      .then(([s, e]) => {
        setNewEnquiries(e.filter((x) => x.status === "New").length);
        setStaleAvail((s.availability.Limited ?? 0) + (s.availability.Full ?? 0));
        setUnverified(s.totalHostels - s.verifiedHostels);
      })
      .catch(() => {
        /* leave badges at zero if the backend is unreachable */
      });
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        notifWrapRef.current?.contains(target) ||
        menuWrapRef.current?.contains(target)
      ) {
        return;
      }
      setNotifOpen(false);
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setMenuOpen(false);
        setCmdOpen(false);
        setHelpOpen(false);
      }
    }
    function onCmdKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNotifOpen(false);
        setMenuOpen(false);
        setCmdOpen((v) => !v);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("keydown", onCmdKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onCmdKey);
    };
  }, []);

  usePolling(loadBadges);

  useEffect(() => {
    document.documentElement.classList.add("adm-theme");
    return () => document.documentElement.classList.remove("adm-theme");
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
    setCmdOpen(false);
    setHelpOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentTitle = pageTitle(location.pathname);

  const notifications = useMemo(() => {
    const items: { icon: "chat" | "bed" | "shield"; text: string; to: string }[] =
      [];
    if (newEnquiries > 0)
      items.push({
        icon: "chat",
        text: `${newEnquiries} ${newEnquiries === 1 ? "enquiry is" : "enquiries are"} waiting for a response`,
        to: "/admin/enquiries",
      });
    if (staleAvail > 0)
      items.push({
        icon: "bed",
        text: `${staleAvail} ${staleAvail === 1 ? "hostel needs" : "hostels need"} an availability update`,
        to: "/admin/hostels",
      });
    if (unverified > 0)
      items.push({
        icon: "shield",
        text: `${unverified} ${unverified === 1 ? "listing needs" : "listings need"} verification`,
        to: "/admin/hostels",
      });
    return items;
  }, [newEnquiries, staleAvail, unverified]);

  return (
    <div className={`${styles.layout} ${collapsed ? styles.layoutCollapsed : ""}`}>
      {sidebarOpen && (
        <button
          className={styles.scrim}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""} ${
          collapsed ? styles.sidebarCollapsed : ""
        }`}
        data-collapsible="icon"
        data-state={collapsed ? "collapsed" : "expanded"}
      >
        <div className={styles.brandRow}>
          <span className={styles.brandMark}>
            <SbBox size={18} />
          </span>
          <span className={styles.brandTextWrap}>
            <span className={styles.brandText}>
              Dabi<span> Admin</span>
            </span>
            <span className={styles.brandTag}>Workspace</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          {groups.map((group, gi) => (
            <div className={styles.navGroup} key={gi}>
              <ul className={styles.navMenu}>
                {group.items.map((l) => {
                  const Icon = l.icon;
                  const count =
                    l.label === "Enquiries" && newEnquiries > 0
                      ? newEnquiries
                      : undefined;
                  return (
                    <li className={styles.navItemWrap} key={l.to}>
                      <NavLink
                        to={l.to}
                        end={l.end}
                        className={({ isActive }) =>
                          `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                      >
                        <span className={styles.navIcon}>
                          <Icon size={20} />
                        </span>
                        <span className={styles.navLabelText}>{l.label}</span>
                        {count !== undefined && (
                          <span className={styles.navCount}>{count}</span>
                        )}
                      </NavLink>
                      <span className={styles.navTooltip} role="tooltip">
                        {l.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {gi < groups.length - 1 && <div className={styles.navDivider} />}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className={styles.collapseIcon}>
              <SbPanelLeftDashed size={16} />
            </span>
            <span className={styles.collapseText}>
              {collapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu size={20} />
            </button>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <span className={styles.crumbRoot}>Dabi Admin</span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbPage}>{currentTitle}</span>
            </nav>
          </div>

          <div className={styles.topbarRight}>
            <button
              type="button"
              className={styles.searchPill}
              onClick={() => {
                setNotifOpen(false);
                setMenuOpen(false);
                setCmdOpen(true);
              }}
              aria-label="Search"
              aria-haspopup="dialog"
              aria-expanded={cmdOpen}
            >
              <IconSearch size={16} />
              <span>Search</span>
              <span className={styles.searchKbd}>⌘K</span>
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => {
                setNotifOpen(false);
                setMenuOpen(false);
                setCmdOpen(false);
                setHelpOpen((v) => !v);
              }}
              aria-label="Help"
              aria-haspopup="dialog"
              aria-expanded={helpOpen}
            >
              <IconHelp size={18} />
            </button>

            <div className={styles.menuWrap} ref={notifWrapRef}>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setMenuOpen(false);
                }}
                aria-label="Notifications"
              >
                <IconBell size={18} />
                {notifications.length > 0 && (
                  <span className={styles.notifDot} />
                )}
              </button>
              {notifOpen && (
                <div className={`${styles.dropdown} ${styles.dropdownWide}`}>
                  <div className={styles.dropdownHead}>
                    <span className={styles.dropdownTitle}>Notifications</span>
                  </div>
                  <div className={styles.dropdownBody}>
                    {notifications.length === 0 ? (
                      <div className={styles.notifEmpty}>
                        <div className={styles.notifEmptyArt}>
                          <img
                            src="/illustrations/No-Notifications-1--Streamline-Bruxelles.webp"
                            alt="An empty notification tray"
                            width={92}
                            height={92}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <span className={styles.notifEmptyTitle}>
                          You&rsquo;re all caught up.
                        </span>
                        <span className={styles.notifEmptyText}>
                          New updates about enquiries and listings will appear
                          here.
                        </span>
                      </div>
                    ) : (
                      notifications.map((n, i) => {
                        const Icon =
                          n.icon === "chat"
                            ? IconChat
                            : n.icon === "bed"
                              ? IconBed
                              : IconShield;
                        const section =
                          n.to === "/admin/enquiries"
                            ? "Enquiries"
                            : n.to === "/admin/owners"
                              ? "Owners"
                              : "Hostels";
                        return (
                          <div
                            key={i}
                            className={styles.notifItem}
                            onClick={() => {
                              setNotifOpen(false);
                              navigate(n.to);
                            }}
                          >
                            <span
                              className={`${styles.notifIcon} ${
                                n.icon === "shield" ? styles.notifIconGold : ""
                              }`}
                            >
                              <Icon size={16} />
                            </span>
                            <span className={styles.notifText}>
                              <span className={styles.notifTitle}>{n.text}</span>
                              <span className={styles.notifMeta}>{section}</span>
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.menuWrap} ref={menuWrapRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className={styles.avatar}>{initials}</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.menuHead}>
                    <span className={styles.avatarLg}>{initials}</span>
                    <span className={styles.menuId}>
                      <span className={styles.menuName}>{user?.name}</span>
                      <span className={styles.menuEmail}>Administrator</span>
                    </span>
                  </div>
                  <div className={styles.menuList}>
                    <button
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <IconShield size={16} /> Dashboard
                    </button>
                    <button
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      <IconPin size={16} /> View public site
                    </button>
                    <div className={styles.menuDivider} />
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <IconLogout size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <CommandMenu
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSignOut={handleLogout}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />

      <HelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
