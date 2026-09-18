import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STU } from '../../data/geo';
import { formatDistanceFromStu, getDistanceFromStu } from '../../lib/distance';
import type { Hostel } from '../../types';
import './RoomDetailsMap.css';

interface RoomDetailsMapProps {
  hostel: Hostel;
}

export function RoomDetailsMap({ hostel }: RoomDetailsMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElementRef.current || hostel.latitude == null || hostel.longitude == null) return undefined;

    const hostelPoint: L.LatLngExpression = [hostel.latitude, hostel.longitude];
    const stuPoint: L.LatLngExpression = [STU.lat, STU.lng];
    const map = L.map(mapElementRef.current, { zoomControl: true, scrollWheelZoom: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.circleMarker(stuPoint, {
      radius: 8,
      color: '#176b4d',
      weight: 3,
      fillColor: '#ffffff',
      fillOpacity: 1,
    }).addTo(map).bindTooltip('STU', { permanent: true, direction: 'top', offset: [0, -8] });

    L.circleMarker(hostelPoint, {
      radius: 8,
      color: '#c94b39',
      weight: 3,
      fillColor: '#ffffff',
      fillOpacity: 1,
    }).addTo(map).bindTooltip(hostel.name, { permanent: true, direction: 'top', offset: [0, -8] });

    L.polyline([stuPoint, hostelPoint], {
      color: '#c94b39',
      dashArray: '8 8',
      weight: 3,
    }).addTo(map);

    map.fitBounds(L.latLngBounds([stuPoint, hostelPoint]), { padding: [48, 48] });

    return () => {
      map.remove();
    };
  }, [hostel.latitude, hostel.longitude, hostel.name]);

  const distanceLabel = formatDistanceFromStu(getDistanceFromStu(hostel));

  if (hostel.latitude == null || hostel.longitude == null) {
    return (
      <section className="room-details-map-section" aria-labelledby="room-location-title">
        <div className="room-details-map-heading">
          <div>
            <p className="room-details-map-kicker">Location</p>
            <h2 id="room-location-title">{hostel.name}</h2>
          </div>
          {distanceLabel && <strong>{distanceLabel}</strong>}
        </div>
        <div className="room-details-map-unavailable">Exact map location is not available yet.</div>
      </section>
    );
  }

  return (
    <section className="room-details-map-section" aria-labelledby="room-location-title">
      <div className="room-details-map-heading">
        <div>
          <p className="room-details-map-kicker">Location</p>
          <h2 id="room-location-title">Distance from STU</h2>
        </div>
        {distanceLabel && <strong>{distanceLabel}</strong>}
      </div>
      <div ref={mapElementRef} className="room-details-map" aria-label={`Map showing the straight-line distance from STU to ${hostel.name}`} />
      <p className="room-details-map-caption">Straight-line distance from STU to {hostel.name}. Actual travel distance may vary.</p>
    </section>
  );
}