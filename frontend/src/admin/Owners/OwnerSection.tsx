import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { IconUsers, IconBed } from "../../components/Icons/Icons";
import styles from "../admin.module.css";

/* Links shown in the Owner management sidebar. */
export const OWNER_NAV: {
  label: string;
  items: { to: string; label: string; end?: boolean; icon: ReactNode }[];
}[] = [
  {
    label: "Manage",
    items: [
      { to: "/admin/owners", label: "Manage owners", end: true, icon: <IconUsers size={16} /> },
      { to: "/admin/managed-hostels", label: "Managed hostels", icon: <IconBed size={16} /> },
    ],
  },
];

export default function OwnerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.sbShell}>
      <aside className={styles.sbSubNav}>
        <div className={styles.sbSubNavHeader}>
          <h4 className={styles.sbSubNavTitle}>{title}</h4>
        </div>
        <nav className={styles.sbSubNavNav}>
          {OWNER_NAV.map((group, gi) => (
            <div className={styles.sbSubGroup} key={group.label}>
              <div className={styles.sbSubGroupLabel}>{group.label}</div>
              <div className={styles.sbSubGroupItems}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `${styles.sbSubItem} ${isActive ? styles.sbSubItemActive : ""}`
                    }
                  >
                    <span className={styles.sbSubItemIcon}>{item.icon}</span>
                    <span className={styles.sbSubItemLabel}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
              {gi < OWNER_NAV.length - 1 && <div className={styles.sbSubDivider} />}
            </div>
          ))}
        </nav>
      </aside>

      <div className={styles.sbContent}>{children}</div>
    </div>
  );
}
