import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchDashboardStats,
  fetchEnquiries,
  fetchHostels,
} from "../../services/api";
import { getSession } from "../../services/auth";
import type { DashboardStats, Enquiry, AdminHostel } from "../types";
import { usePolling } from "../usePolling";
import Badge from "../components/Badge";
import LiveControls from "../components/LiveControls";
import {
  IconBed,
  IconShield,
  IconUsers,
  IconChat,
  IconArrow,
  IconBolt,
  IconCheck,
  IconCalendar,
} from "../../components/Icons/Icons";
import styles from "../admin.module.css";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

type LoadState = "loading" | "error" | "ready";

export default function Dashboard() {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback((showLoading = true) => {
    if (showLoading) {
      setState("loading");
      setError(null);
    }
    Promise.all([fetchDashboardStats(), fetchEnquiries(), fetchHostels()])
      .then(([s, e, h]) => {
        if (!mountedRef.current) return;
        setStats(s);
        setEnquiries(e);
        setHostels(h);
        setLastUpdated(new Date());
        setState("ready");
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        if (showLoading) {
          setError(
            err instanceof Error ? err.message : "Failed to load the dashboard.",
          );
          setState("error");
        }
      });
  }, []);

  const isLoading = state === "loading";

  usePolling(() => load(false));

  useEffect(() => load(), [load]);

  if (state === "loading") return <DashboardSkeleton />;

  if (state === "error") {
    const isConnectionError =
      error?.toLowerCase().includes("could not reach") ||
      error?.toLowerCase().includes("backend running");
    const message = isConnectionError
      ? "We can't reach the Dabi server right now. Check your connection or make sure the backend is running, then try again."
      : "Something went wrong while loading your dashboard. Please try again.";
    return (
      <div className={styles.empty}>
        <img
          className={styles.emptyArt}
          src="/illustrations/Scientist-1--Streamline-Brooklyn.png"
          alt="A scientist studying the dashboard"
          width={168}
          height={168}
        />
        <span className={styles.emptyStrong}>We couldn&rsquo;t load the dashboard</span>
        <p className={styles.emptyText}>{message}</p>
        {!isConnectionError && error && (
          <p className={styles.emptyDetail}>{error}</p>
        )}
        <button type="button" className={styles.btnPrimary} onClick={() => load()}>
          Try again
        </button>
      </div>
    );
  }

  // In the "ready" state stats is always populated; this guards the type.
  if (!stats) return <DashboardSkeleton />;

  const session = getSession();
  const name = session?.name ?? "Admin";

  const newEnquiries = stats.newEnquiries;
  const needsAvail = (stats.availability.Limited ?? 0) + (stats.availability.Full ?? 0);
  const needsVerify = stats.totalHostels - stats.verifiedHostels;
  const staleOwners = hostels.filter((h) => h.ownerId === undefined).length;

  const attention: {
    to: string;
    icon: "chat" | "bed" | "shield" | "users";
    count: number;
    label: string;
    meta: string;
    gold?: boolean;
  }[] = [];
  if (newEnquiries > 0)
    attention.push({
      to: "/admin/enquiries",
      icon: "chat",
      count: newEnquiries,
      label: `${newEnquiries} ${newEnquiries === 1 ? "enquiry" : "enquiries"} waiting for response`,
      meta: "Review and respond",
    });
  if (needsAvail > 0)
    attention.push({
      to: "/admin/hostels",
      icon: "bed",
      count: needsAvail,
      label: `${needsAvail} ${needsAvail === 1 ? "hostel is" : "hostels are"} at limited or full capacity`,
      meta: "Manage rooms & reservations",
    });
  if (needsVerify > 0)
    attention.push({
      to: "/admin/hostels",
      icon: "shield",
      count: needsVerify,
      label: `${needsVerify} ${needsVerify === 1 ? "listing needs" : "listings need"} verification`,
      meta: "Confirm details",
      gold: true,
    });
  if (staleOwners > 0)
    attention.push({
      to: "/admin/owners",
      icon: "users",
      count: staleOwners,
      label: `${staleOwners} ${staleOwners === 1 ? "hostel is" : "hostels are"} unassigned to an owner`,
      meta: "Assign an owner",
    });

  const cards = [
    { label: "Hostels", value: stats.totalHostels, icon: IconBed, to: "/admin/hostels", tone: "toneGreen" },
    { label: "Available", value: stats.availability.Available ?? 0, icon: IconCheck, to: "/admin/hostels", tone: "toneEmerald" },
    { label: "Enquiries", value: stats.totalEnquiries, icon: IconChat, to: "/admin/enquiries", tone: "toneBlue" },
    { label: "Owners", value: stats.totalOwners, icon: IconUsers, to: "/admin/owners", tone: "toneGold" },
  ];

  const activity = [...enquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      time: new Date(e.createdAt),
      title: e.name,
      sub: e.hostelName ? `Enquiry about ${e.hostelName}` : "General enquiry",
      status: e.status,
    }));

  function groupDay(d: Date): string {
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return dateFmt.format(d);
  }

  const statusItems = [
    { label: "Available", value: stats.availability.Available ?? 0, color: "#1f8a55" },
    { label: "Limited", value: stats.availability.Limited ?? 0, color: "#c98a0a" },
    { label: "Full", value: stats.availability.Full ?? 0, color: "#b23b3b" },
    { label: "Needs review", value: needsVerify, color: "#e9b949" },
  ];

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className={styles.dashHero}>
        <div className={styles.dashHeroMain}>
          <span className={styles.dashEyebrow}>
            <IconCalendar size={14} /> {dateLabel}
          </span>
          <div className={styles.dashGreeting}>
            {greetingWord()}, {name}
          </div>
          <div className={styles.dashGreetingSub}>
            Here&rsquo;s how your hostels are doing today.
          </div>
          <div className={styles.dashHeroLive}>
            <LiveControls
              lastUpdated={lastUpdated}
              loading={isLoading}
              onRefresh={() => load()}
            />
          </div>
        </div>
        <div className={styles.dashHeroArt} aria-hidden="true">
          <img
            src="/illustrations/Welcome-5--Streamline-Brooklyn.png"
            alt=""
            width={138}
            height={138}
          />
        </div>
      </div>

      {attention.length > 0 && (
        <section className={styles.attention}>
          <div className={styles.attentionHead}>
            <span className={styles.attentionTitle}>
              <IconBolt size={17} /> Needs attention
            </span>
          </div>
          <div className={styles.attentionList}>
            {attention.map((a) => {
              const Icon =
                a.icon === "chat"
                  ? IconChat
                  : a.icon === "bed"
                    ? IconBed
                    : a.icon === "shield"
                      ? IconShield
                      : IconUsers;
              return (
                <Link key={a.label} to={a.to} className={styles.attentionItem}>
                  <span
                    className={`${styles.attentionIcon} ${
                      a.gold ? styles.attentionIconGold : ""
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className={styles.attentionText}>
                    <span className={styles.attentionCount}>{a.label}</span>
                    <span className={styles.attentionMeta}>{a.meta}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>Key overview</span>
      </div>
      <div className={styles.statGrid}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className={`${styles.statCard} ${styles[c.tone]}`}
            >
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{c.label}</span>
                <span className={styles.statIcon}>
                  <Icon size={18} />
                </span>
              </div>
              <div className={styles.statValue}>{c.value}</div>
            </Link>
          );
        })}
      </div>

      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Recent activity</span>
            <Link to="/admin/enquiries" className={styles.sectionLink}>
              View all <IconArrow size={14} />
            </Link>
          </div>
          <div className={styles.panelBody}>
            {enquiries.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelArt}>
                  <img
                    src="/illustrations/I-Have-Question-1--Streamline-Brooklyn.png"
                    alt="A student with a question"
                    width={88}
                    height={88}
                  />
                </div>
                <h4 className={styles.emptyPanelTitle}>No enquiries yet.</h4>
                <p className={styles.emptyPanelText}>
                  New questions from students will appear here as they come in.
                </p>
              </div>
            ) : (
              <div className={styles.activity}>
                {activity.map((a, i) => {
                  const showDay =
                    i === 0 || groupDay(a.time) !== groupDay(activity[i - 1].time);
                  return (
                    <div key={a.id}>
                      {showDay && (
                        <div className={styles.activityDay}>{groupDay(a.time)}</div>
                      )}
                      <div className={styles.activityItem}>
                        <span className={styles.activityTime}>
                          {a.time.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className={styles.activityDot} />
                        <span className={styles.activityBody}>
                          <span className={styles.activityTitle}>{a.title}</span>
                          <span className={styles.activitySub}>
                            {a.sub} · <Badge variant={a.status}>{a.status}</Badge>
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Hostel status</span>
            <Link to="/admin/hostels" className={styles.sectionLink}>
              Manage <IconArrow size={14} />
            </Link>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.statusGrid}>
              {statusItems.map((s) => (
                <div key={s.label} className={styles.statusItem}>
                  <span className={styles.statusDot} style={{ background: s.color }} />
                  <span className={styles.statusLabel}>{s.label}</span>
                  <span className={styles.statusCount}>{s.value}</span>
                </div>
              ))}
            </div>
            <p className={styles.statHint} style={{ marginTop: 14 }}>
              {stats.verifiedHostels} of {stats.totalHostels} listings are verified.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className={styles.skeleton} style={{ height: 28, width: 240, marginBottom: 8 }} />
      <div className={styles.skeleton} style={{ height: 16, width: 320, marginBottom: 22 }} />
      <div className={styles.statGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.statCard} ${styles.skeleton}`} style={{ height: 96 }} />
        ))}
      </div>
      <div className={styles.twoCol} style={{ marginTop: 22 }}>
        <div className={`${styles.panel} ${styles.skeleton}`} style={{ height: 260 }} />
        <div className={`${styles.panel} ${styles.skeleton}`} style={{ height: 260 }} />
      </div>
    </div>
  );
}
