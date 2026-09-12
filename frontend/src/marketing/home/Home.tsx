import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { MarketingCTA } from '../components/MarketingCTA/MarketingCTA';
import './Home.css';

const PROBLEMS = [
  {
    label: 'No single source of truth',
    detail: 'Students ask around, call unknown numbers, and walk hostel to hostel — just to find out a room is already taken.',
  },
  {
    label: 'Prices are a mystery',
    detail: 'Owners quote different prices to different people. There\'s no way to compare what you\'re getting for what you\'re paying.',
  },
  {
    label: 'Information goes stale fast',
    detail: 'Rooms fill up quickly. By the time you act on information you heard two weeks ago, the room is gone.',
  },
] as const;

const STEPS = [
  { number: '01', title: 'Browse', body: 'Explore hostels and room types across locations near your campus.' },
  { number: '02', title: 'Compare', body: 'See prices, facilities, and photos side by side — no guessing.' },
  { number: '03', title: 'Check freshness', body: 'Every listing shows when it was last verified so you know if it\'s still current.' },
  { number: '04', title: 'Enquire', body: 'Submit your interest directly through Dabi.' },
  { number: '05', title: 'Connect', body: 'Dabi helps connect you with the owner to complete the process.' },
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

        {/* ── Problem strip ── */}
        <section className="problem-strip" aria-labelledby="problem-heading">
          <div className="marketing-container">
            <p className="problem-strip-kicker" id="problem-heading">The problem</p>
            <div className="problem-strip-grid">
              {PROBLEMS.map((p) => (
                <div className="problem-strip-item" key={p.label}>
                  <h3 className="problem-strip-label">{p.label}</h3>
                  <p className="problem-strip-detail">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── What Dabi changes split ── */}
        <section className="marketing-section home-split-section">
          <div className="marketing-container home-split-grid">
            <div className="home-split-image home-split-image-room" role="img" aria-label="A bright, clean student room" />
            <div className="home-split-copy">
              <span className="home-kicker">What Dabi changes</span>
              <h2>Everything you need to decide, in one place.</h2>
              <p>Rooms, prices, photos, available counts, facilities, and freshness — all organised and verified by the Dabi team so you can make a real decision without searching blindly.</p>
              <Link to="/findroom" className="marketing-inline-link">Start browsing rooms <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>


        {/* ── Hostel → Room concept (split layout) ── */}
        <section className="marketing-section marketing-section-alt home-concept-section" aria-labelledby="concept-heading">
          <div className="marketing-container home-concept-grid">
            <div className="home-concept-copy">
              <span className="home-kicker">The concept</span>
              <h2 id="concept-heading">A hostel has many rooms. You only need one.</h2>
              <p>Most platforms list hostels. Dabi goes deeper — we list individual room options within each hostel, so you can see exactly what type of room is available, at what price, and how many are left.</p>
            </div>
            <div className="home-concept-visual" aria-label="Hostel and room types breakdown">
              <div className="home-concept-hostel">
                <div className="home-concept-hostel-label">Hostel</div>
                <div className="home-concept-hostel-name">Sunrise Lodge</div>
                <div className="home-concept-hostel-location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  New Dormaa
                </div>
              </div>
              <div className="home-concept-rooms" role="list">
                {ROOM_OPTIONS.map((r) => (
                  <div className="home-concept-room" key={r.type} role="listitem">
                    <span className="home-concept-room-type">{r.type}</span>
                    <span className="home-concept-room-price">{r.price}</span>
                    <span className="home-concept-room-count">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ── How it works — horizontal numbered flow ── */}
        <section className="marketing-section home-steps-section" aria-labelledby="steps-heading">
          <div className="marketing-container">
            <div className="home-steps-header">
              <span className="home-kicker">How it works</span>
              <h2 id="steps-heading">From browsing to moving in.</h2>
            </div>
            <ol className="home-steps-flow" aria-label="Steps to find a room with Dabi">
              {STEPS.map((s, i) => (
                <li className="home-step" key={s.number}>
                  <div className="home-step-connector" aria-hidden="true">
                    {i < STEPS.length - 1 && <div className="home-step-line" />}
                  </div>
                  <div className="home-step-number" aria-hidden="true">{s.number}</div>
                  <h4 className="home-step-title">{s.title}</h4>
                  <p className="home-step-body">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="home-steps-cta">
              <Link to="/findroom" className="marketing-inline-link">Find your room now <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>


        {/* ── Local area split ── */}
        <section className="marketing-section marketing-section-alt home-split-section home-split-section-reverse">
          <div className="marketing-container home-split-grid">
            <div className="home-split-copy">
              <span className="home-kicker">Start where you are</span>
              <h2>Local knowledge. Real options.</h2>
              <p>Dabi focuses on specific student communities — not every city in the country. That means the rooms we list are real, nearby, and relevant to where you're actually studying.</p>
              <Link to="/findroom/locations" className="marketing-inline-link">Explore locations <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-split-image home-split-image-location" role="img" aria-label="A student accommodation building in a local neighbourhood" />
          </div>
        </section>


        {/* ── Freshness trust band ── */}
        <section className="home-trust-band" aria-label="Information freshness indicators">
          <div className="marketing-container">
            <p className="home-trust-label">Every listing tells you when it was last verified</p>
            <div className="home-trust-pills">
              <span className="home-trust-pill home-trust-pill-available">
                <span className="home-trust-dot" aria-hidden="true" />
                Available · Checked today
              </span>
              <span className="home-trust-pill home-trust-pill-limited">
                <span className="home-trust-dot" aria-hidden="true" />
                Limited · Checked 2 days ago
              </span>
              <span className="home-trust-pill home-trust-pill-stale">
                <span className="home-trust-dot" aria-hidden="true" />
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
