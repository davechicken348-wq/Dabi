import type { Hostel, RoomOption } from '../types';
import { formatCurrency, getAvailabilityLabel, getAvailabilityStatus } from './utils';

export type ShareResult = 'native' | 'whatsapp' | 'copied' | 'cancelled';

export type ShareableHostel = Pick<Hostel, 'name' | 'location' | 'verified' | 'photos'>;

export function formatPricingPeriod(period?: RoomOption['pricingPeriod']): string {
  if (!period) return 'per academic year';

  switch (period) {
    case 'Semester':
      return 'per semester';
    case 'Month':
      return 'per month';
    case 'AcademicYear':
    default:
      return 'per academic year';
  }
}

export function getRoomCoverImage(room: Pick<RoomOption, 'photos'>, hostel?: Partial<ShareableHostel>): string {
  const photos = [
    ...(room.photos ?? []),
    ...(hostel?.photos ?? []),
  ].filter(Boolean);

  return photos[0] ?? '/images/hostel-placeholder.svg';
}

export function buildRoomShareUrl(roomId: string, origin?: string): string {
  const baseOrigin = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://dabi.example');
  return new URL(`/findroom/rooms/${roomId}`, baseOrigin).toString();
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function canCopyRoomLink(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.writeText);
}

export function openWhatsAppShare(message: string): boolean {
  if (typeof window === 'undefined') return false;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return Boolean(popup);
}

export async function copyRoomLink(url: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  await navigator.clipboard.writeText(url);
  return true;
}

export function generateRoomShareMessage(
  room: Pick<RoomOption, 'id' | 'name' | 'pricePerYear' | 'pricingPeriod' | 'availableUnits' | 'totalUnits'>,
  hostel: ShareableHostel,
  roomUrl = buildRoomShareUrl(room.id),
): string {
  const availabilityStatus = getAvailabilityStatus(room.availableUnits, room.totalUnits);
  const availabilityLabel = getAvailabilityLabel(availabilityStatus);

  const lines = [
    `🏡 ${room.name} at ${hostel.name}`,
    '',
    `📍 ${hostel.location}`,
    `💰 ${formatCurrency(room.pricePerYear)} / ${formatPricingPeriod(room.pricingPeriod)}`,
    `🟢 ${availabilityLabel}`,
  ];

  if (hostel.verified) {
    lines.push('✨ Dabi Checked');
  }

  lines.push('', 'Interested? Take a look here 👇🏽', roomUrl);

  return lines.join('\n');
}

export function setRoomMetaTags(
  room: Pick<RoomOption, 'id' | 'name' | 'description' | 'pricePerYear' | 'pricingPeriod' | 'photos'>,
  hostel: ShareableHostel,
): void {
  if (typeof document === 'undefined') return;

  const roomUrl = buildRoomShareUrl(room.id);
  const coverImage = getRoomCoverImage(room, hostel);
  const title = `${room.name} at ${hostel.name} | Dabi`;
  const description = `${formatCurrency(room.pricePerYear)} / ${formatPricingPeriod(room.pricingPeriod)} · ${hostel.location} · Find this room on Dabi.`;

  const upsertMeta = (selector: string, attributes: Record<string, string>) => {
    let element = document.head.querySelector(selector) as HTMLMetaElement | null;

    if (!element) {
      element = document.createElement('meta');
      document.head.appendChild(element);
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element!.setAttribute(key, value);
    });
  };

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: coverImage });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: roomUrl });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: coverImage });
}

export async function shareRoom(
  room: Pick<RoomOption, 'id' | 'name' | 'pricePerYear' | 'pricingPeriod' | 'availableUnits' | 'totalUnits'>,
  hostel: ShareableHostel,
): Promise<ShareResult> {
  const roomUrl = buildRoomShareUrl(room.id);
  const title = `${room.name} at ${hostel.name} | Dabi`;
  const text = generateRoomShareMessage(room, hostel, roomUrl);

  if (canUseNativeShare()) {
    try {
      await navigator.share({ title, text, url: roomUrl });
      return 'native';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  if (openWhatsAppShare(text)) {
    return 'whatsapp';
  }

  if (await copyRoomLink(roomUrl)) {
    return 'copied';
  }

  return 'copied';
}
