import { useCallback, useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconMap, IconCrosshair, IconSearch } from "../../components/Icons/Icons";
import { nearestArea, matchArea, AREA_OPTIONS } from "../../data/geo";
import styles from "./LocationPicker.module.css";

// Sunyani Technical University — default map center.
const STU: [number, number] = [7.3201, -2.3175];

const NOMINATIM = "https://nominatim.openstreetmap.org";

interface Props {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  /** Called with the locality the pin was dropped in. The pin is always kept at
   *  its exact coordinate; only the area name is reported (and may be a brand
   *  new town the map detected, not one of the preset areas). */
  onArea?: (area: string) => void;
}

// The area is whatever locality the pin is actually dropped in — the map
// decides, not a fixed town list. We reverse-geocode the coordinate and take
// the most specific place name (suburb → neighbourhood → quarter → village →
// town → city…). If that name matches one of our known areas we normalise it
// to the canonical label; otherwise we keep the real name as-is (a new town is
// allowed). Falls back to the nearest known area only when offline/rate-limited.
async function detectLocality(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (res.ok) {
      const data = (await res.json()) as { address?: Record<string, string> };
      const addr = data.address ?? {};
      const candidates = [
        addr.suburb,
        addr.neighbourhood,
        addr.quarter,
        addr.city_district,
        addr.hamlet,
        addr.village,
        addr.town,
        addr.municipality,
        addr.county,
        addr.state_district,
        addr.city,
        addr.state,
      ].filter((v): v is string => Boolean(v));
      for (const c of candidates) {
        const key = matchArea(c);
        if (key) {
          return AREA_OPTIONS.find((o) => o.value === key)?.label ?? key;
        }
        // First (most specific) place name that isn't a known area: keep it.
        return c;
      }
    }
  } catch {
    /* fall through to offline nearest-area */
  }
  const fallback = nearestArea(lat, lng);
  return fallback
    ? AREA_OPTIONS.find((o) => o.value === fallback)?.label ?? fallback
    : null;
}

function areaLabel(key: string | null): string {
  if (!key) return "";
  return AREA_OPTIONS.find((o) => o.value === key)?.label ?? key;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  onArea,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [readout, setReadout] = useState("");
  const [detectedArea, setDetectedArea] = useState<string | null>(null);

  const hasStart = latitude != null && longitude != null;

  const handleSet = useCallback(
    async (lat: number, lng: number) => {
      onChange(lat, lng);
      // Report the locality the pin was dropped in (the map decides it). The
      // pin keeps its exact coordinate; only the area name is sent up.
      const area = await detectLocality(lat, lng);
      if (area) {
        setDetectedArea(area);
        onArea?.(area);
      } else {
        setDetectedArea(null);
      }
      setReadout(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    },
    [onChange, onArea],
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
      const { lat, lng } = e.latlng;
      // The pin drops where clicked and the locality is detected from that
      // exact point (no snapping to a fixed area centroid).
      placeMarker(lat, lng);
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

  const onSearch = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
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
        <div className={styles.search}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onSearch(e);
              }
            }}
            placeholder="Search an address or area…"
          />
          <button
            type="button"
            className={styles.searchBtn}
            disabled={searching}
            onClick={(e) => void onSearch(e)}
          >
            <IconSearch size={16} />
            {searching ? "…" : "Search"}
          </button>
        </div>
        <button type="button" className={styles.gpsBtn} onClick={onGps}>
          <IconCrosshair size={16} />
          Use my location
        </button>
      </div>

      <div className={styles.map} ref={elRef} />

      <div className={styles.readout}>
        <IconMap size={15} />
        <span>
          {detectedArea
            ? `Detected area: ${areaLabel(detectedArea)}`
            : readout || "Click the map to drop a pin — the area fills in automatically."}
        </span>
      </div>
    </div>
  );
}
