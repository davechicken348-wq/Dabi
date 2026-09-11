import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

interface Props {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
  onArea?: (area: string) => void;
}

const DEFAULT_CENTER: [number, number] = [7.34, -2.33];

export default function LocationPicker({ latitude, longitude, onChange, onArea }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [lat, setLat] = useState(latitude?.toString() ?? '');
  const [lng, setLng] = useState(longitude?.toString() ?? '');

  const update = (nextLat: string, nextLng: string) => {
    setLat(nextLat);
    setLng(nextLng);

    const parsedLat = Number(nextLat);
    const parsedLng = Number(nextLng);

    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      onChange(parsedLat, parsedLng);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [latitude ?? DEFAULT_CENTER[0], longitude ?? DEFAULT_CENTER[1]],
      13,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(
      [latitude ?? DEFAULT_CENTER[0], longitude ?? DEFAULT_CENTER[1]],
      { draggable: true },
    ).addTo(map);

    marker.on('dragend', () => {
      const point = marker.getLatLng();
      update(point.lat.toString(), point.lng.toString());
    });

    map.on('click', (event) => {
      const { lat: clickedLat, lng: clickedLng } = event.latlng;
      marker.setLatLng([clickedLat, clickedLng]);
      update(clickedLat.toString(), clickedLng.toString());
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const point: [number, number] = [
      latitude ?? DEFAULT_CENTER[0],
      longitude ?? DEFAULT_CENTER[1],
    ];

    mapInstanceRef.current.setView(point, mapInstanceRef.current.getZoom());
    markerRef.current.setLatLng(point);
  }, [latitude, longitude]);

  return (
    <div className="location-picker">
      <div className="location-picker-map" ref={mapRef} />

      <div className="location-picker-controls">
        <label>
          Latitude
          <input value={lat} onChange={(e) => update(e.target.value, lng)} />
        </label>

        <label>
          Longitude
          <input value={lng} onChange={(e) => update(lat, e.target.value)} />
        </label>

        {onArea && (
          <button type="button" onClick={() => onArea('Campus')}>
            Use campus area
          </button>
        )}
      </div>
    </div>
  );
}
