import { Link } from 'react-router-dom';
import './About.css';

const DIFFERENTIATORS = [
  {
    title: 'Rooms, not just hostels',
    body: 'A hostel name tells you almost nothing. Dabi lists the individual room options inside each hostel — type, price, capacity, and availability — so you know exactly what you\'re getting before you go.',
  },
  {
    title: 'Human-verified information',
    body: 'We visit properties, speak to owners, take photographs, and structure their descriptions into clean, usable data. Nothing is scraped or generated.',
  },
  {
    title: 'Freshness as a feature',
    body: 'Every listing shows when it was last verified. We\'d rather show you ten accurate rooms than a thousand stale ones.',
  },
] as const;

const PROCESS_STEPS = [
  { number: '01', title: 'Discovery', body: 'We identify hostels and room options in target student areas.' },
  { number: '02', title: 'Verification', body: 'We visit properties, photograph rooms, and confirm details directly with owners.' },
  { number: '03', title: 'Organisation', body: 'We turn messy owner descriptions into structured, consistent room data.' },
  { number: '04', title: 'Publication', body: 'We publish listings with real photos, accurate prices, and live availability.' },
  { number: '05', title: 'Connection', body: 'When a student enquires, we help connect them with the right accommodation provider.' },
] as const;

const VALUES = [
  { title: 'Accuracy over volume', body: 'We keep listings small and verified rather than large and unreliable.' },
  { title: 'Local, not global', body: 'We focus on specific student communities and understand the accommodation patterns around them.' },
  { title: 'Students first', body: 'Every decision we make starts with what makes the search easier for the person looking for a room.' },
] as const;

export default function About() {
  return (
    <div className="marketing-page">
      <main>

        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero-inner animate-fade-in-up">
            <span className="about-eyebrow">About Dabi</span>
            <h1 className="about-title">
              Built because finding<br />a room shouldn't be this hard.
            </h1>
            <p className="about-subtitle">
              Dabi started with a simple observation: students in Ghana spend weeks searching for accommodation near campus — calling numbers, walking streets, asking anyone who might know. The information exists. It's just scattered, unverified, and impossible to compare.
            </p>
          </div>
        </section>

        {/* ── Mission statement — wide text moment ── */}
        <section className="about-mission">
          <div className="about-mission-inner marketing-container">
            <p className="about-mission-kicker">Our mission</p>
            <blockquote className="about-mission-statement">
              Make student accommodation transparent, comparable, and easy to find — starting with the communities that need it most.
            </blockquote>
            <p className="about-mission-body">
              We're not a booking platform. We don't charge students or take commissions. Dabi is a discovery tool — we do the legwork of collecting, verifying, and organising accommodation information so that students arrive at a decision with confidence instead of confusion.
            </p>
          </div>
        </section>


        {/* ── What makes Dabi different ── */}
        <section className="about-diff-section marketing-section">
          <div className="marketing-container">
            <p className="about-section-kicker">What makes us different</p>
            <div className="about-diff-grid">
              {DIFFERENTIATORS.map((d) => (
                <div className="about-diff-item" key={d.title}>
                  <h3 className="about-diff-title">{d.title}</h3>
                  <p className="about-diff-body">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How we work — vertical timeline ── */}
        <section className="about-process-section marketing-section marketing-section-alt">
          <div className="marketing-container about-process-grid">
            <div className="about-process-header">
              <p className="about-section-kicker">How we work</p>
              <h2 className="about-process-title">From street to screen.</h2>
              <p className="about-process-desc">Every room on Dabi goes through the same human-driven process before it's published.</p>
            </div>
            <ol className="about-timeline" aria-label="Dabi's listing process">
              {PROCESS_STEPS.map((s, i) => (
                <li className="about-timeline-step" key={s.number}>
                  <div className="about-timeline-left" aria-hidden="true">
                    <div className="about-timeline-node">{s.number}</div>
                    {i < PROCESS_STEPS.length - 1 && <div className="about-timeline-line" />}
                  </div>
                  <div className="about-timeline-content">
                    <h4 className="about-timeline-title">{s.title}</h4>
                    <p className="about-timeline-body">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="about-values-section marketing-section">
          <div className="marketing-container">
            <p className="about-section-kicker">What we believe</p>
            <div className="about-values-grid">
              {VALUES.map((v) => (
                <div className="about-value-item" key={v.title}>
                  <h3 className="about-value-title">{v.title}</h3>
                  <p className="about-value-body">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA strip ── */}
        <section className="about-cta-band">
          <div className="marketing-container about-cta-inner">
            <div className="about-cta-copy">
              <h2 className="about-cta-title">Ready to find your room?</h2>
              <p className="about-cta-sub">Browse verified rooms and hostels near your campus.</p>
            </div>
            <Link to="/findroom" className="about-cta-btn">
              Explore rooms <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
