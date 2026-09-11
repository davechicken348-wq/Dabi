import { SectionHeading } from '../components/SectionHeading/SectionHeading';
import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';
import './Contact.css';

export default function Contact() {
  return (
    <div className="marketing-page">
      <main>
        <section className="contact-hero">
          <div className="contact-hero-inner">
            <span className="contact-eyebrow">Get in Touch</span>
            <h1 className="contact-title">Looking for a room? Need to tell us about a hostel?</h1>
            <p className="contact-subtitle">
              We're here to help. Reach out through any of the channels below or send us a message.
            </p>
          </div>
        </section>

        <section className="contact-section">
          <div className="marketing-container">
            <div className="contact-grid">
              <div className="contact-info">
                <SectionHeading title="Contact Dabi" align="left" />
                <div className="contact-channels">
                  <div className="contact-channel">
                    <div className="contact-channel-icon" aria-hidden="true">WA</div>
                    <div>
                      <h4>WhatsApp</h4>
                      <p>Message Dabi about a room or hostel.</p>
                    </div>
                  </div>
                  <div className="contact-channel">
                    <div className="contact-channel-icon" aria-hidden="true">PH</div>
                    <div>
                      <h4>Phone</h4>
                      <p>Speak with the Dabi team directly.</p>
                    </div>
                  </div>
                  <div className="contact-channel">
                    <div className="contact-channel-icon" aria-hidden="true">@</div>
                    <div>
                      <h4>Email</h4>
                      <p>Send a question or idea to Dabi.</p>
                    </div>
                  </div>
                </div>
              </div>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <Input label="Your Name" placeholder="Kwame Mensah" required />
                <Input label="Email" type="email" placeholder="kwame@example.com" required />
                <Input label="Phone" placeholder="+233 24 000 0000" required />
                <div className="form-textarea-wrapper">
                  <label className="input-label" htmlFor="contact-reason">What are you contacting us about?</label>
                  <select id="contact-reason" className="input-field" defaultValue="room">
                    <option value="room">I'm looking for a room</option>
                    <option value="hostel">I have accommodation available</option>
                    <option value="question">General question</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className="form-textarea-wrapper">
                  <label className="input-label">Message</label>
                  <textarea
                    className="input-field form-textarea"
                    rows={5}
                    placeholder="Tell us what you're looking for..."
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
