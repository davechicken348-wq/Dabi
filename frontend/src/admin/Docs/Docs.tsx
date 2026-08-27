import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import shared from "../admin.module.css";
import {
  SbBox,
  SbUsers,
  SbMessageSquare,
  SbList,
  SbTag,
  SbSliders,
  SbPanelLeftDashed,
} from "../adminIcons";
import { IconArrow } from "../../components/Icons/Icons";
import { IconBook } from "../Hostels/hostelPageIcons";
import styles from "./Docs.module.css";

type IconType = ComponentType<{ size?: number }>;

type CalloutTone = "tip" | "info" | "warn";

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; tone: CalloutTone; title?: string; text: string }
  | { kind: "steps"; items: { title: string; text: string }[] };

interface DocSection {
  id: string;
  label: string;
  icon: IconType;
  title: string;
  intro: string;
  blocks: Block[];
}

const sections: DocSection[] = [
  {
    id: "getting-started",
    label: "Getting started",
    icon: SbPanelLeftDashed,
    title: "Welcome to your Dabi admin",
    intro:
      "This is your workspace for running hostels on Dabi. Everything — listings, enquiries, owners, deals — lives here, and it updates in real time.",
    blocks: [
      {
        kind: "p",
        text: "You're looking at the admin side of Dabi. It's built for you, the hostel agent and administrator. Customers browse and book on the public site; you run the back office from here.",
      },
      { kind: "h", text: "The dashboard" },
      {
        kind: "p",
        text: "Your home base. It greets you, shows how your hostels are doing today, and surfaces anything that needs attention — new enquiries, full capacity, or listings waiting for verification.",
      },
      {
        kind: "callout",
        tone: "tip",
        text: "The dashboard refreshes automatically. Watch for the Live pill in the top-right of the hero — it means the numbers just updated.",
      },
      { kind: "h", text: "Finding your way" },
      {
        kind: "ul",
        items: [
          "Use the left sidebar to jump between Dashboard, Hostels, Owners, Enquiries, Tenancies, Deals and Facilities.",
          "The top bar has Search (⌘K), help, notifications and your account menu.",
          "Most pages carry a Docs button in the top-right — that's how you reached this guide.",
        ],
      },
    ],
  },
  {
    id: "hostels",
    label: "Hostels",
    icon: SbBox,
    title: "Managing your hostels",
    intro:
      "Your hostels are the core of Dabi. Add them, keep availability current, and get them verified so students can trust and book them.",
    blocks: [
      { kind: "h", text: "Add a hostel" },
      {
        kind: "steps",
        items: [
          {
            title: "Open Hostels",
            text: "Click Add hostel (or Add listing) in the top-right of the page.",
          },
          {
            title: "Fill in the basics",
            text: "Name, location, room types, price and photos. The more complete, the better it converts.",
          },
          {
            title: "Save",
            text: "Your listing appears on the public site immediately, even before verification.",
          },
        ],
      },
      { kind: "h", text: "Availability & capacity" },
      {
        kind: "p",
        text: "Each hostel reads as Available, Limited or Full. Keep this honest so the enquiries you receive match reality.",
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Listings at Limited or Full capacity show up under Needs attention on your dashboard. Update availability often during peak season.",
      },
      { kind: "h", text: "Verification" },
      {
        kind: "p",
        text: "Verified listings rank better and build trust. Anything unverified is flagged for you to confirm details.",
      },
      {
        kind: "callout",
        tone: "tip",
        text: "A complete profile — accurate photos, clear descriptions, real pricing — gets verified faster.",
      },
    ],
  },
  {
    id: "enquiries",
    label: "Enquiries",
    icon: SbMessageSquare,
    title: "Replying to enquiries",
    intro:
      "When a customer sends an enquiry it lands here the moment they hit send. No setup needed — just wait and reply.",
    blocks: [
      {
        kind: "p",
        text: "Enquiries are the start of every booking conversation. They arrive in real time and are listed newest-first.",
      },
      { kind: "h", text: "Responding" },
      {
        kind: "steps",
        items: [
          {
            title: "Open Enquiries",
            text: "See what's waiting for a response at a glance.",
          },
          {
            title: "Read the message",
            text: "Click an enquiry to see the full message and the customer's details.",
          },
          {
            title: "Reply promptly",
            text: "Fast, friendly replies are what turn an enquiry into a booking.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "info",
        text: "New enquiries also appear under Needs attention on the dashboard, with a count so you never miss one.",
      },
    ],
  },
  {
    id: "owners",
    label: "Owners",
    icon: SbUsers,
    title: "Assigning owners",
    intro:
      "Owners are the people or partners who own a hostel. Linking a hostel to an owner keeps accountability clear.",
    blocks: [
      {
        kind: "p",
        text: "Some hostels may be unassigned. Assigning an owner is quick and keeps your workspace organised.",
      },
      { kind: "h", text: "Assign an owner" },
      {
        kind: "steps",
        items: [
          {
            title: "Go to Owners",
            text: "Open the Owners page from the sidebar.",
          },
          {
            title: "Pick the hostel",
            text: "Open the hostel and choose the owner it belongs to.",
          },
          {
            title: "Save",
            text: "The hostel now appears under that owner's managed list.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Unassigned hostels are flagged on your dashboard so nothing slips through the cracks.",
      },
    ],
  },
  {
    id: "tenancies",
    label: "Tenancies",
    icon: SbList,
    title: "Tracking tenancies",
    intro:
      "Tenancies connect a booking to a resident and a room. Keep them current so your availability stays accurate.",
    blocks: [
      {
        kind: "p",
        text: "Manage active and past tenancies from one place. This is where you confirm who's living where — and free up rooms the moment a tenancy ends.",
      },
      {
        kind: "callout",
        tone: "info",
        text: "Accurate tenancy records are what keep your Available / Limited / Full counts honest for incoming enquiries.",
      },
    ],
  },
  {
    id: "deals",
    label: "Deals",
    icon: SbTag,
    title: "Creating deals",
    intro:
      "Deals are promotions you run to fill rooms — discounts for early birds, long stays, or the quiet season.",
    blocks: [
      { kind: "h", text: "Publish a deal" },
      {
        kind: "steps",
        items: [
          {
            title: "Open Deals",
            text: "Click Add deal in the top-right of the page.",
          },
          {
            title: "Set the terms",
            text: "Choose the discount, the hostels it applies to, and the active dates.",
          },
          {
            title: "Publish",
            text: "Eligible listings show the deal on the public site straight away.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Pair a deal with Limited availability to nudge bookings exactly when you need them.",
      },
    ],
  },
  {
    id: "facilities",
    label: "Facilities",
    icon: SbSliders,
    title: "Defining facilities",
    intro:
      "Facilities are the amenities students filter by — Wi-Fi, laundry, study rooms and more. The catalog is yours to shape.",
    blocks: [
      {
        kind: "p",
        text: "Add as many as you like. They power the filters customers use to find the right home.",
      },
      {
        kind: "callout",
        tone: "info",
        text: "Think of facilities as your own taxonomy — keep names clear and consistent across hostels so filtering stays reliable.",
      },
    ],
  },
  {
    id: "account",
    label: "Your account",
    icon: IconBook,
    title: "Your account & live updates",
    intro:
      "A few essentials about staying signed in and keeping your data fresh.",
    blocks: [
      { kind: "h", text: "Live updates" },
      {
        kind: "p",
        text: "Your admin updates automatically. The Live pill and the 'Updated Xs ago' note tell you the data is current — hit refresh any time you want a fresh pull.",
      },
      { kind: "h", text: "Signing out" },
      {
        kind: "p",
        text: "Use the account menu (top-right avatar) to sign out, or to jump back to the public site.",
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Always sign out on a shared or public computer to keep your hostels' data private.",
      },
    ],
  },
];

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p className={styles.p}>{block.text}</p>;
    case "h":
      return <h2 className={styles.h}>{block.text}</h2>;
    case "ul":
      return (
        <ul className={styles.list}>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className={styles.list}>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div
          className={`${styles.callout} ${styles[`callout_${block.tone}`]}`}
        >
          {block.title && <div className={styles.calloutTitle}>{block.title}</div>}
          <p className={styles.calloutText}>{block.text}</p>
        </div>
      );
    case "steps":
      return (
        <ol className={styles.steps}>
          {block.items.map((s, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepText}>{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}

export default function Docs() {
  const [active, setActive] = useState<string>(sections[0].id);
  const navigate = useNavigate();
  const current = sections.find((s) => s.id === active) ?? sections[0];

  const renderNavItem = (s: DocSection) => {
    const Icon = s.icon;
    return (
      <button
        key={s.id}
        type="button"
        className={`${shared.sbSubItem} ${s.id === active ? shared.sbSubItemActive : ""}`}
        onClick={() => setActive(s.id)}
      >
        <span className={shared.sbSubItemIcon}>
          <Icon size={16} />
        </span>
        <span className={shared.sbSubItemLabel}>{s.label}</span>
      </button>
    );
  };

  return (
    <div className={shared.sbShell}>
      <aside className={`${shared.sbSubNav} ${styles.subNav}`}>
        <div className={shared.sbSubNavHeader}>
          <h4 className={shared.sbSubNavTitle}>Docs</h4>
        </div>
        <nav className={shared.sbSubNavNav}>
          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Get started</div>
            <div className={shared.sbSubGroupItems}>
              {sections.slice(0, 1).map(renderNavItem)}
            </div>
          </div>
          <div className={shared.sbSubGroup}>
            <div className={shared.sbSubGroupLabel}>Manage</div>
            <div className={shared.sbSubGroupItems}>
              {sections.slice(1).map(renderNavItem)}
            </div>
          </div>
        </nav>
      </aside>

      <div className={shared.sbContent}>
        <div className={styles.scroll}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.kicker}>
                <IconBook size={14} /> Dabi Admin Docs
              </div>
              <h1 className={styles.title}>{current.title}</h1>
              <p className={styles.sub}>{current.intro}</p>
            </header>

            <div className={styles.body}>
              {current.blocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => navigate("/admin")}
              >
                <IconArrow size={15} /> Back to dashboard
              </button>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
