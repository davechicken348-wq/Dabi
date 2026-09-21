const DEFAULT_DABI_WHATSAPP_NUMBER = '233508417951';
const DEFAULT_DABI_COMMUNITY_LINK = 'https://chat.whatsapp.com/BZPLJJyBFml2eweZwb3FwV';
export const DABI_EMAIL = 'davechicken348@gmail.com';

export const DABI_WHATSAPP_NUMBER = (import.meta.env.VITE_DABI_WHATSAPP_NUMBER ?? DEFAULT_DABI_WHATSAPP_NUMBER).replace(/\s+/g, '');
export const DABI_COMMUNITY_LINK = (import.meta.env.VITE_DABI_COMMUNITY_LINK ?? DEFAULT_DABI_COMMUNITY_LINK).trim();

export const DABI_WHATSAPP_DISPLAY = DABI_WHATSAPP_NUMBER === DEFAULT_DABI_WHATSAPP_NUMBER
  ? '050 841 7951'
  : `+${DABI_WHATSAPP_NUMBER}`;

export const DABI_WHATSAPP_URL = `https://wa.me/${DABI_WHATSAPP_NUMBER}`;
export const DABI_PHONE_URL = `tel:+${DABI_WHATSAPP_NUMBER}`;

export function buildDabiRoomRequestMessage(form: {
  name: string;
  phone: string;
  school?: string;
  location?: string;
  roomType?: string;
  budget?: string;
  moveInDate?: string;
  preferences?: string[];
  notes?: string;
}): string {
  const lines = [
    '🏠 *Dabi Room Request*',
    '',
    `👤 Name: ${form.name}`,
    `📱 WhatsApp: ${form.phone}`,
  ];

  if (form.school) lines.push(`🎓 School: ${form.school}`);
  if (form.location) lines.push(`📍 Preferred area: ${form.location}`);
  if (form.roomType) lines.push(`🛏️ Room type: ${form.roomType}`);
  if (form.budget) lines.push(`💰 Budget: ${form.budget}`);
  if (form.moveInDate) lines.push(`📅 Needed: ${form.moveInDate}`);

  const preferences = form.preferences?.filter(Boolean);
  if (preferences && preferences.length > 0) {
    lines.push('', '✨ Preferences:', ...preferences.map((item) => `* ${item}`));
  }

  if (form.notes) {
    lines.push('', '📝 Additional note:', form.notes);
  }

  lines.push('', 'Please help me find a suitable room.');

  return lines.join('\n');
}

export function openDabiWhatsApp(message: string): boolean {
  if (typeof window === 'undefined') return false;

  const url = `${DABI_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  return Boolean(popup);
}
