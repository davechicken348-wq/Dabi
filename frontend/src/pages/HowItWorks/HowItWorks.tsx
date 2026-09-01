import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Reveal from "../../components/Reveal/Reveal";
import VerificationBadge from "../../components/VerificationBadge/VerificationBadge";
import TrustSection from "../../components/TrustSection/TrustSection";
import CTASection from "../../components/CTASection/CTASection";
import {
  IconCompass,
  IconImages,
  IconChat,
  IconList,
  IconShield,
  IconSearch,
  IconCheck,
} from "../../components/Icons/Icons";
import styles from "./HowItWorks.module.css";
import ResponsiveImage from "../../components/ResponsiveImage/ResponsiveImage";

const steps = [
  {
    n: "01",
    title: "We go find them",
    text: "We hunt down hostels around the areas students actually need.",
    Icon: IconCompass,
  },
  {
    n: "02",
    title: "We get the facts",
    text: "Prices, room types and facilities — gathered and organised.",
    Icon: IconList,
  },
  {
    n: "03",
    title: "We snap the photos",
    text: "Real shots of the place, taken by us. No stock photos.",
    Icon: IconImages,
  },
  {
    n: "04",
    title: "We double-check",
    text: "We verify what we can before a listing goes live.",
    Icon: IconShield,
  },
  {
    n: "05",
    title: "You browse & compare",
    text: "Scroll hostels, shortlist the ones that fit you.",
    Icon: IconSearch,
  },
  {
    n: "06",
    title: "We make the intro",
    text: "Keen on one? We put you in touch with the owner.",
    Icon: IconChat,
  },
];

const students = [
  {
    Icon: IconCompass,
    title: "Discover",
    text: "Browse hostels near STU — no walking tour required.",
  },
  {
    Icon: IconImages,
    title: "See",
    text: "Real photos, prices and facilities, right up front.",
  },
  {
    Icon: IconChat,
    title: "Connect",
    text: "Like what you see? We introduce you to the owner.",
  },
];

const withoutDabi = [
  "You run the hostel",
  "Hard to find online",
  "Students may never reach you",
];

const withDabi = [
  "You run the hostel",
  "We collect & list it",
  "Students discover you",
  "We connect interested students",
];

const manualItems = [
  "Visiting the hostel",
  "Taking photographs",
  "Collecting details",
  "Confirming prices",
  "Updating listing info",
  "Connecting you",
];

export default function HowItWorks() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="hiw-hero-title">
          <div className={`dabi-container ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className="dabi-eyebrow-pill">How Dabi works</span>
              <h1 id="hiw-hero-title" className={styles.heroTitle}>
                We do the legwork.
                <br />
                <span className="dabi-text-gradient">You find the place.</span>
              </h1>
              <p className={styles.heroLead}>
                Six small steps from &ldquo;no clue where to stay&rdquo; to &ldquo;I found my
                place.&rdquo;
              </p>
              <div className={styles.heroActions}>
                <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                  Find a Hostel
                </Link>
                <Link to="/contact" className="dabi-btn dabi-btn-secondary">
                  Talk to Dabi
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroArt}>
                <ResponsiveImage
                  name="how_it_works1"
                  alt="A student hostel near Sunyani Technical University"
                  className={styles.heroPhotoImg}
                  priority
                />
              </div>

              <div className={styles.heroPeek}>
                <img
                  className={styles.heroPeekIllu}
                  src="/illustrations/Travel--Streamline-Manchester.webp"
                  alt=""
                  width={400}
                  height={400}
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div className={styles.heroBadge}>
                <VerificationBadge />
                <p className={styles.heroCardNote}>
                  <span className={styles.heroCardDot} /> We photograph what you&rsquo;ll actually
                  see
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The process — compact stepper */}
        <section className={`${styles.section} ${styles.steps}`} aria-labelledby="hiw-steps-title">
          <div className="dabi-container">
            <Reveal className={styles.sectionHead}>
              <span className="dabi-eyebrow">The process</span>
              <h2 id="hiw-steps-title" className={styles.sectionTitle}>
                Six steps, one easier search.
              </h2>
            </Reveal>

            <div className={styles.stepper}>
              {steps.map(({ n, title, text, Icon }, i) => (
                <Reveal key={n} className={styles.step} delay={i * 70}>
                  <span className={styles.stepIndex}>{n}</span>
                  <span className={styles.stepIcon}>
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* For students */}
        <section className={`${styles.section} ${styles.students}`} aria-labelledby="hiw-students-title">
          <div className="dabi-container">
            <Reveal className={styles.sectionHead}>
              <span className="dabi-eyebrow">For students</span>
              <h2 id="hiw-students-title" className={styles.sectionTitle}>
                What it&rsquo;s like for you.
              </h2>
            </Reveal>

            <div className={styles.studentsGrid}>
              {students.map(({ Icon, title, text }, i) => (
                <Reveal key={title} className={styles.studentCard} delay={i * 90}>
                  <span className={styles.studentIcon}>
                    <Icon size={24} />
                  </span>
                  <h3 className={styles.studentTitle}>{title}</h3>
                  <p className={styles.studentText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* For hostel owners */}
        <section className={`${styles.section} ${styles.owner}`} aria-labelledby="hiw-owner-title">
          <div className="dabi-container">
            <Reveal className={styles.sectionHead}>
              <span className="dabi-eyebrow">For hostel owners</span>
              <h2 id="hiw-owner-title" className={styles.sectionTitle}>
                Owners, you can relax.
              </h2>
              <p className={styles.sectionLead}>
                You run the hostel. We&rsquo;ll get it online — no tech degree needed.
              </p>
            </Reveal>

            <div className={styles.ownerGrid}>
              <div className={`${styles.ownerCol} ${styles.ownerColMuted}`}>
                <span className={styles.ownerTag}>Without Dabi</span>
                <ul className={styles.ownerFlow}>
                  {withoutDabi.map((item) => (
                    <li key={item} className={styles.ownerStep}>
                      <span className={styles.ownerStepDot}>{withoutDabi.indexOf(item) + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${styles.ownerCol} ${styles.ownerColStrong}`}>
                <span className={styles.ownerTag}>With Dabi</span>
                <ul className={styles.ownerFlow}>
                  {withDabi.map((item) => (
                    <li key={item} className={styles.ownerStep}>
                      <span className={styles.ownerStepDot}>{withDabi.indexOf(item) + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Manual / human model */}
        <section className={`${styles.section} ${styles.manual}`} aria-labelledby="hiw-manual-title">
          <div className={`dabi-container ${styles.manualGrid}`}>
            <Reveal className={styles.manualCopy}>
              <span className="dabi-eyebrow">How we help</span>
              <h2 id="hiw-manual-title" className={styles.manualTitle}>
                Sometimes, we just do it for you.
              </h2>
              <p className={styles.manualText}>
                Not everyone wants to learn the tech. When it helps, Dabi does the work so your
                hostel gets seen — and the right students find it.
              </p>
              <ul className={styles.manualPills}>
                {manualItems.map((item) => (
                  <li key={item} className={styles.manualPill}>
                    <IconCheck size={15} className={styles.manualPillIcon} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className={styles.manualVisual} delay={120}>
              <ResponsiveImage
                name="how_it_works2"
                alt="Dabi helping bring a hostel online for students to discover"
                className={styles.manualImg}
              />
            </Reveal>
          </div>
        </section>

        {/* Trust — reused component */}
        <TrustSection />

        {/* Final CTA — reused component */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
