import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { SectionHeading } from '../components/SectionHeading/SectionHeading';
import { ProductPreview } from '../components/ProductPreview/ProductPreview';
import { MarketingCTA } from '../components/MarketingCTA/MarketingCTA';
import './Home.css';

type MarketingIconName = 'phone' | 'walking' | 'camera' | 'compare' | 'clipboard' | 'note' | 'people';

function MarketingIcon({ name }: { name: MarketingIconName }) {
  const iconPaths = {
    phone: <><path d="M7.5 3.5h2l1.2 4-1.8 1.8a14.5 14.5 0 0 0 5.8 5.8l1.8-1.8 4 1.2v2c0 1.1-.9 2-2 2C11.5 18.5 5.5 12.5 5.5 5.5c0-1.1.9-2 2-2Z" /><path d="m15 5 4 4M19 5h-4" /></>,
    walking: <><circle cx="13" cy="4.5" r="1.8" /><path d="m11.5 8 2.5 2.5 2.5-.5M13.5 10.5l-1 4-3 4M13.5 10.5l3 4 2.5 1M12.5 14.5l3 1" /></>,
    camera: <><path d="M4 8.5h3l1.5-2h3l1.5 2h3A2 2 0 0 1 18 10.5v7A2 2 0 0 1 16 19.5H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" /><circle cx="11" cy="14" r="3" /></>,
    compare: <><path d="M5 6h9M5 12h14M5 18h9" /><circle cx="17" cy="6" r="2" /><circle cx="9" cy="18" r="2" /></>,
    clipboard: <><path d="M8 5.5h8a2 2 0 0 1 2 2v12H6v-12a2 2 0 0 1 2-2Z" /><path d="M9 5.5v-1h6v1M9 10h6M9 14h6M9 18h3" /></>,
    note: <><path d="M6 3.5h9l3 3v14H6v-17Z" /><path d="M14 3.5v4h4M9 12h6M9 16h4" /></>,
    people: <><circle cx="9" cy="8" r="2.5" /><circle cx="16.5" cy="9" r="2" /><path d="M4.5 19a4.5 4.5 0 0 1 9 0M14 18a3.5 3.5 0 0 1 5.5 1" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

function RoomCardPreview() {
  return (
    <div className="preview-card">
      <div className="preview-card-image" />
      <div className="preview-card-body">
        <div className="preview-card-title">2 in 1</div>
        <div className="preview-card-price">GH₵2,400 / year</div>
        <div className="preview-card-meta">Sunrise Lodge · New Dormaa</div>
        <div className="preview-card-tags">
          <span className="preview-tag">Available</span>
          <span className="preview-tag">Checked today</span>
        </div>
      </div>
    </div>
  );
}

export default function MarketingHome() {
  return (
    <div className="marketing-page">
      <main>
        <Hero />

        <section className="marketing-section">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="The Problem"
              title="Finding accommodation shouldn't feel like a scavenger hunt."
              subtitle="Students spend weeks asking around, calling unknown numbers, and walking hostel to hostel — just to find a room."
            />
            <div className="problem-grid">
              <div className="problem-item">
                <div className="problem-icon"><MarketingIcon name="phone" /></div>
                <h4>Calling multiple numbers</h4>
                <p>No single place to see what's actually available.</p>
              </div>
              <div className="problem-item">
                <div className="problem-icon"><MarketingIcon name="walking" /></div>
                <h4>Walking hostel to hostel</h4>
                <p>Unclear prices, unclear room types, rooms already taken.</p>
              </div>
              <div className="problem-item">
                <div className="problem-icon"><MarketingIcon name="camera" /></div>
                <h4>Poor photographs</h4>
                <p>Outdated information and no way to know if it's current.</p>
              </div>
              <div className="problem-item">
                <div className="problem-icon"><MarketingIcon name="compare" /></div>
                <h4>No comparisons</h4>
                <p>Hard to compare options across different hostels.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-story-section">
          <div className="marketing-container marketing-story-grid">
            <div className="marketing-story-image marketing-story-image-room" role="img" aria-label="A bright student room with a desk and bed" />
            <div className="marketing-story-copy">
              <p className="marketing-story-kicker">What Dabi changes</p>
              <h2>We make finding accommodation easier.</h2>
              <p>Dabi brings rooms, locations, prices, facilities, photographs, and availability into one place so students can make a decision without searching blindly.</p>
              <Link to="/findroom" className="marketing-inline-link">Start discovering rooms <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-alt">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="The Concept"
              title="The hostel is the place. The room is what you're looking for."
              subtitle="A hostel may contain multiple room options at different prices. Understanding this is key to finding the right fit."
              align="center"
            />
            <div className="concept-cards">
              <div className="concept-card">
                <div className="concept-card-label">Hostel</div>
                <div className="concept-card-name">Sunrise Lodge</div>
                <div className="concept-card-location">New Dormaa</div>
              </div>
              <div className="concept-arrow" aria-hidden="true">→</div>
              <div className="concept-rooms">
                <div className="concept-room">
                  <div className="concept-room-type">1 in 1</div>
                  <div className="concept-room-price">GH₵3,000</div>
                  <div className="concept-room-count">2 available</div>
                </div>
                <div className="concept-room">
                  <div className="concept-room-type">2 in 1</div>
                  <div className="concept-room-price">GH₵2,400</div>
                  <div className="concept-room-count">4 available</div>
                </div>
                <div className="concept-room">
                  <div className="concept-room-type">3 in 1</div>
                  <div className="concept-room-price">GH₵2,000</div>
                  <div className="concept-room-count">1 available</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-local-section">
          <div className="marketing-container marketing-local-grid">
            <div className="marketing-local-copy">
              <p className="marketing-story-kicker">Start where you are</p>
              <h2>Local places. Clearer choices.</h2>
              <p>Explore the student communities and areas around you, then see the rooms that are actually listed there.</p>
              <Link to="/findroom/locations" className="marketing-inline-link">Explore locations <span aria-hidden="true">→</span></Link>
            </div>
            <div className="marketing-location-image" role="img" aria-label="A student accommodation building in a local neighbourhood" />
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="How It Works"
              title="Explore. Discover. Inspect. Enquire. Connect."
              subtitle="Dabi helps students find the right room through a simple, human-driven process."
              align="center"
            />
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">01</div>
                <h4>Explore</h4>
                <p>Browse hostels and room types across locations near you.</p>
              </div>
              <div className="step">
                <div className="step-number">02</div>
                <h4>Discover</h4>
                <p>See prices, facilities, and availability for each room option.</p>
              </div>
              <div className="step">
                <div className="step-number">03</div>
                <h4>Inspect</h4>
                <p>Check photographs, freshness, and whether the information is current.</p>
              </div>
              <div className="step">
                <div className="step-number">04</div>
                <h4>Enquire</h4>
                <p>Submit your interest and let Dabi connect you with the owner.</p>
              </div>
              <div className="step">
                <div className="step-number">05</div>
                <h4>Connect</h4>
                <p>Dabi helps facilitate the connection between you and the accommodation provider.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-alt">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="Fresh Information"
              title="Know how recent the information is."
              subtitle="Dabi checks availability and updates information so you don't have to guess."
            />
            <div className="freshness-grid">
              <div className="freshness-card">
                <div className="freshness-status freshness-available">Available</div>
                <div className="freshness-label">Checked today</div>
              </div>
              <div className="freshness-card">
                <div className="freshness-status freshness-limited">Limited</div>
                <div className="freshness-label">Checked 2 days ago</div>
              </div>
              <div className="freshness-card">
                <div className="freshness-status freshness-stale">Needs updating</div>
                <div className="freshness-label">Not checked recently</div>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-container">
            <SectionHeading
              eyebrow="The Human Side"
              title="Dabi does more than publish listings."
              subtitle="We collect information, organize it, photograph properties, and structure owner descriptions into useful data."
            />
            <div className="human-grid">
              <div className="human-item">
                <div className="human-icon"><MarketingIcon name="clipboard" /></div>
                <h4>Collect</h4>
                <p>We gather accommodation information directly from owners.</p>
              </div>
              <div className="human-item">
                <div className="human-icon"><MarketingIcon name="camera" /></div>
                <h4>Photograph</h4>
                <p>We visit properties to take accurate photographs.</p>
              </div>
              <div className="human-item">
                <div className="human-icon"><MarketingIcon name="note" /></div>
                <h4>Organize</h4>
                <p>We structure messy owner descriptions into clear room data.</p>
              </div>
              <div className="human-item">
                <div className="human-icon"><MarketingIcon name="people" /></div>
                <h4>Connect</h4>
                <p>We help students connect with accommodation providers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-alt">
          <div className="marketing-container">
            <ProductPreview
              title="See FindRoom in action"
              description="Browse rooms, compare hostels, and track your enquiries — all in one place."
            >
              <div className="preview-mockup">
                <div className="preview-mockup-sidebar">
                  <div className="preview-mockup-logo">Dabi</div>
                  <div className="preview-mockup-nav">
                    <div className="preview-mockup-nav-item active">Home</div>
                    <div className="preview-mockup-nav-item">Explore</div>
                    <div className="preview-mockup-nav-item">Map</div>
                    <div className="preview-mockup-nav-item">Enquiries</div>
                  </div>
                </div>
                <div className="preview-mockup-content">
                  <div className="preview-mockup-search">Search rooms...</div>
                  <div className="preview-mockup-cards">
                    <RoomCardPreview />
                    <RoomCardPreview />
                    <RoomCardPreview />
                  </div>
                </div>
              </div>
            </ProductPreview>
          </div>
        </section>

        <MarketingCTA subtitle="Explore available rooms and hostels near you." />
      </main>
    </div>
  );
}
