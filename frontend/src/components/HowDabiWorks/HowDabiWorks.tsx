import { IconCompass, IconShield, IconChat } from "../Icons/Icons";
import styles from "./HowDabiWorks.module.css";

const steps = [
  {
    n: "01",
    title: "Discover",
    text: "Find hostels that match what you're looking for.",
    Icon: IconCompass,
  },
  {
    n: "02",
    title: "Verify",
    text: "Dabi collects and verifies important hostel information.",
    Icon: IconShield,
  },
  {
    n: "03",
    title: "Connect",
    text: "Tell us you're interested and we'll help connect you with the hostel.",
    Icon: IconChat,
  },
];

export default function HowDabiWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className="dabi-container">
        <div className={styles.head}>
          <span className="dabi-eyebrow">How Dabi works</span>
          <h2 className={styles.title}>Finding a hostel shouldn&rsquo;t be complicated.</h2>
        </div>

        <div className={styles.grid}>
          {steps.map(({ n, title, text, Icon }) => (
            <div key={n} className={styles.step}>
              <span className={styles.icon}>
                <Icon size={26} />
              </span>
              <span className={styles.num}>{n}</span>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
