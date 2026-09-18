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

export function buildRoomShareUrl(_roomId: string, origin?: string): string {
  const baseOrigin = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://dabi.example');
  return new URL('/findroom/rooms', baseOrigin).toString();
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
