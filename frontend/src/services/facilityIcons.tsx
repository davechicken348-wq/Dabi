import type { ReactNode } from "react";
import {
  IconDroplet,
  IconBolt,
  IconWifi,
  IconLock,
  IconSofa,
  IconUtensils,
  IconWash,
  IconShower,
  IconCar,
  IconBed,
  IconCompass,
  IconMap,
  IconStar,
  IconImages,
  IconPin,
  IconCheck,
} from "../components/Icons/Icons";

export interface IconChoice {
  key: string;
  label: string;
  Icon: (p: { size?: number }) => ReactNode;
}

/** Curated set of icons an admin can assign to a facility. */
export const ICON_CHOICES: IconChoice[] = [
  { key: "wifi", label: "Wi-Fi", Icon: IconWifi },
  { key: "droplet", label: "Water", Icon: IconDroplet },
  { key: "bolt", label: "Electricity", Icon: IconBolt },
  { key: "utensils", label: "Kitchen", Icon: IconUtensils },
  { key: "car", label: "Parking", Icon: IconCar },
  { key: "lock", label: "Security", Icon: IconLock },
  { key: "sofa", label: "Furnished", Icon: IconSofa },
  { key: "wash", label: "Washing", Icon: IconWash },
  { key: "shower", label: "Bathroom", Icon: IconShower },
  { key: "bed", label: "Bedroom", Icon: IconBed },
  { key: "compass", label: "Location", Icon: IconCompass },
  { key: "map", label: "Map", Icon: IconMap },
  { key: "star", label: "Featured", Icon: IconStar },
  { key: "images", label: "Gallery", Icon: IconImages },
  { key: "pin", label: "Pin", Icon: IconPin },
  { key: "check", label: "General", Icon: IconCheck },
];

/** Categories an admin can assign a facility to. */
export const CATEGORY_CHOICES = [
  "Utilities",
  "Connectivity",
  "Security",
  "Comfort",
  "Kitchen",
  "Location",
  "Other",
];

const ICON_MAP: Record<string, IconChoice> = Object.fromEntries(
  ICON_CHOICES.map((c) => [c.key, c]),
);

export const DEFAULT_ICON: IconChoice = {
  key: "check",
  label: "General",
  Icon: IconCheck,
};

export function iconForKey(key?: string | null): IconChoice {
  if (!key) return DEFAULT_ICON;
  return ICON_MAP[key] ?? DEFAULT_ICON;
}

export function FacilityGlyph({
  iconKey,
  size = 20,
}: {
  iconKey?: string | null;
  size?: number;
}) {
  const choice = iconForKey(iconKey);
  const Glyph = choice.Icon;
  return <Glyph size={size} />;
}
