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
  IconBed,
  IconUsers,
  IconChat,
  IconTag,
  IconSliders,
  IconLogout,
  IconMenu,
  IconBell,
  IconChevronDown,
  IconPin,
} from "../components/Icons/Icons";
import styles from "./admin.module.css";

const links = [
  { to: "/admin", label: "Dashboard", icon: IconShield, end: true },
  { to: "/admin/hostels", label: "Hostels", icon: IconBed, end: false },
  { to: "/admin/owners", label: "Owners", icon: IconUsers, end: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: IconChat, end: false },
  { to: "/admin/tenancies", label: "Tenancies", icon: IconBed, end: false },
  { to: "/admin/deals", label: "Deals", icon: IconTag, end: false },
  { to: "/admin/facilities", label: "Facilities", icon: IconSliders, end: false },
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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  usePolling(loadBadges);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
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
    <div className={styles.layout}>
      {sidebarOpen && (
        <button
          className={styles.scrim}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark}>D</span>
          <span>
            <span className={styles.brandText}>
              Dabi<span> Admin</span>
            </span>
            <span className={styles.brandTag}>Hostel operations</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          <span className={styles.navLabel}>Workspace</span>
          {links.map((l) => {
            const Icon = l.icon;
            const count =
              l.label === "Enquiries" && newEnquiries > 0 ? newEnquiries : undefined;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <span className={styles.navIcon}>
                  <Icon size={19} />
                </span>
                {l.label}
                {count !== undefined && (
                  <span className={styles.navCount}>{count}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.sidebarFootTitle}>Need a hand?</div>
          <div className={styles.sidebarFootText}>
            We&rsquo;re here to help you keep listings verified and students
            housed.
          </div>
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
              <span>Dabi Admin</span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbPage}>{currentTitle}</span>
            </nav>
          </div>

          <div className={styles.topbarRight}>
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
                            src="/illustrations/No-Notifications-1--Streamline-Bruxelles.png"
                            alt="An empty notification tray"
                            width={92}
                            height={92}
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
            >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.avatarMeta}>
                  <span className={styles.avatarName}>{user?.name}</span>
                  <span className={styles.avatarRole}>Administrator</span>
                </span>
                <IconChevronDown size={15} />
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.menuList}>
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <IconShield size={17} /> Dashboard
                    </button>
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      <IconPin size={17} /> View public site
                    </button>
                    <div className={styles.menuDivider} />
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      onClick={handleLogout}
                    >
                      <IconLogout size={17} /> Sign out
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
    </div>
  );
}
