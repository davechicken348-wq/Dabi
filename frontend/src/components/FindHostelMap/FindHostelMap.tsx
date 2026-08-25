import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hostel } from "../../data/hostels";
import { areaCoords, haversineKm } from "../../data/geo";
import { useSchool } from "../../context/SchoolContext";
import { IconDirections } from "../Icons/Icons";
import styles from "./FindHostelMap.module.css";

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

interface Props {
  hostels: Hostel[];
}

function resolveCoords(h: Hostel): [number, number] | null {
  const lat = h.lat ?? areaCoords(h.location)?.[0];
  const lng = h.lng ?? areaCoords(h.location)?.[1];
  return lat != null && lng != null ? [lat, lng] : null;
}

export default function FindHostelMap({ hostels }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const [state, setState] = useState<"loading" | "ready">("loading");
  const { school } = useSchool();
  const navigate = useNavigate();

  // Initialise the map exactly once.
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

    const group = L.layerGroup().addTo(map);
    const schoolMarker = L.marker([school.lat, school.lng], { icon: SCHOOL_ICON })
      .addTo(map)
      .bindPopup(`<strong>${school.name}</strong><br>Your school`);

    groupRef.current = group;
    schoolMarkerRef.current = schoolMarker;
    mapRef.current = map;
    setState("ready");
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      groupRef.current = null;
      schoolMarkerRef.current = null;
      setState("loading");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-plot hostels (and the school pin) whenever the list or school changes.
  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group) return;

    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.setLatLng([school.lat, school.lng]);
      schoolMarkerRef.current.setPopupContent(
        `<strong>${school.name}</strong><br>Your school`,
      );
    }

    group.clearLayers();
    const points: [number, number][] = [[school.lat, school.lng]];

    hostels.forEach((h) => {
      const coord = resolveCoords(h);
      if (!coord) return;
      points.push(coord);

      const distance = haversineKm(coord[0], coord[1], school.lat, school.lng);
      const price = h.pricePerYear.toLocaleString("en-GH");
      const cover = h.photos?.[0] ?? h.image;
      const statusClass =
        h.availability === "Available"
          ? styles.popupStatusAvailable
          : h.availability === "Limited"
            ? styles.popupStatusLimited
            : styles.popupStatusFull;

      const marker = L.marker(coord, {
        icon: HOSTEL_ICON,
      }).bindPopup(
        `<div class="${styles.popup}">
           <div class="${styles.popupMedia}">
             <img src="${cover}" alt="${h.name}" class="${styles.popupImage}" />
             <span class="${styles.popupStatus} ${statusClass}">${h.availability}</span>
             ${h.verified ? `<span class="${styles.popupVerified}">✓ Verified</span>` : ""}
           </div>
           <div class="${styles.popupBody}">
             <strong class="${styles.popupName}">${h.name}</strong>
             <span class="${styles.popupMeta}">${h.location}</span>
             <span class="${styles.popupMeta}">GH₵ ${price} / year</span>
             <span class="${styles.popupDist}">${distance.toFixed(1)} km from ${school.short} (straight line)</span>
             <a class="${styles.popupLink}" href="/hostel/${h.id}">View details</a>
           </div>
          </div>`,
        { maxWidth: 268, minWidth: 240, autoPanPadding: [40, 40] },
      );

      marker.on("popupopen", (e) => {
        const link = e.popup.getElement()?.querySelector("a");
        link?.addEventListener("click", (ev) => {
          ev.preventDefault();
          navigate(`/hostel/${h.id}`);
        });
      });

      marker.addTo(group);
    });

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([school.lat, school.lng], 13);
    }
  }, [hostels, school, navigate]);

  return (
    <div className={styles.wrap}>
      <div ref={elRef} className={styles.canvas} />
      {state === "loading" && (
        <div className={styles.loadingOverlay}>
          <IconDirections size={26} />
          <span>Loading map…</span>
        </div>
      )}
    </div>
  );
}
