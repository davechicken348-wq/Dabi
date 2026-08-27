import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hostel } from "../../data/hostels";
import { areaCoords, matchArea, nearestArea } from "../../data/geo";
import { useSchool } from "../../context/SchoolContext";
import { IconDirections } from "../Icons/Icons";
import styles from "./FindHostelMap.module.css";

function schoolIcon(): L.DivIcon {
  const svg = `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 2C9 2 3 8 3 16c0 10 14 26 14 26s14-16 14-26C31 8 25 2 17 2z" fill="#176b4d" stroke="#ffffff" stroke-width="2"/>
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

const SCHOOL_ICON = schoolIcon();

// Structured, styled popup content for the school marker. The outer class is
// passed to Leaflet so the module CSS can target it; the inner markup carries
// the school name and a "Your school" tag.
function schoolPopupHtml(name: string): string {
  return `<div class="${styles.schoolPopupInner}">
    <div class="${styles.schoolPopupName}">${name}</div>
    <div class="${styles.schoolPopupTag}">Your school</div>
  </div>`;
}

// Bubble marker showing how many hostels are in an area. Clicking it opens that
// area's hostel list in the page's side panel (handled by `onAreaSelect`).
function areaIcon(count: number): L.DivIcon {
  return L.divIcon({
    html: `<div class="${styles.areaBubble}">${count}</div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

interface Props {
  hostels: Hostel[];
  big?: boolean;
  fill?: boolean;
  onAreaSelect?: (area: string, hostels: Hostel[]) => void;
}

export default function FindHostelMap({ hostels, big = false, fill = false, onAreaSelect }: Props) {
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
      .bindPopup(schoolPopupHtml(school.name), {
        className: styles.schoolPopup,
        closeButton: false,
      });

    groupRef.current = group;
    schoolMarkerRef.current = schoolMarker;
    mapRef.current = map;
    setState("ready");

    // Leaflet measures its container once at init; if the box is still settling
    // (e.g. the full-screen fixed parent or the dynamic mobile viewport), the
    // tiles only fill part of it. Keep correcting the size as the container
    // changes so the map always fills its box.
    const syncSize = () => map.invalidateSize();
    const raf = requestAnimationFrame(syncSize);
    const timer = setTimeout(syncSize, 200);
    const ro = new ResizeObserver(syncSize);
    if (elRef.current) ro.observe(elRef.current);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      groupRef.current = null;
      schoolMarkerRef.current = null;
      setState("loading");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-plot hostels as one marker per area (count bubble). Clicking a marker
  // opens that area's hostel list in the page's side panel. The precise door
  // coordinates are never plotted.
  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group) return;

    map.invalidateSize();

    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.setLatLng([school.lat, school.lng]);
      schoolMarkerRef.current.setPopupContent(schoolPopupHtml(school.name));
    }

    group.clearLayers();
    const points: [number, number][] = [[school.lat, school.lng]];

    // Group hostels into areas using their exact pinned coordinates, so each
    // hostel lands in the area it actually sits in (the same source of truth as
    // the add-hostel form). Falls back to name matching only for hostels that
    // have no coordinates yet.
    const byArea = new Map<string, Hostel[]>();
    for (const h of hostels) {
      const ckey =
        typeof h.lat === "number" && typeof h.lng === "number"
          ? nearestArea(h.lat, h.lng)
          : matchArea(h.location);
      if (!ckey) continue;
      const list = byArea.get(ckey) ?? [];
      list.push(h);
      byArea.set(ckey, list);
    }

    byArea.forEach((list, ckey) => {
      // Position the area bubble at the real coordinates of its hostels — the
      // exact pin dropped in the add-hostel form (latitude/longitude). When an
      // area has several hostels we average their coordinates so the bubble sits
      // where the hostels actually are. Falls back to the canonical area
      // centroid only when no hostel carries coordinates yet.
      const coords = list
        .map((h) =>
          typeof h.lat === "number" && typeof h.lng === "number"
            ? ([h.lat, h.lng] as [number, number])
            : null,
        )
        .filter((c): c is [number, number] => c !== null);

      let coord: [number, number] | null = null;
      if (coords.length > 0) {
        const sum = coords.reduce(
          (acc, c) => [acc[0] + c[0], acc[1] + c[1]] as [number, number],
          [0, 0] as [number, number],
        );
        coord = [sum[0] / coords.length, sum[1] / coords.length];
      } else {
        coord = areaCoords(ckey);
      }
      if (!coord) return;
      points.push(coord);

      const marker = L.marker(coord, { icon: areaIcon(list.length) }).on("click", () => {
        onAreaSelect?.(ckey, list);
      });

      marker.addTo(group);
    });

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([school.lat, school.lng], 13);
    }
  }, [hostels, school, navigate, onAreaSelect]);

  return (
    <div className={`${styles.wrap} ${big ? styles.big : ""} ${fill ? styles.fill : ""}`}>
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
