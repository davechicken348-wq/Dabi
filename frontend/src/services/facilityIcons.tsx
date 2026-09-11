import { IconBed, IconCheck, IconWifi, IconShield } from './facilityIconPrimitives';

export const ICON_CHOICES = [
  { key: 'bed', label: 'Bed' },
  { key: 'check', label: 'Check' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'shield', label: 'Shield' },
] as const;
export const CATEGORY_CHOICES = ['Utilities', 'Security', 'Comfort', 'Study'] as const;
export function FacilityGlyph({ iconKey, size = 20 }: { iconKey?: string | null; size?: number }) {
  const Icon = iconKey === 'wifi' ? IconWifi : iconKey === 'shield' ? IconShield : iconKey === 'check' ? IconCheck : IconBed;
  return <Icon size={size} />;
}
