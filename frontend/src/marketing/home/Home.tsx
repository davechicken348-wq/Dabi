import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { MarketingCTA } from '../components/MarketingCTA/MarketingCTA';
import './Home.css';

const COMING_SOON_SCHOOLS = ['KNUST', 'UG', 'UCC', 'UENR', 'UDS', 'UHAS', 'UEW', 'UPSA'];

const KEY_POINTS = [
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    heading: 'Verified & Up-to-date',
    body: 'Every listing is checked by the Dabi team. You see when it was last verified so you know if it\'s still current — no stale info.',
    img: 'https://corp-backend.brevo.com/wp-content/uploads/2023/12/coins-purple.webp',
  },
  {
    icon: 'M3 7h18M3 12h18M3 17h18',
    heading: 'Compare Side by Side',
    body: 'See prices, room types, facilities, and availability across multiple hostels at once. No more calling around.',
    img: 'https://corp-backend.brevo.com/wp-content/uploads/2024/11/head-icon-purple.webp',
  },
  {
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    heading: 'Direct Connection',
    body: 'Submit your interest through Dabi and we help connect you with the hostel owner to complete the process.',
    img: 'https://corp-backend.brevo.com/wp-content/uploads/2024/11/money-icon-purple.webp',
  },
] as const;

const STATS = [
  { value: '100+', label: 'Rooms listed across locations' },
  { value: '3 min', label: 'Average time to find a match' },
  { value: '100%', label: 'Listings verified by our team' },
] as const;

const STEPS = [
  { number: '01', title: 'Browse', body: 'Explore hostels and room types across locations near your campus.', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z' },
  { number: '02', title: 'Compare', body: 'See prices, facilities, and photos side by side — no guessing.', icon: 'M9 19v-6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6m-6 0h6m-6 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14' },
  { number: '03', title: 'Check freshness', body: 'Every listing shows when it was last verified so you know if it\'s still current.', icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  { number: '04', title: 'Enquire', body: 'Submit your interest directly through Dabi.', icon: 'M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z' },
  { number: '05', title: 'Connect', body: 'Dabi helps connect you with the owner to complete the process.', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
] as const;

const ROOM_OPTIONS = [
  { type: '1 in 1', price: 'GH₵3,000', count: '2 available' },
  { type: '2 in 1', price: 'GH₵2,400', count: '4 available' },
  { type: '3 in 1', price: 'GH₵2,000', count: '1 available' },
] as const;

export default function MarketingHome() {
  return (
    <div className="marketing-page">
      <main>
        <Hero />

        {/* ── Schools strip ── */}
        <section className="schools-strip" aria-label="Schools we serve">
          <div className="marketing-container schools-strip-inner">
            <div className="schools-strip-copy">
              <p className="schools-strip-label">Now live at</p>
              <div className="schools-strip-current">
                <span className="schools-current-dot" aria-hidden="true" />
                <span className="schools-current-name">STU</span>
              </div>
            </div>
            <div className="schools-strip-divider" aria-hidden="true" />
            <div className="schools-strip-soon">
              <p className="schools-strip-label">More campuses coming soon</p>
              <div className="schools-soon-list">
                {COMING_SOON_SCHOOLS.map((s) => (
                  <span className="schools-soon-pill" key={s}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-column key points ── */}
        <section className="marketing-section key-points-section" aria-labelledby="key-points-heading">
          <div className="marketing-container">
            <div className="key-points-head">
              <h2 className="key-points-title" id="key-points-heading">
                Everything you need to find the right room
              </h2>
            </div>
            <div className="key-points-grid">
              {KEY_POINTS.map((kp) => (
                <div className="key-point-card" key={kp.heading}>
                  <img src={kp.img} alt="" width={64} height={64} className="key-point-icon" aria-hidden="true" />
                  <h3 className="key-point-heading">{kp.heading}</h3>
                  <p className="key-point-body">{kp.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats showcase ── */}
        <section className="stats-section" aria-labelledby="stats-heading">
          <div className="marketing-container">
            <h2 className="stats-heading" id="stats-heading">
              Dabi in action: the numbers speak for themselves
            </h2>
            <ul className="stats-grid" aria-label="Key statistics">
              {STATS.map((s) => (
                <li className="stat-item" key={s.value}>
                  <span className="stat-value">{s.value}</span>
                  <p className="stat-label">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Feature highlight: The concept ── */}
        <section className="marketing-section feature-split-section" aria-labelledby="concept-heading">
          <div className="marketing-container feature-split-grid">
            <div className="feature-split-copy">
              <span className="home-kicker">The concept</span>
              <h2 id="concept-heading">A hostel has many rooms. You only need one.</h2>
              <p>Most platforms list hostels. Dabi goes deeper — we list individual room options within each hostel, so you can see exactly what type of room is available, at what price, and how many are left.</p>
              <Link to="/findroom" className="marketing-inline-link">
                Start browsing rooms
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/></svg>
              </Link>
            </div>
            <div className="feature-split-visual" aria-label="Hostel and room types breakdown">
              <div className="concept-card">
                <div className="concept-card-hostel">
                  <div className="concept-card-label">Hostel</div>
                  <div className="concept-card-name">Sunrise Lodge</div>
                  <div className="concept-card-location">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
                    New Dormaa
                  </div>
                </div>
                <div className="concept-card-rooms" role="list">
                  {ROOM_OPTIONS.map((r) => (
                    <div className="concept-card-room" key={r.type} role="listitem">
                      <span className="concept-room-type">{r.type}</span>
                      <span className="concept-room-price">{r.price}</span>
                      <span className="concept-room-count">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="marketing-section marketing-section-alt how-it-works-section" aria-labelledby="steps-heading">
          <div className="marketing-container">
            <div className="how-it-works-head">
              <span className="home-kicker">How it works</span>
              <h2 id="steps-heading">From browsing to moving in.</h2>
            </div>
            <ol className="steps-flow" aria-label="Steps to find a room with Dabi">
              {STEPS.map((s, i) => (
                <li className="step-item" key={s.number}>
                  <div className="step-number" aria-hidden="true">{s.number}</div>
                  <div className="step-content">
                    <div className="step-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                    </div>
                    <h4 className="step-title">{s.title}</h4>
                    <p className="step-body">{s.body}</p>
                  </div>
                  {i < STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <div className="steps-cta">
              <Link to="/findroom" className="marketing-inline-link">
                Find your room now
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Freshness trust band ── */}
        <section className="trust-band" aria-label="Information freshness indicators">
          <div className="marketing-container trust-band-inner">
            <p className="trust-band-label">Every listing tells you when it was last verified</p>
            <div className="trust-pills">
              <span className="trust-pill trust-pill-available">
                <span className="trust-dot" aria-hidden="true" />
                Available · Checked today
              </span>
              <span className="trust-pill trust-pill-limited">
                <span className="trust-dot" aria-hidden="true" />
                Limited · Checked 2 days ago
              </span>
              <span className="trust-pill trust-pill-stale">
                <span className="trust-dot" aria-hidden="true" />
                Needs updating · Not checked recently
              </span>
            </div>
          </div>
        </section>

        <MarketingCTA subtitle="Explore available rooms and hostels near you." />
      </main>
    </div>
  );
}
