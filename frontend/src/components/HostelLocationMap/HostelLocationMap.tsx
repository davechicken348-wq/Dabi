import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversineKm } from "../../data/geo";
import { IconDirections } from "../Icons/Icons";
import styles from "./HostelLocationMap.module.css";

interface Props {
  hostelName: string;
  hostelLat: number;
  hostelLng: number;
  schoolName: string;
  schoolLat: number;
  schoolLng: number;
}

function pinIcon(color: string): L.DivIcon {
  const svg = `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 2C9 2 3 8 3 16c0 10 14 26 14 26s14-16 14-26C31 8 25 2 17 2z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
    <circle cx="17" cy="16" r="6" fill="#ffffff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

const SCHOOL_ICON = pinIcon("#176b4d");
const HOSTEL_ICON = pinIcon("#e9b949");

export default function HostelLocationMap({
  hostelName,
  hostelLat,
  hostelLng,
  schoolName,
  schoolLat,
  schoolLng,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [state, setState] = useState<"loading" | "ready">("loading");

  const distance = haversineKm(hostelLat, hostelLng, schoolLat, schoolLng);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const school = L.marker([schoolLat, schoolLng], { icon: SCHOOL_ICON })
      .addTo(map)
      .bindPopup(`<strong>${schoolName}</strong><br>Your school`);

    const hostel = L.marker([hostelLat, hostelLng], { icon: HOSTEL_ICON })
      .addTo(map)
      .bindPopup(`<strong>${hostelName}</strong><br>Hostel`);

    L.polyline(
      [
        [schoolLat, schoolLng],
        [hostelLat, hostelLng],
      ],
      { color: "#176b4d", weight: 4, opacity: 0.8, dashArray: "8 6" },
    )
      .addTo(map)
      .bindPopup(
        `About ${distance.toFixed(1)} km (straight line) from ${schoolName}`,
      );

    map.fitBounds(L.latLngBounds([school.getLatLng(), hostel.getLatLng()]), {
      padding: [60, 60],
    });

    mapRef.current = map;
    setState("ready");
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      setState("loading");
    };
    // Props are stable for a given hostel + school (parent remounts on change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrap}>
      <div ref={elRef} className={styles.canvas} />

      {state === "loading" && (
        <div className={styles.loadingOverlay}>
          <IconDirections size={26} />
          <span>Loading map…</span>
        </div>
      )}

      {state === "ready" && (
        <div className={styles.badge}>
          <IconDirections size={18} />
          <span>
            <strong>{distance.toFixed(1)} km</strong> from {schoolName}
          </span>
        </div>
      )}
    </div>
  );
}
