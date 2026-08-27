import type { SVGProps } from "react";

/* Supabase Studio–style sidebar icons.
   Mirrors the exact lucide paths used in Supabase so the admin sidebar
   feels identical (icons, stroke weight, proportions). */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function sb({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/* lucide home — Project Overview */
export function SbHome(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M9.43414 20.803V13.0557C9.43414 12.5034 9.88186 12.0557 10.4341 12.0557H14.7679C15.3202 12.0557 15.7679 12.5034 15.7679 13.0557V20.803M12.0181 3.48798L5.53031 7.9984C5.26145 8.18532 5.10114 8.49202 5.10114 8.81948L5.10117 18.803C5.10117 19.9075 5.9966 20.803 7.10117 20.803H18.1012C19.2057 20.803 20.1012 19.9075 20.1012 18.803L20.1011 8.88554C20.1011 8.55988 19.9426 8.25462 19.6761 8.06737L13.1639 3.49088C12.8204 3.24951 12.3627 3.24836 12.0181 3.48798Z" />
    </svg>
  );
}

/* lucide table-editor — Table Editor */
export function SbTableEditor(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M2.9707 15.3494L20.9707 15.355M20.9405 9.61588H2.99699M8.77661 9.61588V21.1367M20.9405 5.85547V19.1367C20.9405 20.2413 20.0451 21.1367 18.9405 21.1367H4.99699C3.89242 21.1367 2.99699 20.2413 2.99699 19.1367V5.85547C2.99699 4.7509 3.89242 3.85547 4.99699 3.85547H18.9405C20.0451 3.85547 20.9405 4.7509 20.9405 5.85547Z" />
    </svg>
  );
}

/* lucide sql-editor — SQL Editor */
export function SbSqlEditor(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M7.89844 8.4342L11.5004 12.0356L7.89844 15.6375M12 15.3292H16.5M5 21.1055H19C20.1046 21.1055 21 20.21 21 19.1055V5.10547C21 4.0009 20.1046 3.10547 19 3.10547H5C3.89543 3.10547 3 4.0009 3 5.10547V19.1055C3 20.21 3.89543 21.1055 5 21.1055Z" />
    </svg>
  );
}

/* lucide database — Database */
export function SbDatabase(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M5.56774 9.70642H18.4547V15.7064H5.56774V9.70642Z" />
      <path d="M4.5 16.7094C4.5 16.1571 4.94772 15.7094 5.5 15.7094H18.5C19.0523 15.7094 19.5 16.1571 19.5 16.7094V20.7094C19.5 21.2616 19.0523 21.7094 18.5 21.7094H5.5C4.94772 21.7094 4.5 21.2616 4.5 20.7094V16.7094Z" />
      <path d="M4.5 4.70679C4.5 4.1545 4.94772 3.70679 5.5 3.70679H18.5C19.0523 3.70679 19.5 4.1545 19.5 4.70679V8.70679C19.5 9.25907 19.0523 9.70679 18.5 9.70679H5.5C4.94772 9.70679 4.5 9.25907 4.5 8.70679V4.70679Z" />
    </svg>
  );
}

/* lucide auth — Authentication */
export function SbAuth(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M5.24121 15.0674H12.7412M5.24121 15.0674V18.0674H12.7412V15.0674M5.24121 15.0674V12.0674H12.7412V15.0674M15 7.60547V4.60547C15 2.94861 13.6569 1.60547 12 1.60547C10.3431 1.60547 9 2.94861 9 4.60547V7.60547M5.20898 9.60547L5.20898 19.1055C5.20898 20.21 6.10441 21.1055 7.20898 21.1055H16.709C17.8136 21.1055 18.709 20.21 18.709 19.1055V9.60547C18.709 8.5009 17.8136 7.60547 16.709 7.60547L7.20899 7.60547C6.10442 7.60547 5.20898 8.5009 5.20898 9.60547Z" />
    </svg>
  );
}

/* lucide storage — Storage */
export function SbStorage(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M19.4995 11.3685V8.50725L14.0723 3.10584H5.49951C4.94722 3.10584 4.49951 3.55355 4.49951 4.10584V9.1051M19.4468 8.48218L14.0701 3.10547L14.0701 7.48218C14.0701 8.03446 14.5178 8.48218 15.0701 8.48218L19.4468 8.48218ZM6.86675 9.1051H3.96045C3.40816 9.1051 2.96045 9.55282 2.96045 10.1051V19.1051C2.96045 20.2097 3.85588 21.1051 4.96045 21.1051H18.9604C20.065 21.1051 20.9604 20.2097 20.9604 19.1051V12.3685C20.9604 11.8162 20.5127 11.3685 19.9605 11.3685H9.98622C9.72382 11.3685 9.47194 11.2654 9.28489 11.0813L7.56808 9.39226C7.38103 9.20824 7.12915 9.1051 6.86675 9.1051Z" />
    </svg>
  );
}

/* lucide edge-functions — Edge Functions */
export function SbEdgeFunctions(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M18 12.1055C18 15.4192 15.3137 18.1055 12 18.1055C8.6863 18.1055 6.00001 15.4192 6.00001 12.1055C6.00001 8.79176 8.6863 6.10547 12 6.10547C15.3137 6.10547 18 8.79176 18 12.1055Z" />
      <path d="M21.3999 5.70154C21.3999 7.35839 20.0568 8.70154 18.3999 8.70154C16.7431 8.70154 15.3999 7.35839 15.3999 5.70154C15.3999 4.04468 16.7431 2.70154 18.3999 2.70154C20.0568 2.70154 21.3999 4.04468 21.3999 5.70154Z" />
      <path d="M8.62216 18.4363C8.62216 20.0932 7.27902 21.4363 5.62216 21.4363C3.96531 21.4363 2.62216 20.0932 2.62216 18.4363C2.62216 16.7795 3.96531 15.4363 5.62216 15.4363C7.27902 15.4363 8.62216 16.7795 8.62216 18.4363Z" />
      <path d="M3.18121 16.2691C2.58401 15.0065 2.25 13.595 2.25 12.1055C2.25 6.72069 6.61522 2.35547 12 2.35547C13.4893 2.35547 14.9005 2.68937 16.163 3.28638M7.68679 20.852C8.98715 21.4944 10.4514 21.8555 12 21.8555C17.3848 21.8555 21.75 17.4902 21.75 12.1055C21.75 10.6162 21.4161 9.20493 20.8191 7.94242" />
    </svg>
  );
}

/* lucide realtime — Realtime */
export function SbRealtime(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M8.04273 1.58203V5.32205M5.24354 5.32205L2.04712 2.02791M5.24354 7.90979H1.57764M15.3776 15.5507L21.079 14.1316C21.5417 14.0164 21.5959 13.3806 21.1595 13.1887L8.00828 7.40586C7.59137 7.22254 7.16643 7.64661 7.3489 8.06389L13.0321 21.0607C13.2224 21.496 13.8556 21.4454 13.9743 20.9854L15.3776 15.5507Z" />
    </svg>
  );
}

/* lucide lightbulb — Advisors */
export function SbLightbulb(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

/* lucide telescope — Observability */
export function SbTelescope(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
      <path d="m13.56 11.747 4.332-.924" />
      <path d="m16 21-3.105-6.21" />
      <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
      <path d="m6.158 8.633 1.114 4.456" />
      <path d="m8 21 3.105-6.21" />
      <circle cx="12" cy="13" r="2" />
    </svg>
  );
}

/* lucide list — Logs */
export function SbList(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

/* lucide blocks — Integrations */
export function SbBlocks(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  );
}

/* lucide settings — Project Settings */
export function SbSettings(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* lucide panel-left-dashed — Sidebar collapse control */
export function SbPanelLeftDashed(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 14v1" />
      <path d="M9 19v2" />
      <path d="M9 3v2" />
      <path d="M9 9v1" />
    </svg>
  );
}

/* lucide users — Owners */
export function SbUsers(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* lucide message-square — Enquiries */
export function SbMessageSquare(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* lucide tag — Deals */
export function SbTag(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

/* lucide sliders-horizontal — Facilities */
export function SbSliders(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M4 7h10M18 7h2" />
      <circle cx="16" cy="7" r="2.4" />
      <path d="M4 17h2M12 17h8" />
      <circle cx="10" cy="17" r="2.4" />
    </svg>
  );
}

/* lucide box — Hostels (supabase-style data table) */
export function SbBox(p: IconProps) {
  return (
    <svg {...sb(p)}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
