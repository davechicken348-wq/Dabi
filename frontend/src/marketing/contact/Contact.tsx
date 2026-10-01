import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';
import { MarketingCTA } from '../components/MarketingCTA/MarketingCTA';
import { DABI_COMMUNITY_LINK, DABI_EMAIL, DABI_PHONE_URL, DABI_WHATSAPP_URL } from '../../lib/dabiContact';
import './Contact.css';

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const CHANNELS = [
  {
    Icon: IconWhatsApp,
    label: 'WhatsApp',
    action: 'Message us on WhatsApp',
    href: DABI_WHATSAPP_URL,
  },
  {
    Icon: IconPhone,
    label: 'Phone',
    action: 'Call us directly',
    href: DABI_PHONE_URL,
  },
  {
    Icon: IconMail,
    label: 'Email',
    action: 'Send us an email',
    href: `mailto:${DABI_EMAIL}`,
  },
] as const;

export default function Contact() {
  return (
    <div className="marketing-page">
      <main>

        {/* ── Hero ── */}
        <section className="contact-hero-section">
          <div className="marketing-container contact-hero-inner">
            <div className="contact-hero-copy">
              <span className="home-kicker">Contact</span>
              <h1 className="contact-hero-title">
                We're easy<br />to reach.
              </h1>
              <p className="contact-hero-subtitle">
                Whether you're a student looking for a room, an owner with accommodation to list, or just someone with a question — get in touch and we'll get back to you.
              </p>
              <a className="contact-community-link" href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer">
                💚 Join the Dabi Community
              </a>
            </div>
            <div className="contact-hero-visual" aria-hidden="true">
              <div className="contact-visual-card">
                <div className="contact-visual-header">
                  <span className="contact-visual-label">Get in touch</span>
                  <span className="contact-visual-status">
                    <span className="contact-visual-dot" />
                    We respond quickly
                  </span>
                </div>
                <div className="contact-visual-channels">
                  {CHANNELS.map(({ Icon, label, action }) => (
                    <div className="contact-visual-row" key={label}>
                      <div className="contact-visual-icon"><Icon /></div>
                      <div>
                        <p className="contact-visual-row-label">{label}</p>
                        <p className="contact-visual-row-value">{action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Channels band ── */}
        <section className="contact-channels-band" aria-label="Ways to reach us">
          <div className="marketing-container contact-channels-grid">
            {CHANNELS.map(({ Icon, label, action, href }) => (
              <a className="contact-channel-card" key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={action}>
                <div className="contact-channel-icon"><Icon /></div>
                <div>
                  <p className="contact-channel-label">{label}</p>
                  <p className="contact-channel-value">{action}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Form section ── */}
        <section className="marketing-section marketing-section-alt contact-form-section" aria-labelledby="contact-form-heading">
          <div className="marketing-container contact-form-wrap">
            <div className="contact-form-head">
              <span className="home-kicker">Send a message</span>
              <h2 id="contact-form-heading">Tell us what's on your mind.</h2>
              <p>Fill in the form and we'll follow up via your preferred channel.</p>
            </div>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="contact-form-row">
                <Input label="Your Name" placeholder="Kwame Mensah" required />
                <Input label="Phone" placeholder="+233 24 000 0000" required />
              </div>
              <Input label="Email" type="email" placeholder="kwame@example.com" />
              <div className="contact-field">
                <label className="contact-field-label" htmlFor="contact-reason">What's this about?</label>
                <select id="contact-reason" className="contact-select" defaultValue="room">
                  <option value="room">I'm looking for a room</option>
                  <option value="hostel">I have accommodation to list</option>
                  <option value="question">General question</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div className="contact-field">
                <label className="contact-field-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  className="contact-textarea"
                  rows={5}
                  placeholder="Tell us what you're looking for or what's on your mind..."
                  required
                />
              </div>
              <Button size="lg" variant="primary" fullWidth>Send Message</Button>
            </form>
          </div>
        </section>

        <MarketingCTA title="Ready to find your room?" subtitle="Explore available rooms and hostels near you." />

      </main>
    </div>
  );
}
