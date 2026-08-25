import styles from "../admin.module.css";

type Variant =
  | "Available"
  | "Limited"
  | "Full"
  | "New"
  | "Contacted"
  | "Resolved"
  | "Active"
  | "Inactive"
  | "Yes"
  | "No";

const classMap: Record<Variant, string> = {
  Available: styles.badgeAvailable,
  Limited: styles.badgeLimited,
  Full: styles.badgeFull,
  New: styles.badgeNew,
  Contacted: styles.badgeContacted,
  Resolved: styles.badgeResolved,
  Active: styles.badgeActive,
  Inactive: styles.badgeInactive,
  Yes: styles.badgeYes,
  No: styles.badgeNo,
};

export default function Badge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return <span className={`${styles.badge} ${classMap[variant]}`}>{children}</span>;
}
