import type { SVGProps } from "react";

/* Hostel page — Supabase Studio–style chrome icons (lucide paths,
   stroke 1.5) so the reworked page matches Studio exactly. */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function h({ size = 24, ...props }: IconProps) {
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

export function IconGrid(p: IconProps) {
  return (
    <svg {...h(p)}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export function IconBook(p: IconProps) {
  return (
    <svg {...h(p)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconSquarePlus(p: IconProps) {
  return (
    <svg {...h(p)}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

export function IconArrowUpRight(p: IconProps) {
  return (
    <svg {...h(p)}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...h(p)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...h(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconList(p: IconProps) {
  return (
    <svg {...h(p)}>
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

export function IconLayers(p: IconProps) {
  return (
    <svg {...h(p)}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

export function IconBed(p: IconProps) {
  return (
    <svg {...h(p)}>
      <path d="M2 9V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v4" />
      <path d="M2 11a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2" />
      <path d="M6 13v6" />
      <path d="M18 13v6" />
      <path d="M2 19h20" />
    </svg>
  );
}
