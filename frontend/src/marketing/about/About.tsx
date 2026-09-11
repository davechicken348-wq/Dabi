import { SectionHeading } from '../components/SectionHeading/SectionHeading';
import './About.css';

export default function About() {
  return (
    <div className="marketing-page">
      <main>
        <section className="about-hero">
          <div className="about-hero-inner">
            <span className="about-eyebrow">About Dabi</span>
            <h1 className="about-title">Built for the real student accommodation problem.</h1>
            <p className="about-subtitle">
              Dabi exists because finding a room in a new town shouldn't be the hardest part of starting school.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="Why Dabi"
              title="We focus on rooms, not just hostels."
              subtitle="A hostel name tells you very little. A room option tells you what you actually get — the type of room, the price, the facilities, and how many are available."
            />
            <div className="about-grid">
              <div className="about-card">
                <h4>Local knowledge matters</h4>
                <p>Dabi is built for local student markets, not global travel. We understand the specific accommodation patterns around campuses.</p>
              </div>
              <div className="about-card">
                <h4>Human curation</h4>
                <p>We don't just scrape listings. We visit properties, speak to owners, take photographs, and organize information into something useful.</p>
              </div>
              <div className="about-card">
                <h4>Freshness over volume</h4>
                <p>We'd rather show you ten accurate rooms than a thousand stale listings. Availability freshness is a first-class feature.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section about-section-alt">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="The Process"
              title="How Dabi works with hostel owners."
              subtitle="We act as a bridge between students and accommodation providers."
            />
            <div className="process-steps">
              <div className="process-step">
                <div className="process-number">01</div>
                <div className="process-content">
                  <h4>Discovery</h4>
                  <p>We identify hostels and room options in target locations.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="process-number">02</div>
                <div className="process-content">
                  <h4>Verification</h4>
                  <p>We visit properties, take photographs, and confirm details with owners.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="process-number">03</div>
                <div className="process-content">
                  <h4>Organization</h4>
                  <p>We structure messy owner descriptions into clean, useful room data.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="process-number">04</div>
                <div className="process-content">
                  <h4>Publication</h4>
                  <p>We publish structured room data with photographs, prices, and availability.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="process-number">05</div>
                <div className="process-content">
                  <h4>Connection</h4>
                  <p>When a student enquires, we help connect them with the accommodation provider.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="What's Next"
              title="Dabi is growing."
              subtitle="We are expanding to more locations, more hostels, and more room types. Our goal is to become the most trusted accommodation discovery platform for students."
            />
            <div className="about-grid">
              <div className="about-card">
                <h4>More locations</h4>
                <p>Expanding beyond New Dormaa and Penkwase to cover more campuses and student areas.</p>
              </div>
              <div className="about-card">
                <h4>Demand signals</h4>
                <p>Helping students tell us what they're looking for so we can find it faster.</p>
              </div>
              <div className="about-card">
                <h4>Better connections</h4>
                <p>Improving how we connect students with accommodation providers for smoother transitions.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
