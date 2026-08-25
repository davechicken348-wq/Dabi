import { IconCheck, IconShield, IconPin, IconBed } from "../Icons/Icons";
import styles from "./TrustSection.module.css";

const points = [
  {
    title: "Verified Listings",
    text: "Hostel information is checked by Dabi.",
    Icon: IconShield,
  },
  {
    title: "Real Photos",
    text: "Listings use real accommodation imagery.",
    Icon: IconBed,
  },
  {
    title: "Confirmed Locations",
    text: "Know where the hostel is before you visit.",
    Icon: IconPin,
  },
  {
    title: "Recently Checked",
    text: "Availability and listing information can be updated regularly.",
    Icon: IconCheck,
  },
];

export default function TrustSection() {
  return (
    <section className={styles.section}>
      <div className={`dabi-container ${styles.inner}`}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Trust</span>
          <h2 className={styles.title}>
            You don&rsquo;t just find a hostel.
            <br />
            You find one you can trust.
          </h2>
          <p className={styles.lead}>
            Dabi helps students discover accommodation using information collected and checked
            by our team.
          </p>
        </div>

        <div className={styles.grid}>
          {points.map(({ title, text, Icon }) => (
            <div key={title} className={styles.point}>
              <span className={styles.icon}>
                <Icon size={22} />
              </span>
              <h3 className={styles.pointTitle}>{title}</h3>
              <p className={styles.pointText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
