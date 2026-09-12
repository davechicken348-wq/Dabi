import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hostel } from '../../types';
import { STU } from '../../data/geo';
import './DistanceMap.css';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

const STU_LEAFLET: [number, number] = [STU.lat, STU.lng];

export function DistanceMap({ hostel }: { hostel: Hostel }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const lat = hostel.latitude ?? STU.lat;
    const lng = hostel.longitude ?? STU.lng;
    const hostelCoord: [number, number] = [lat, lng];
    const distance = hostel.distanceKm ?? haversineKm(STU.lat, STU.lng, lat, lng);

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const stuIcon = L.divIcon({
      className: 'distance-map-stu-icon',
      html: '<div class="distance-map-marker distance-map-stu"><span class="distance-map-marker-dot">STU</span><span class="distance-map-marker-label">STU campus</span></div>',
      iconSize: [112, 42],
      iconAnchor: [56, 21],
    });

    const hostelIcon = L.divIcon({
      className: 'distance-map-hostel-icon',
      html: `<div class="distance-map-marker distance-map-hostel"><span class="distance-map-marker-dot">⌂</span><span class="distance-map-marker-label">${hostel.name}</span></div>`,
      iconSize: [190, 58],
      iconAnchor: [95, 29],
    });

    L.marker(STU_LEAFLET, { icon: stuIcon })
      .addTo(map)
      .bindPopup('<strong>STU</strong><br>Sunyani Technical University');

    L.marker(hostelCoord, { icon: hostelIcon })
      .addTo(map)
      .bindPopup(`<strong>${hostel.name}</strong><br>${hostel.location}<br><em>${distance} km from STU</em>`);

    L.polyline([STU_LEAFLET, hostelCoord], {
      color: '#15694b',
      weight: 3,
      opacity: 0.7,
      dashArray: '8 6',
    }).addTo(map);

    const bounds = L.latLngBounds([STU_LEAFLET, hostelCoord]);
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });

    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    const overviewZoom = map.getZoom();
    map.setMinZoom(overviewZoom);
    map.setMaxZoom(overviewZoom);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hostel]);

  return (
    <div className="distance-map">
      <div className="distance-map-header">
        <div>
          <span className="distance-map-eyebrow">Getting there</span>
          <h3 className="distance-map-title">Near Sunyani Technical University</h3>
        </div>
        <span className="distance-map-distance">
          {hostel.distanceKm !== undefined
            ? `${hostel.distanceKm} km`
            : `${haversineKm(STU.lat, STU.lng, hostel.latitude ?? STU.lat, hostel.longitude ?? STU.lng)} km`}
        </span>
      </div>
      <div ref={containerRef} className="distance-map-container" />
      <div className="distance-map-footer">
        <div className="distance-map-route">
          <span className="distance-map-route-point distance-map-route-school">STU</span>
          <span className="distance-map-route-line" />
          <span className="distance-map-route-point distance-map-route-hostel">⌂</span>
          <span className="distance-map-route-label">{hostel.name}</span>
        </div>
        <span className="distance-map-address">{hostel.address || hostel.location}</span>
      </div>
    </div>
  );
}
