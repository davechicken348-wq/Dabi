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
  IconArrow,
  IconCheck,
} from "../../components/Icons/Icons";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    n: "01",
    title: "We find the hostel",
    text: "We look for hostels in the areas students around STU actually need.",
    Icon: IconCompass,
  },
  {
    n: "02",
    title: "We collect the details",
    text: "We gather location, price, room type, facilities and availability from the owner.",
    Icon: IconList,
  },
  {
    n: "03",
    title: "We take the photos",
    text: "We photograph the hostel so you can see what the place is actually like.",
    Icon: IconImages,
  },
  {
    n: "04",
    title: "We verify what we can",
    text: "We check the information we're able to confirm before the listing goes live.",
    Icon: IconShield,
  },
  {
    n: "05",
    title: "You browse & compare",
    text: "You look through hostels, compare your options and shortlist what fits.",
    Icon: IconSearch,
  },
  {
    n: "06",
    title: "We help you connect",
    text: "When you're interested, Dabi helps connect you with the hostel owner.",
    Icon: IconChat,
  },
];

const students = [
  {
    Icon: IconCompass,
    title: "Discover",
    text: "Search hostels around STU without walking from place to place.",
  },
  {
    Icon: IconImages,
    title: "See",
    text: "Look at real photos, prices, locations and facilities before you visit.",
  },
  {
    Icon: IconChat,
    title: "Connect",
    text: "Tell us you're interested and we help connect you with the hostel owner.",
  },
];

const manualItems = [
  "Visiting the hostel",
  "Taking photographs",
  "Collecting details",
  "Confirming prices",
  "Updating listing information",
  "Helping students connect with owners",
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
              <span className="dabi-eyebrow">How Dabi works</span>
              <h1 id="hiw-hero-title" className={styles.heroTitle}>
                How Dabi works.
              </h1>
              <p className={styles.heroLead}>
                We do the legwork. You find the place.
              </p>
              <p className={styles.heroLead} style={{ marginTop: "0.6rem" }}>
                From finding hostels around STU to helping you connect with an owner &mdash; here&rsquo;s
                what happens behind the scenes.
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
              <img
                src="/images/how_it_works1.webp"
                alt="A student hostel near Sunyani Technical University"
                className={styles.heroPhoto}
                width={760}
                height={720}
              />
              <div className={styles.heroCard}>
                <div className={styles.heroCardTop}>
                  <VerificationBadge />
                </div>
                <div className={styles.heroCardNote}>
                  <span>
                    <span className={styles.heroCardDot} /> We photograph what you&rsquo;ll actually see
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The process */}
        <section className={`${styles.section} ${styles.steps}`} aria-labelledby="hiw-steps-title">
          <div className="dabi-container">
            <div className={styles.stepsHead}>
              <span className="dabi-eyebrow">The process</span>
              <h2 id="hiw-steps-title" className={styles.sectionTitle}>
                Six steps, one easier search.
              </h2>
              <p className={styles.sectionLead}>
                From the first hostel we find to the moment you connect with an owner.
              </p>
            </div>

            <div className={styles.timeline}>
              {steps.map(({ n, title, text, Icon }, i) => (
                <Reveal
                  key={n}
                  className={`${styles.stepRow} ${i % 2 === 0 ? styles.left : styles.right}`}
                >
                  <span className={styles.node} aria-hidden="true" />
                  <div className={styles.stepCard}>
                    <span className={styles.stepNum}>
                      <span className={styles.stepIcon}>
                        <Icon size={20} />
                      </span>
                      {n}
                    </span>
                    <h3 className={styles.stepTitle}>{title}</h3>
                    <p className={styles.stepText}>{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* For students */}
        <section className={`${styles.section} ${styles.students}`} aria-labelledby="hiw-students-title">
          <div className="dabi-container">
            <div className={styles.studentsHead}>
              <span className="dabi-eyebrow">For students</span>
              <h2 id="hiw-students-title" className={styles.sectionTitle}>
                What it&rsquo;s like for you.
              </h2>
              <p className={styles.sectionLead}>
                Finding a place becomes a few simple steps instead of a long walk.
              </p>
            </div>

            <div className={styles.studentsGrid}>
              {students.map(({ Icon, title, text }, i) => (
                <Reveal key={title} className={styles.studentCard} delay={i * 90}>
                  <span className={styles.studentIcon}>
                    <Icon size={26} />
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
            <div className={styles.ownerHead}>
              <span className="dabi-eyebrow">For hostel owners</span>
              <h2 id="hiw-owner-title" className={styles.sectionTitle}>
                Hostel owners don&rsquo;t need to be tech experts.
              </h2>
              <p className={styles.sectionLead}>
                Not every hostel owner needs to know how to create listings, manage websites or
                upload photos. That&rsquo;s where Dabi comes in. We help bring their hostel online,
                so students can discover it more easily.
              </p>
            </div>

            <div className={styles.ownerGrid}>
              <div className={`${styles.ownerCol} ${styles.ownerColMuted}`}>
                <div className={styles.ownerColHead}>
                  <span className={styles.ownerColTag}>Without Dabi</span>
                </div>
                <div className={styles.ownerFlow}>
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>1</span> Hostel owner
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>2</span> Limited online visibility
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>3</span> Students may never find them
                  </span>
                </div>
              </div>

              <div className={`${styles.ownerCol} ${styles.ownerColStrong}`}>
                <div className={styles.ownerColHead}>
                  <span className={styles.ownerColTag}>With Dabi</span>
                </div>
                <div className={styles.ownerFlow}>
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>1</span> Hostel owner
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>2</span> Dabi collects the information
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>3</span> Dabi creates the listing
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>4</span> Students discover the hostel
                  </span>
                  <IconArrow size={16} className={styles.ownerArrow} />
                  <span className={styles.ownerStep}>
                    <span className={styles.ownerStepDot}>5</span> Dabi helps connect interested students
                  </span>
                </div>
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
                Sometimes, Dabi does the work.
              </h2>
              <p className={styles.manualText}>
                We don&rsquo;t expect every hostel owner to figure out the technology themselves.
                When it helps, Dabi does the work &mdash; so the hostel gets online and students can
                find it. It&rsquo;s one of the ways Dabi stays human.
              </p>
              <ul className={styles.manualList}>
                {manualItems.map((item) => (
                  <li key={item} className={styles.manualItem}>
                    <IconCheck size={18} className={styles.manualItemIcon} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className={styles.manualVisual} delay={120}>
              <img
                src="/images/how_it_works2.webp"
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
