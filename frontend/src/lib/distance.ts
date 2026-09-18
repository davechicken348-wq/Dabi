import { STU } from '../data/geo';

export function haversineKm(
  latitude: number,
  longitude: number,
  targetLatitude: number,
  targetLongitude: number,
): number {
  const radiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(targetLatitude - latitude);
  const longitudeDelta = toRadians(targetLongitude - longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitude))
      * Math.cos(toRadians(targetLatitude))
      * Math.sin(longitudeDelta / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDistanceFromStu(hostel: { latitude?: number; longitude?: number; distanceKm?: number }): number | undefined {
  if (hostel.latitude != null && hostel.longitude != null) {
    return haversineKm(STU.lat, STU.lng, hostel.latitude, hostel.longitude);
  }

  return hostel.distanceKm;
}

export function formatDistanceFromStu(distanceKm?: number): string | undefined {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return undefined;
  return `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km from STU`;
}
