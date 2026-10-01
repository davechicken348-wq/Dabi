import {
  checkContactUnlock,
  fetchContactDetails,
  fetchContactUnlockFee,
  initializeContactUnlock,
  verifyContactUnlock,
} from './api';

const STUDENT_REF_KEY = 'dabi-student-ref';
const UNLOCKED_ROOMS_KEY = 'dabi-unlocked-rooms';

export function getUnlockedRoomIds(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_ROOMS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markRoomUnlocked(roomId: string): void {
  try {
    const ids = getUnlockedRoomIds();
    if (!ids.includes(roomId)) {
      localStorage.setItem(UNLOCKED_ROOMS_KEY, JSON.stringify([...ids, roomId]));
    }
  } catch {
    // ignore
  }
}

export interface ContactDetails {
  ownerName: string;
  ownerPhone: string;
  viewingHours?: string;
  landmark?: string;
  notes?: string;
}

export interface UnlockFee {
  fee: number;
  currency: string;
}

export interface InitResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  unlockFee: number;
  currency: string;
}

// Stable anonymous identifier stored in localStorage so a student can recover
// their unlocks across sessions without a full account system.
export function getStudentRef(): string {
  try {
    const stored = localStorage.getItem(STUDENT_REF_KEY);
    if (stored) return stored;
    const ref = `student-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STUDENT_REF_KEY, ref);
    return ref;
  } catch {
    return `student-${Date.now()}`;
  }
}

export async function getUnlockFee(): Promise<UnlockFee> {
  return fetchContactUnlockFee();
}

export async function isContactUnlocked(roomOfferingId: string): Promise<boolean> {
  const studentRef = getStudentRef();
  try {
    const result = await checkContactUnlock(roomOfferingId, studentRef);
    return result.unlocked;
  } catch {
    return false;
  }
}

export async function startUnlockPayment(
  roomOfferingId: string,
  studentEmail: string,
): Promise<InitResult> {
  const studentRef = getStudentRef();
  return initializeContactUnlock({ roomOfferingId, studentRef, studentEmail });
}

export async function verifyUnlockPayment(reference: string): Promise<{
  status: 'paid' | 'failed';
  contact?: ContactDetails;
}> {
  return verifyContactUnlock(reference);
}

export async function getContactDetails(roomOfferingId: string): Promise<ContactDetails> {
  const studentRef = getStudentRef();
  return fetchContactDetails(roomOfferingId, studentRef);
}
