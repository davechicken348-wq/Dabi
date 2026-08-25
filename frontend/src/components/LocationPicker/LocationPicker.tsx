import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconMap, IconCrosshair, IconSearch } from "../../components/Icons/Icons";
import styles from "./LocationPicker.module.css";

// Sunyani Technical University — default map center.
const STU: [number, number] = [7.3201, -2.3175];

const NOMINATIM = "https://nominatim.openstreetmap.org";

interface Props {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  onAddress?: (address: string) => void;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  onAddress,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [readout, setReadout] = useState("");

  const hasStart = latitude != null && longitude != null;

  const handleSet = useCallback(
    async (lat: number, lng: number) => {
      setReadout(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      onChange(lat, lng);
      if (onAddress) {
        const addr = await reverseGeocode(lat, lng);
        if (addr) onAddress(addr);
      }
    },
    [onChange, onAddress],
  );

  const placeMarker = useCallback(
    (lat: number, lng: number, fire = true) => {
      const map = mapRef.current;
      if (!map) return;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current!.getLatLng();
          void handleSet(p.lat, p.lng);
        });
      }
      if (fire) void handleSet(lat, lng);
    },
    [handleSet],
  );

  // Initialise the map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: hasStart ? [latitude!, longitude!] : STU,
      zoom: hasStart ? 16 : 14,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (hasStart) placeMarker(latitude!, longitude!, false);

    map.on("click", (e: { latlng: L.LatLng }) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        mapRef.current?.setView([lat, lng], 16);
        placeMarker(lat, lng);
      }
    } catch {
      /* ignore search failures */
    } finally {
      setSearching(false);
    }
  };

  const onGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapRef.current?.setView([lat, lng], 16);
        placeMarker(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className={styles.picker}>
      <div className={styles.toolbar}>
        <form className={styles.search} onSubmit={onSearch}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search an address or area…"
          />
          <button type="submit" className={styles.searchBtn} disabled={searching}>
            <IconSearch size={16} />
            {searching ? "…" : "Search"}
          </button>
        </form>
        <button type="button" className={styles.gpsBtn} onClick={onGps}>
          <IconCrosshair size={16} />
          Use my location
        </button>
      </div>

      <div className={styles.map} ref={elRef} />

      <div className={styles.readout}>
        <IconMap size={15} />
        <span>
          {readout || "Click the map to drop a pin for this hostel."}
        </span>
      </div>
    </div>
  );
}
