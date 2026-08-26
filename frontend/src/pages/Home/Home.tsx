import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import HostelCard from "../../components/HostelCard/HostelCard";
import HowDabiWorks from "../../components/HowDabiWorks/HowDabiWorks";
import TrustSection from "../../components/TrustSection/TrustSection";
import CTASection from "../../components/CTASection/CTASection";
import Footer from "../../components/Footer/Footer";
import { IconArrow } from "../../components/Icons/Icons";
import { fetchHostels } from "../../services/api";
import type { AdminHostel } from "../../admin/types";
import { usePolling } from "../../admin/usePolling";
import LiveControls from "../../admin/components/LiveControls";
import styles from "./Home.module.css";
import ResponsiveImage from "../../components/ResponsiveImage/ResponsiveImage";

export default function Home() {
  const [hostels, setHostels] = useState<AdminHostel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function loadHostels(showLoading = true) {
    if (showLoading) setStatus("loading");
    fetchHostels()
      .then((list) => {
        setHostels(list);
        setLastUpdated(new Date());
        setStatus("ready");
      })
      .catch(() => {
        if (showLoading) setStatus("error");
      });
  }

  usePolling(() => loadHostels(false));
  useEffect(() => loadHostels(), []);

  const showFallback = status !== "loading" && hostels.length === 0;

  const featuredHostels = useMemo(() => {
    const shuffled = [...hostels];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [hostels]);
  const verifiedCount = hostels.filter((h) => h.verified).length;

  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section className={styles.featured} aria-labelledby="featured-title">
          <div className="dabi-container">
            <div className={styles.sectionHead}>
              <div className={styles.sectionIntro}>
                <span className="dabi-eyebrow">Popular near STU</span>
                <h2 id="featured-title" className={styles.sectionTitle}>
                  Top places students are booking
                </h2>
                <p className={styles.sectionLead}>
                  {status === "loading"
                    ? "Surfacing the most-loved hostels near campus…"
                    : "Hand-picked places within walking distance of STU — the ones students keep coming back to."}
                </p>
                {status === "ready" && verifiedCount > 0 && (
                  <span className={styles.trustChip}>
                    <span className={styles.trustDot} />
                    {verifiedCount} verified {verifiedCount === 1 ? "spot" : "spots"} near campus
                  </span>
                )}
              </div>
              <div className={styles.headActions}>
                <LiveControls
                  lastUpdated={lastUpdated}
                  loading={status === "loading"}
                  onRefresh={() => loadHostels()}
                />
                <Link to="/find-hostel" className={styles.viewAll}>
                  View all hostels <IconArrow size={18} />
                </Link>
              </div>
            </div>

            {status === "loading" ? (
              <div className={styles.grid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.cardSkeleton} />
                ))}
              </div>
            ) : showFallback ? (
              <div className={styles.empty}>
                <img
                  className={styles.emptyArt}
                  src={status === "error"
                    ? "/illustrations/No-Connection-1--Streamline-Brooklyn.webp"
                    : "/illustrations/Drafts-Empty-No-Drafts--Streamline-Lagos.webp"}
                  alt=""
                  width={180}
                  height={180}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className={styles.emptyTitle}>
                  {status === "error" ? "We couldn’t load hostels" : "No hostels just yet"}
                </h3>
                <p className={styles.emptyText}>
                  {status === "error"
                    ? "Something went wrong while loading listings. Please try again in a moment."
                    : "We’re still adding places to stay near STU. Check back soon — new hostels arrive every week."}
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {featuredHostels.map((hostel) => (
                  <HostelCard key={hostel.id} hostel={hostel} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.problem} aria-labelledby="problem-title">
          <div className={`dabi-container ${styles.problemInner}`}>
            <div className={styles.problemCopy}>
              <h2 id="problem-title" className={styles.problemTitle}>
                Hostel hunting shouldn&rsquo;t feel like a treasure hunt.
              </h2>
              <ul className={styles.problemList}>
                <li>You&rsquo;ve walked around.</li>
                <li>You&rsquo;ve asked friends.</li>
                <li>You&rsquo;ve visited places that were already full.</li>
              </ul>
              <p className={styles.problemOutro}>Dabi makes the search easier.</p>
            </div>

            <div className={styles.problemVisual}>
              <ResponsiveImage
                name="hostel_illustration2"
                alt="Students searching for a hostel the hard way"
                className={styles.problemImg}
                transparent
              />
            </div>
          </div>
        </section>

        <HowDabiWorks />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
