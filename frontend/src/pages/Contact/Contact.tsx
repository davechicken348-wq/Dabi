import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Reveal from "../../components/Reveal/Reveal";
import {
  IconWhatsapp,
  IconFacebook,
  IconInstagram,
  IconChat,
  IconCheck,
  IconCompass,
  IconArrow,
} from "../../components/Icons/Icons";
import styles from "./Contact.module.css";

const channels = [
  {
    Icon: IconWhatsapp,
    name: "WhatsApp",
    text: "Send a quick message and we'll reply when we can.",
  },
  {
    Icon: IconFacebook,
    name: "Facebook",
    text: "Follow Dabi and send us a message any time.",
  },
  {
    Icon: IconInstagram,
    name: "Instagram",
    text: "See hostels and reach out through DMs.",
  },
];

const nextSteps = [
  {
    n: "01",
    Icon: IconChat,
    title: "You reach out",
    text: "Tell us what you're looking for, or that you'd like your hostel listed.",
  },
  {
    n: "02",
    Icon: IconCheck,
    title: "We read it",
    text: "A real person on the Dabi team reads your message — not a bot.",
  },
  {
    n: "03",
    Icon: IconCompass,
    title: "We help you connect",
    text: "We point you to options, or help a hostel owner get online.",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="contact-hero-title">
          <div className={`dabi-container ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className="dabi-eyebrow">Contact</span>
              <h1 id="contact-hero-title" className={styles.heroTitle}>
                Talk to Dabi.
              </h1>
              <p className={styles.heroLead}>
                Whether you&rsquo;re a student looking for a place or a hostel owner who wants to be
                listed, there&rsquo;s a real person on the other side.
              </p>
              <div className={styles.heroActions}>
                <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                  Find a Hostel
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <img
                src="/images/gallery-surroundings.svg"
                alt="Local surroundings around Sunyani Technical University"
                className={styles.heroPhoto}
                width={760}
                height={720}
              />
              <div className={styles.heroCard}>
                <p className={styles.heroCardText}>
                  <span className={styles.heroCardDot} /> Real help, from real people.
                </p>
                <p className={styles.heroCardSub}>A small local team around STU.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form + channels */}
        <section className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-title">
          <div className="dabi-container">
            <div className={styles.contactGrid}>
              <Reveal className={styles.formCard}>
                <h2 id="contact-title" className={styles.sectionTitle}>
                  Send Dabi a message.
                </h2>
                <p className={styles.sectionLead} style={{ marginBottom: "1.8rem" }}>
                  Tell us what you need and we&rsquo;ll get back to you.
                </p>

                {submitted ? (
                  <div className={styles.success}>
                    <span className={styles.successIcon}>
                      <IconCheck size={28} strokeWidth={2.6} />
                    </span>
                    <h3 className={styles.successTitle}>Thanks for reaching out.</h3>
                    <p className={styles.successText}>
                      We&rsquo;ve noted your message and a real person from the Dabi team will get back
                      to you soon. In the meantime, you can keep browsing hostels.
                    </p>
                    <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                      Find a Hostel
                    </Link>
                  </div>
                ) : (
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                      <label htmlFor="name" className={styles.label}>
                        Your name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={styles.control}
                        placeholder="e.g. Ama"
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={styles.control}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="role" className={styles.label}>
                        I am a
                      </label>
                      <select id="role" name="role" className={styles.control} defaultValue="student">
                        <option value="student">Student looking for a hostel</option>
                        <option value="owner">Hostel owner</option>
                        <option value="other">Something else</option>
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="message" className={styles.label}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        className={`${styles.control} ${styles.textarea}`}
                        placeholder="Tell us what you're looking for, or about your hostel."
                        required
                      />
                    </div>

                    <button type="submit" className={`dabi-btn dabi-btn-primary ${styles.submit}`}>
                      Send to Dabi
                    </button>
                  </form>
                )}
              </Reveal>

              <Reveal className={styles.channels} delay={120}>
                <p className={styles.channelHead}>Other ways to reach us</p>
                <p className={styles.channelNote}>
                  Dabi is run by a small local team, so replies may take a little while — but
                  they&rsquo;re from a real person.
                </p>
                {channels.map(({ Icon, name, text }) => (
                  <a
                    key={name}
                    className={styles.channel}
                    href="#"
                    aria-label={`${name} (placeholder link)`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className={styles.channelIcon}>
                      <Icon size={22} />
                    </span>
                    <span className={styles.channelBody}>
                      <span className={styles.channelName}>{name}</span>
                      <span className={styles.channelText}>{text}</span>
                    </span>
                    <IconArrow size={18} className={styles.channelArrow} />
                  </a>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* What happens next */}
        <section className={`${styles.section} ${styles.next}`} aria-labelledby="next-title">
          <div className="dabi-container">
            <div className={styles.nextHead}>
              <span className="dabi-eyebrow">What happens next</span>
              <h2 id="next-title" className={styles.sectionTitle}>
                After you reach out.
              </h2>
            </div>

            <div className={styles.nextGrid}>
              {nextSteps.map(({ n, Icon, title, text }, i) => (
                <Reveal key={n} className={styles.nextStep} delay={i * 90}>
                  <span className={styles.nextNum}>{n}</span>
                  <span className={styles.nextIcon}>
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.nextTitle}>{title}</h3>
                  <p className={styles.nextText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
