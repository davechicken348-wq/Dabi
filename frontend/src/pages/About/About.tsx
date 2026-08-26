import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Reveal from "../../components/Reveal/Reveal";
import {
  IconCompass,
  IconImages,
  IconChat,
  IconList,
  IconShield,
  IconSearch,
  IconPin,
  IconBed,
  IconCheck,
  IconDirections,
  IconUser,
  IconSparkles,
} from "../../components/Icons/Icons";
import styles from "./About.module.css";
import ResponsiveImage from "../../components/ResponsiveImage/ResponsiveImage";

const pillars = [
  {
    Icon: IconCompass,
    title: "Discover",
    text: "Find hostels without spending hours walking around looking for one.",
  },
  {
    Icon: IconImages,
    title: "See",
    text: "View real photos, prices, locations and facilities before you visit.",
  },
  {
    Icon: IconChat,
    title: "Connect",
    text: "When you find something you're interested in, Dabi helps connect you with the hostel owner.",
  },
];

const steps = [
  {
    n: "01",
    title: "We find the hostel",
    text: "Dabi identifies hostels available around the areas students need.",
    Icon: IconCompass,
  },
  {
    n: "02",
    title: "We collect the information",
    text: "We gather the important details — location, price, room type, facilities and availability.",
    Icon: IconList,
  },
  {
    n: "03",
    title: "We take the photos",
    text: "We help bring the hostel online with real photographs and useful information.",
    Icon: IconImages,
  },
  {
    n: "04",
    title: "We verify the listing",
    text: "We check the information we can confirm before putting the listing on Dabi.",
    Icon: IconShield,
  },
  {
    n: "05",
    title: "You find it",
    text: "You browse hostels, compare your options and find one that fits.",
    Icon: IconSearch,
  },
  {
    n: "06",
    title: "We connect you",
    text: "If you're interested, Dabi helps connect you with the hostel owner.",
    Icon: IconChat,
  },
];

const trustPoints = [
  {
    title: "Real photographs",
    text: "Listings show real accommodation, not generic stock images.",
    Icon: IconImages,
  },
  {
    title: "Confirmed location",
    text: "We check where the hostel actually is before listing it.",
    Icon: IconPin,
  },
  {
    title: "Price information",
    text: "We collect the prices hostels share with us so you can compare.",
    Icon: IconBed,
  },
  {
    title: "Availability checks",
    text: "Where we can, we check whether a listed room is actually available.",
    Icon: IconCheck,
  },
];

const principles = [
  {
    title: "Local",
    text: "We start with places we understand.",
    Icon: IconPin,
  },
  {
    title: "Honest",
    text: "We don't invent information to make listings look better.",
    Icon: IconShield,
  },
  {
    title: "Helpful",
    text: "There's a real person behind Dabi when you need help.",
    Icon: IconChat,
  },
  {
    title: "Simple",
    text: "Finding a hostel shouldn't require learning how to use a complicated platform.",
    Icon: IconDirections,
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

const ownerPromise = [
  {
    Icon: IconPin,
    title: "We come to you",
    text: "No need to figure out the tech. We visit your hostel when it works for you.",
  },
  {
    Icon: IconImages,
    title: "We photograph it",
    text: "Real photos, taken by us, so students see your place exactly as it is.",
  },
  {
    Icon: IconList,
    title: "We build your listing",
    text: "Your rooms, prices and details — collected and turned into a listing for you.",
  },
  {
    Icon: IconChat,
    title: "We connect you",
    text: "When a student is interested, we help put them in touch with you directly.",
  },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="about-hero-title">
          <div className={`dabi-container ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className="dabi-eyebrow">Why Dabi exists</span>
              <h1 id="about-hero-title" className={styles.heroTitle}>
                Hostel hunting shouldn&rsquo;t be this hard.
              </h1>
              <p className={styles.heroLead}>
                Finding a place to stay around STU shouldn&rsquo;t require walking from hostel to
                hostel hoping you find an available room.
              </p>
              <p className={styles.heroLead} style={{ marginTop: "0.6rem", fontWeight: 800, color: "var(--ink)" }}>
                That&rsquo;s why we built Dabi.
              </p>
              <div className={styles.heroActions}>
                <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                  Find a Hostel
                </Link>
                <Link to="/how-it-works" className="dabi-btn dabi-btn-secondary">
                  How Dabi Works
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <ResponsiveImage
                name="welcome_hostel"
                alt="A student hostel building near Sunyani Technical University"
                className={styles.heroPhoto}
                priority
                transparent
              />
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className={`${styles.section} ${styles.problem}`} aria-labelledby="problem-title">
          <div className={`dabi-container ${styles.problemGrid}`}>
            <Reveal className={styles.problemCopy}>
              <span className="dabi-eyebrow">The problem</span>
              <h2 id="problem-title" className={styles.problemTitle}>
                We&rsquo;ve seen the problem up close.
              </h2>
              <p className={styles.problemText}>
                Students looking for hostels around STU often have to walk through different areas,
                ask around, call friends, and visit places just to find out whether a hostel has
                rooms available.
              </p>
              <p className={styles.problemText}>Sometimes, they don&rsquo;t even find the places they&rsquo;re looking for.</p>
              <ul className={styles.problemList}>
                <li className={styles.problemItem}>Walking around unfamiliar areas</li>
                <li className={styles.problemItem}>Asking people for directions</li>
                <li className={styles.problemItem}>Visiting hostels that are already full</li>
                <li className={styles.problemItem}>Calling around without knowing what exists</li>
              </ul>
              <p className={styles.problemOutro}>Dabi was built to make that search easier.</p>
            </Reveal>

            <Reveal className={styles.problemVisual} delay={120}>
              <ResponsiveImage
                name="about_hostel"
                alt="The surroundings students walk through when looking for a hostel"
                className={styles.problemImg}
                transparent
              />
            </Reveal>
          </div>
        </section>

        {/* Why Dabi */}
        <section className={`${styles.section} ${styles.why}`} aria-labelledby="why-title">
          <div className="dabi-container">
            <div className={styles.whyHead}>
              <span className="dabi-eyebrow">Our approach</span>
              <h2 id="why-title" className={styles.sectionTitle}>
                That&rsquo;s why we built Dabi.
              </h2>
              <p className={styles.sectionLead}>
                Dabi brings hostels around you into one place, so you can discover them before
                spending your day walking around looking for one.
              </p>
            </div>

            <div className={styles.whyGrid}>
              {pillars.map(({ Icon, title, text }, i) => (
                <Reveal key={title} className={styles.pillar} delay={i * 90}>
                  <span className={styles.pillarIcon}>
                    <Icon size={26} />
                  </span>
                  <h3 className={styles.pillarTitle}>{title}</h3>
                  <p className={styles.pillarText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How Dabi works */}
        <section className={`${styles.section} ${styles.steps}`} aria-labelledby="steps-title">
          <div className="dabi-container">
            <div className={styles.stepsHead}>
              <span className="dabi-eyebrow">The process</span>
              <h2 id="steps-title" className={styles.sectionTitle}>
                How Dabi works.
              </h2>
              <p className={styles.sectionLead}>We do the legwork. You find the place.</p>
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

        {/* Hostel owners */}
        <section className={`${styles.section} ${styles.owner}`} aria-labelledby="owner-title">
          <div className={styles.ownerPanel}>
            <Reveal className={styles.ownerHead}>
              <span className="dabi-eyebrow">For hostel owners</span>
              <h2 id="owner-title" className={styles.ownerTitle}>
                You run the hostel.
                <br />
                <span className={styles.ownerTitleAccent}>We&rsquo;ll handle the rest.</span>
              </h2>
              <p className={styles.ownerLead}>
                Running a hostel is already more than a full-time job. You shouldn&rsquo;t have to
                become a photographer, a web designer and a marketer just to fill your rooms.
                Here&rsquo;s what Dabi quietly takes off your plate.
              </p>
            </Reveal>

            <div className={styles.ownerGrid}>
              {ownerPromise.map(({ Icon, title, text }, i) => (
                <Reveal key={title} className={styles.ownerCard} delay={i * 90}>
                  <span className={styles.ownerCardIcon}>
                    <Icon size={24} />
                  </span>
                  <h3 className={styles.ownerCardTitle}>{title}</h3>
                  <p className={styles.ownerCardText}>{text}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className={styles.ownerReassure} delay={120}>
              <span className={styles.ownerReassureIcon}>
                <IconSparkles size={20} />
              </span>
              <p className={styles.ownerReassureText}>
                No dashboards to learn. No logins to remember. Just more students knowing your
                hostel exists &mdash; and reaching out when they&rsquo;re ready.
              </p>
              <span className={styles.ownerReassureNote}>
                <IconUser size={18} /> From a real person at Dabi, not a bot.
              </span>
            </Reveal>
          </div>
        </section>

        {/* Manual / human model */}
        <section className={`${styles.section} ${styles.manual}`} aria-labelledby="manual-title">
          <div className={`dabi-container ${styles.manualGrid}`}>
            <Reveal className={styles.manualCopy}>
              <span className="dabi-eyebrow">How we help</span>
              <h2 id="manual-title" className={styles.manualTitle}>
                We do the parts you don&rsquo;t have time for.
              </h2>
              <p className={styles.manualText}>
                You shouldn&rsquo;t have to learn the technology just to get your hostel noticed.
                When it helps, Dabi steps in and does the work &mdash; so your place gets online and
                the right students can find it. That&rsquo;s what keeps Dabi human.
              </p>
              <ul className={styles.manualList}>
                {manualItems.map((item) => (
                  <li key={item} className={styles.manualItem}>
                    <IconCheck size={18} className={styles.manualItemIcon} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={styles.manualNote}>All of it, handled by a real person &mdash; not a dashboard.</p>
            </Reveal>

            <Reveal className={styles.manualVisual} delay={120}>
              <ResponsiveImage
                name="about_hostel3"
                alt="Dabi helping bring a hostel online for students"
                className={styles.manualImg}
                transparent
                contain
              />
            </Reveal>
          </div>
        </section>

        {/* Trust / verification */}
        <section className={`${styles.section} ${styles.trust}`} aria-labelledby="trust-title">
          <div className="dabi-container">
            <div className={styles.trustHead}>
              <span className="dabi-eyebrow">Trust</span>
              <h2 id="trust-title" className={styles.sectionTitle}>
                We believe information should be real.
              </h2>
              <p className={styles.sectionLead}>
                Finding a hostel is already stressful enough. Students shouldn&rsquo;t have to guess
                whether a listing is real. Where we can confirm it, we do.
              </p>
            </div>

            <div className={styles.trustGrid}>
              {trustPoints.map(({ title, text, Icon }, i) => (
                <Reveal key={title} className={styles.trustCard} delay={i * 80}>
                  <span className={styles.trustIcon}>
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.trustCardTitle}>{title}</h3>
                  <p className={styles.trustCardText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Local story */}
        <section className={`${styles.section} ${styles.local}`} aria-labelledby="local-title">
          <div className={`dabi-container ${styles.localGrid}`}>
            <Reveal className={styles.localCopy}>
              <span className="dabi-eyebrow">Where we started</span>
              <h2 id="local-title" className={styles.localTitle}>
                Built here. For here.
              </h2>
              <p className={styles.localLead}>
                Dabi starts around STU and Sunyani because that&rsquo;s where we know the problem.
                We&rsquo;re starting local, learning from students and hostel owners, and building
                from there.
              </p>
            </Reveal>

            <Reveal className={styles.localMap} delay={120} aria-hidden="true">
              <div className={styles.mapGrid} />
              <div className={`${styles.mapRoad} ${styles.mapRoadA}`} />
              <div className={`${styles.mapRoad} ${styles.mapRoadB}`} />
              <div className={styles.mapPin} style={{ top: "34%", left: "42%" }}>
                <span className={styles.mapPulse} />
                <span>STU</span>
              </div>
              <div className={`${styles.mapPin} ${styles.mapPinGold}`} style={{ top: "62%", left: "68%" }}>
                <span className={styles.mapPulse} />
                <span>Fiapre</span>
              </div>
              <div className={styles.mapPin} style={{ top: "74%", left: "28%" }}>
                <span className={styles.mapPulse} />
                <span>Sunyani</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Vision */}
        <section className={`${styles.section} ${styles.vision}`} aria-labelledby="vision-title">
          <div className={`dabi-container ${styles.visionInner}`}>
            <Reveal>
              <h2 id="vision-title" className={styles.visionTitle}>
                Today, it&rsquo;s hostels around STU.
              </h2>
              <p className={styles.visionAlt}>Tomorrow, it could be much more.</p>
              <p className={styles.visionText}>
                Our goal is simple: make finding student accommodation easier, wherever students
                need it.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Principles */}
        <section className={`${styles.section} ${styles.principles}`} aria-labelledby="principles-title">
          <div className="dabi-container">
            <div className={styles.principlesHead}>
              <span className="dabi-eyebrow">What we believe</span>
              <h2 id="principles-title" className={styles.sectionTitle}>
                What we believe.
              </h2>
            </div>

            <div className={styles.principlesGrid}>
              {principles.map(({ title, text, Icon }, i) => (
                <Reveal key={title} className={styles.principle} delay={i * 80}>
                  <span className={styles.principleIcon}>
                    <Icon size={24} />
                  </span>
                  <h3 className={styles.principleTitle}>{title}</h3>
                  <p className={styles.principleText}>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`${styles.section} ${styles.finalCta}`} aria-labelledby="final-title">
          <div className={`dabi-container ${styles.finalPanel}`}>
            <span className={styles.finalAccent}>Find your place</span>
            <h2 id="final-title" className={styles.finalTitle}>
              Ready to find your place?
            </h2>
            <p className={styles.finalLead}>
              Explore hostels around STU and start your search.
            </p>
            <div className={styles.finalActions}>
              <Link to="/find-hostel" className="dabi-btn dabi-btn-primary">
                Find a Hostel
              </Link>
              <Link to="/contact" className="dabi-btn dabi-btn-ghost-light">
                Talk to Dabi
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
