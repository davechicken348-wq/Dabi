import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconPin(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconBed(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 18V7h13a4 4 0 0 1 4 4v7" />
      <path d="M3 14h18" />
      <path d="M3 18v2M21 18v2" />
      <path d="M7 11h4" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconArrow(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}

export function IconCompass(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

export function IconChat(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 12a8 8 0 0 1-11.3 7.3L4 20l1-4.5A8 8 0 1 1 21 12Z" />
      <path d="M9 12h.01M12.5 12h.01M16 12h.01" />
    </svg>
  );
}

export function IconWhatsapp(p: IconProps) {
  const { size = 24, ...rest } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04.999-1.04 2.437 0 1.438.989 2.829 1.127 3.027.138.198 1.945 2.971 4.716 4.163.66.285 1.175.456 1.576.583.662.21 1.265.18 1.741.109.531-.079 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.887-9.885 9.887m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
    </svg>
  );
}

export function IconFacebook(p: IconProps) {
  const { size = 24, ...rest } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.014 1.791-4.679 4.533-4.679 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.955.93-1.955 1.886v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073" />
    </svg>
  );
}

export function IconImages(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <circle cx="8" cy="9" r="1.6" />
      <path d="m4 16 4-4 3 3 3-3 3 3" />
      <path d="M14 4h4v12a2 2 0 0 1-2 2H6" />
    </svg>
  );
}

export function IconShower(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 13v-2a4 4 0 0 1 8 0v2" />
      <path d="M4 13h12" />
      <path d="M7 16v1M10 16v2M13 16v1M16 16v2" />
      <path d="M5 21h12" />
    </svg>
  );
}

export function IconWifi(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 9a13 13 0 0 1 18 0" />
      <path d="M6.5 12.5a8 8 0 0 1 11 0" />
      <path d="M10 16a3.5 3.5 0 0 1 4 0" />
      <circle cx="12" cy="19.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDroplet(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.5c3 3.6 5.5 6.4 5.5 9.2A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.3C6.5 9.9 9 7.1 12 3.5Z" />
    </svg>
  );
}

export function IconBolt(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconCar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <path d="M4 11h16v6H4z" />
      <circle cx="8" cy="17" r="1.4" />
      <circle cx="16" cy="17" r="1.4" />
    </svg>
  );
}

export function IconUtensils(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 3v18" />
      <path d="M17 3c-1.6 0-2.6 2-2.6 4.5S15.4 12 17 12v9" />
    </svg>
  );
}

export function IconWash(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M5 9h14" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  );
}

export function IconSofa(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path d="M3 11a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 0-2Z" />
      <path d="M5 19v1M19 19v1" />
    </svg>
  );
}

export function IconMap(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function IconDirections(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 2v3" />
      <path d="M12 22v-4" />
      <path d="m6 9 6-3 6 3-6 3-6-3Z" />
      <path d="M12 12v6" />
    </svg>
  );
}

export function IconCrosshair(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v3M12 22v-3M2 12h3M22 12h-3" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 3h3l2 5-2 1.2a12 12 0 0 0 5.8 5.8L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IconMail(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconCalendar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconChevronLeft(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconSliders(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h10M18 7h2" />
      <circle cx="16" cy="7" r="2.4" />
      <path d="M4 17h2M12 17h8" />
      <circle cx="10" cy="17" r="2.4" />
    </svg>
  );
}

export function IconList(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function IconHelp(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5.2 5.2 0 0 0-2.7-4.6" />
    </svg>
  );
}

export function IconTag(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMore(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBell(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconStar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16.9 7.4 18.2l.9-5.1L4.5 9.5l5.2-.7L12 4Z" />
    </svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3M6 8l-4 4 4 4" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconEdit(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconEye(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconInstagram(p: IconProps) {
  const { size = 24, ...rest } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0m0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06M16.953 5.586a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881m-4.953 8.5a2.84 2.84 0 1 1 0-5.681 2.84 2.84 0 0 1 0 5.681M12 9.605a4.396 4.396 0 1 0 0 8.792 4.396 4.396 0 0 0 0-8.792" />
    </svg>
  );
}

export function IconUpload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function IconSparkles(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
    </svg>
  );
}

export function IconRefresh(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

/* Filled speech bubble — used (recolored) for the status tabs,
   mirroring the Supabase "message-square-more" severity icons. */
export function IconMessageSquareMore(p: IconProps) {
  const { size = 24, ...rest } = p;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={0}
      aria-hidden="true"
      {...rest}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* Small filled info dot — matches the reference's tooltip icon. */
export function IconInfo(p: IconProps) {
  const { size = 16, ...rest } = p;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path
        fillRule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function IconTextSearch(p: IconProps) {
  return (
    <svg {...base(p)} strokeWidth={1}>
      <path d="M21 6H3" />
      <path d="M10 12H3" />
      <path d="M10 18H3" />
      <circle cx="17" cy="15" r="3" />
      <path d="m21 19-1.9-1.9" />
    </svg>
  );
}

export function IconBookOpen(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconArrowUpRight(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
