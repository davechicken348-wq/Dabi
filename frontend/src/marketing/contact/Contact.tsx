import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';
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
    value: '+233 XX XXX XXXX',
    detail: 'Message us about a room or hostel. We usually respond within a few hours.',
    href: 'https://wa.me/233XXXXXXXXX',
  },
  {
    Icon: IconPhone,
    label: 'Phone',
    value: '+233 XX XXX XXXX',
    detail: 'Call the Dabi team directly during business hours.',
    href: 'tel:+233XXXXXXXXX',
  },
  {
    Icon: IconMail,
    label: 'Email',
    value: 'hello@dabi.com',
    detail: 'For questions, feedback, or partnership enquiries.',
    href: 'mailto:hello@dabi.com',
  },
] as const;

export default function Contact() {
  return (
    <div className="marketing-page">
      <main>

        {/* ── Hero ── */}
        <section className="contact-hero">
          <div className="contact-hero-inner animate-fade-in-up">
            <span className="contact-eyebrow">Contact</span>
            <h1 className="contact-title">We're easy to reach.</h1>
            <p className="contact-subtitle">
              Whether you're a student looking for a room, an owner with accommodation to list, or just someone with a question — get in touch and we'll get back to you.
            </p>
          </div>
        </section>

        {/* ── Contact section ── */}
        <section className="contact-section">
          <div className="marketing-container contact-grid">

            {/* Left: channels */}
            <div className="contact-channels-col">
              <p className="contact-col-kicker">Ways to reach us</p>
              <div className="contact-channels">
                {CHANNELS.map(({ Icon, label, value, detail, href }) => (
                  <a className="contact-channel" key={label} href={href} target="_blank" rel="noopener noreferrer">
                    <div className="contact-channel-icon">
                      <Icon />
                    </div>
                    <div className="contact-channel-body">
                      <p className="contact-channel-label">{label}</p>
                      <p className="contact-channel-value">{value}</p>
                      <p className="contact-channel-detail">{detail}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="contact-form-col">
              <p className="contact-col-kicker">Send a message</p>
              <p className="contact-form-intro">Fill in the form and we'll follow up via your preferred channel.</p>
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

          </div>
        </section>

      </main>
    </div>
  );
}
