import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AttributionControl, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Logo } from '../../shared/Logo/Logo';
import { Search } from '../components/Search/Search';
import { fetchRooms, fetchHostels } from '../../services/hostelService';
import type { RoomOption, Hostel, SearchFilters } from '../../types';
import { LOCATIONS } from '../../lib/constants';
import { getFreshnessLabel, getAvailabilityStatus, cn } from '../../lib/utils';
import './Map.css';

const AREA_COORDINATES: Record<string, [number, number]> = {
  'Campus': [-2.3167, 7.3214],
  'New Dormaa': [-2.35, 7.345],
  'Penkwase': [-2.31, 7.355],
  'Magazine': [-2.34, 7.32],
  'Old Dormaa': [-2.36, 7.325],
  'Tanoso': [-2.29, 7.35],
  'Pankrono': [-2.30, 7.31],
  'Anyinam': [-2.37, 7.36],
};

const AREA_POSITIONS: Record<string, { top: string; left?: string; right?: string }> = {
  'Campus': { top: '18%', left: '44%' },
  'New Dormaa': { top: '60%', left: '14%' },
  'Penkwase': { top: '26%', right: '12%' },
  'Magazine': { top: '78%', left: '42%' },
  'Old Dormaa': { top: '72%', left: '28%' },
  'Tanoso': { top: '44%', right: '16%' },
  'Pankrono': { top: '85%', left: '58%' },
  'Anyinam': { top: '34%', left: '18%' },
};

const HOSTEL_MARKER_POSITIONS = [
  { top: '28%', left: '24%' },
  { top: '44%', left: '40%' },
  { top: '62%', left: '28%' },
  { top: '34%', left: '66%' },
  { top: '68%', left: '66%' },
  { top: '52%', left: '52%' },
  { top: '20%', left: '52%' },
  { top: '76%', left: '42%' },
  { top: '46%', left: '76%' },
  { top: '18%', left: '76%' },
];

const STU_COORDINATES = {
  mapLibre: [-2.3167, 7.3214] as [number, number],
  leaflet: [7.3214, -2.3167] as [number, number],
};

function getAreaPosition(area: string) {
  return AREA_POSITIONS[area] ?? { top: '50%', left: '50%' };
}

function getHostelCoordinates(hostel: Hostel) {
  if (hostel.latitude != null && hostel.longitude != null) {
    return {
      mapLibre: [hostel.longitude, hostel.latitude] as [number, number],
      leaflet: [hostel.latitude, hostel.longitude] as [number, number],
    };
  }

  const areaCenter = AREA_COORDINATES[hostel.location];
  if (!areaCenter) {
    return null;
  }

  return {
    mapLibre: areaCenter,
    leaflet: [areaCenter[1], areaCenter[0]] as [number, number],
  };
}

type MapFilterOption = { value: string; label: string };

function MapFilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: MapFilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selected = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? label;

  return (
    <div className="map-filter-dropdown" ref={ref}>
      <button
        type="button"
        className="map-filter-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected}</span>
        <span className="map-filter-dropdown-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>

      {open && (
        <div className="map-filter-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={cn(
                'map-filter-dropdown-option',
                option.value === value && 'map-filter-dropdown-option-active',
              )}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Map() {
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minPrice: null,
    maxPrice: null,
    location: '',
    occupancy: null,
    facilities: [],
    availability: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapFallback, setMapFallback] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRefs = useRef<L.Layer[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchRooms(), fetchHostels()])
      .then(([roomsData, hostelsData]) => {
        if (cancelled) return;
        const roomsWithHostelDetails = roomsData.map((room) => {
          const hostel = hostelsData.find((item) => item.id === room.hostelId);
          return {
            ...room,
            hostelName: hostel?.name,
            hostelLocation: hostel?.location,
          };
        });
        setRooms(roomsWithHostelDetails);
        setHostels(hostelsData);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('We could not load map results right now.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-2.33, 7.34],
        zoom: 13,
        attributionControl: false,
      });
    } catch {
      setMapFallback(true);
      return;
    }

    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    map.on('error', () => {
      setMapFallback(true);
    });

    mapRef.current = map;
    requestAnimationFrame(() => map.resize());
    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [loading]);

  useEffect(() => {
    if (loading || !mapFallback || !mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([7.34, -2.33], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMapRef.current = map;

    return () => {
      leafletMarkerRefs.current = [];
      map.remove();
      leafletMapRef.current = null;
    };
  }, [loading, mapFallback]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = rooms;

    if (normalizedQuery) {
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(normalizedQuery) ||
          room.hostelName?.toLowerCase().includes(normalizedQuery) ||
          room.hostelLocation?.toLowerCase().includes(normalizedQuery) ||
          room.facilities.some((f) => f.toLowerCase().includes(normalizedQuery))
      );
    }

    return result.filter((room) => {
      if (filters.location && room.hostelLocation !== filters.location) return false;
      if (filters.occupancy && room.occupancy !== filters.occupancy) return false;
      if (filters.minPrice !== null && room.pricePerYear < filters.minPrice) return false;
      if (filters.maxPrice !== null && room.pricePerYear > filters.maxPrice) return false;
      if (filters.facilities.length > 0 && !filters.facilities.every((f) => room.facilities.includes(f))) return false;
      if (filters.availability !== 'all') {
        const available = filters.availability === 'available';
        if (available ? room.availableUnits === 0 : room.availableUnits > 0) return false;
      }
      return true;
    });
  }, [query, rooms, filters]);

  const hostelGroups = useMemo(() => {
    const groups = filteredRooms.reduce<Record<string, RoomOption[]>>((result, room) => {
      if (!room.hostelId) return result;
      result[room.hostelId] = result[room.hostelId] ? [...result[room.hostelId], room] : [room];
      return result;
    }, {});
    return Object.values(groups);
  }, [filteredRooms]);

  const selectedHostel = useMemo(
    () => hostels.find((h) => h.id === selectedHostelId) || null,
    [hostels, selectedHostelId]
  );

  const selectedHostelRooms = useMemo(
    () => (selectedHostel ? filteredRooms.filter((r) => r.hostelId === selectedHostel.id) : []),
    [selectedHostel, filteredRooms]
  );

  const areaSummary = useMemo(() => {
    const summary: Record<string, { hostels: Set<string>; rooms: RoomOption[] }> = {};
    filteredRooms.forEach((room) => {
      if (!room.hostelLocation) return;
      if (!summary[room.hostelLocation]) {
        summary[room.hostelLocation] = { hostels: new Set(), rooms: [] };
      }
      summary[room.hostelLocation].hostels.add(room.hostelId);
      summary[room.hostelLocation].rooms.push(room);
    });
    return summary;
  }, [filteredRooms]);

  const visibleAreas = useMemo(() => {
    if (selectedArea) {
      return Object.keys(areaSummary).filter((a) => a === selectedArea);
    }
    return Object.keys(areaSummary);
  }, [areaSummary, selectedArea]);

  const locationOptions = useMemo(
    () => Array.from(new Set(hostels.map((hostel) => hostel.location).filter(Boolean))).sort(),
    [hostels],
  );

  const occupancyOptions = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.occupancy).filter((value): value is number => Number.isFinite(value)))).sort((a, b) => a - b),
    [rooms],
  );

  const priceOptions = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.pricePerYear))).sort((a, b) => a - b),
    [rooms],
  );

  const facilityOptions = useMemo(
    () => Array.from(new Set(hostels.flatMap((hostel) => hostel.facilities))).sort(),
    [hostels],
  );

  const visibleHostelGroups = useMemo(() => {
    if (!selectedArea) return [];
    return hostelGroups.filter((group) => group[0]?.hostelLocation === selectedArea);
  }, [hostelGroups, selectedArea]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setSelectedArea(null);
    setSelectedHostelId(null);
    setZoom(1);
  }, []);

  const handleSelectArea = useCallback((area: string) => {
    const isDeselecting = selectedArea === area;
    setSelectedArea(isDeselecting ? null : area);
    setSelectedHostelId(null);
    setZoom(isDeselecting ? 1 : 1.25);
  }, [selectedArea]);

  const handleSelectHostel = useCallback((hostelId: string) => {
    setSelectedHostelId((prev) => (prev === hostelId ? null : hostelId));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      query: '',
      minPrice: null,
      maxPrice: null,
      location: '',
      occupancy: null,
      facilities: [],
      availability: 'all',
    });
    setQuery('');
    setSelectedArea(null);
    setSelectedHostelId(null);
    setZoom(1);
  }, []);

  const toggleFacility = useCallback((facility: string) => {
    setFilters((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    const addMarker = (element: HTMLButtonElement, coordinates: [number, number]) => {
      const marker = new Marker({ element, anchor: 'bottom' }).setLngLat(coordinates).addTo(map);
      markerRefs.current.push(marker);
    };

    if (selectedArea) {
      const center = AREA_COORDINATES[selectedArea];
      if (center) map.flyTo({ center, zoom: 14.5, duration: 700 });

      visibleHostelGroups.forEach((hostelRooms, index) => {
        const hostel = hostels.find((item) => item.id === hostelRooms[0]?.hostelId);
        const hostelCoordinates = hostel ? getHostelCoordinates(hostel) : null;
        if (!hostel || !hostelCoordinates) return;

        const element = document.createElement('button');
        element.type = 'button';
        element.className = cn('map-hostel-marker', hostel.id === selectedHostelId && 'map-hostel-marker-selected');
        element.innerHTML = `<span class="map-hostel-marker-name">${hostel.name}</span><span class="map-hostel-marker-price">GH₵${Math.min(...hostelRooms.map((room) => room.pricePerYear)).toLocaleString()}/yr</span>`;
        element.addEventListener('click', () => handleSelectHostel(hostel.id));
        const offset = (index - (visibleHostelGroups.length - 1) / 2) * 0.002;
        addMarker(element, [hostelCoordinates.mapLibre[0] + offset, hostelCoordinates.mapLibre[1] + offset]);
      });
    } else {
      map.flyTo({ center: [-2.33, 7.34], zoom: 13, duration: 700 });

      Object.entries(areaSummary).forEach(([area, summary]) => {
        const center = AREA_COORDINATES[area];
        if (!center) return;
        const element = document.createElement('button');
        element.type = 'button';
        element.className = cn('map-area-bubble', selectedArea === area && 'map-area-bubble-active');
        element.innerHTML = `<span class="map-area-bubble-name">${area}</span><span class="map-area-bubble-meta">${summary.hostels.size} ${summary.hostels.size === 1 ? 'hostel' : 'hostels'} · ${summary.rooms.length} rooms</span>`;
        element.addEventListener('click', () => handleSelectArea(area));
        addMarker(element, center);
      });

      hostels.forEach((hostel) => {
        const hostelCoordinates = getHostelCoordinates(hostel);
        if (!hostelCoordinates) return;

        const element = document.createElement('button');
        element.type = 'button';
        element.className = cn('map-hostel-marker', hostel.id === selectedHostelId && 'map-hostel-marker-selected');
        element.innerHTML = `<span class="map-hostel-marker-name">${hostel.name}</span><span class="map-hostel-marker-price">GH₵${Math.min(...hostel.roomOptions.map((room) => room.pricePerYear)).toLocaleString()}/yr</span>`;
        element.addEventListener('click', () => handleSelectHostel(hostel.id));
        addMarker(element, hostelCoordinates.mapLibre);
      });
    }

    const stuMarker = document.createElement('button');
    stuMarker.type = 'button';
    stuMarker.className = 'map-hostel-marker map-stu-marker';
    stuMarker.innerHTML = '<span class="map-hostel-marker-name">STU</span><span class="map-hostel-marker-price">Sunyani Technical University</span>';
    addMarker(stuMarker, STU_COORDINATES.mapLibre);
  }, [areaSummary, hostels, loading, selectedArea, selectedHostelId, visibleHostelGroups]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || loading || !mapFallback) return;

    leafletMarkerRefs.current.forEach((layer) => layer.remove());
    leafletMarkerRefs.current = [];

    const addMarker = (html: string, coordinates: [number, number], onClick: () => void) => {
      const marker = L.marker(coordinates, {
        icon: L.divIcon({ className: 'live-map-marker-icon', html, iconSize: [1, 1], iconAnchor: [0, 0] }),
      }).addTo(map);
      marker.on('click', onClick);
      leafletMarkerRefs.current.push(marker);
    };

    if (selectedArea) {
      const center = AREA_COORDINATES[selectedArea];
      if (center) map.flyTo([center[1], center[0]], 14.5, { duration: 0.7 });

      visibleHostelGroups.forEach((hostelRooms, index) => {
        const hostel = hostels.find((item) => item.id === hostelRooms[0]?.hostelId);
        const hostelCoordinates = hostel ? getHostelCoordinates(hostel) : null;
        if (!hostel || !hostelCoordinates) return;
        const offset = (index - (visibleHostelGroups.length - 1) / 2) * 0.002;
        const selectedClass = hostel.id === selectedHostelId ? ' live-map-marker-selected' : '';
        addMarker(`<span class="live-map-hostel-marker${selectedClass}"><strong>${hostel.name}</strong><small>GH₵${Math.min(...hostelRooms.map((room) => room.pricePerYear)).toLocaleString()}/yr</small></span>`, [hostelCoordinates.leaflet[0] + offset, hostelCoordinates.leaflet[1] + offset], () => handleSelectHostel(hostel.id));
      });
    } else {
      map.flyTo([7.34, -2.33], 13, { duration: 0.7 });
      Object.entries(areaSummary).forEach(([area, summary]) => {
        const center = AREA_COORDINATES[area];
        if (!center) return;
        addMarker(`<span class="live-map-area-marker"><strong>${area}</strong><small>${summary.hostels.size} hostels · ${summary.rooms.length} rooms</small></span>`, [center[1], center[0]], () => handleSelectArea(area));
      });

      hostels.forEach((hostel) => {
        const hostelCoordinates = getHostelCoordinates(hostel);
        if (!hostelCoordinates) return;
        const selectedClass = hostel.id === selectedHostelId ? ' live-map-marker-selected' : '';
        addMarker(`<span class="live-map-hostel-marker${selectedClass}"><strong>${hostel.name}</strong><small>GH₵${Math.min(...hostel.roomOptions.map((room) => room.pricePerYear)).toLocaleString()}/yr</small></span>`, hostelCoordinates.leaflet, () => handleSelectHostel(hostel.id));
      });

      addMarker('<span class="live-map-hostel-marker live-map-stu-marker"><strong>STU</strong><small>Sunyani Technical University</small></span>', STU_COORDINATES.leaflet, () => {});
    }
  }, [areaSummary, handleSelectArea, handleSelectHostel, hostels, loading, mapFallback, selectedArea, selectedHostelId, visibleHostelGroups]);

  useEffect(() => {
    if (mapRef.current && !selectedArea) {
      mapRef.current.easeTo({ zoom: 12.5 + zoom * 0.5, duration: 350 });
    }
    if (leafletMapRef.current && !selectedArea) {
      leafletMapRef.current.setZoom(12.5 + zoom * 0.5, { animate: true });
    }
  }, [selectedArea, zoom]);

  const activeFilterCount = [
    filters.location,
    filters.occupancy,
    filters.availability !== 'all' ? filters.availability : '',
    filters.minPrice,
    ...filters.facilities,
  ].filter(Boolean).length;

  const totalAvailable = useMemo(
    () => filteredRooms.reduce((sum, r) => sum + r.availableUnits, 0),
    [filteredRooms]
  );

  const totalRooms = filteredRooms.length;

  if (error) {
    return (
      <div className="map-page">
        <div className="map-error">
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="map-page">
        <div className="map-loading">
          <div className="map-loading-spinner" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      {/* Top floating bar */}
      <header className="map-topbar">
        <Link to="/findroom" className="map-topbar-brand" aria-label="Dabi home">
          <Logo size="sm" />
        </Link>
        <div className="map-searchbox">
          <Search onSearch={handleSearch} placeholder="Search areas, hostels or rooms..." />
        </div>
        <div className="map-topbar-actions">
          <button
            type="button"
            className={cn(
              'map-action-btn',
              filtersOpen && 'map-action-btn-active'
            )}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-label={filtersOpen ? 'Close filters' : 'Open filters'}
            aria-pressed={filtersOpen}
          >
            <span aria-hidden="true">☰</span>
            <span className="map-action-btn-label">Filters</span>
            {activeFilterCount > 0 && (
              <span className="map-action-btn-badge">{activeFilterCount}</span>
            )}
          </button>
          <button
            type="button"
            className={cn(
              'map-action-btn',
              viewMode === 'list' && 'map-action-btn-active'
            )}
            onClick={() => setViewMode((m) => (m === 'map' ? 'list' : 'map'))}
            aria-pressed={viewMode === 'list'}
          >
            {viewMode === 'map' ? 'List' : 'Map'}
          </button>
        </div>
      </header>

      {filtersOpen && (
        <button
          type="button"
          className="map-filter-backdrop"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      {/* Filter dialog */}
      <div
        className={cn('map-filters', filtersOpen && 'map-filters-open')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-filters-title"
      >
        <div className="map-filters-header">
          <div>
            <h2 id="map-filters-title">Explore</h2>
            <p className="map-filters-subtitle">Find your perfect room</p>
          </div>
          <button
            type="button"
            className="map-filters-close"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        <div className="map-filters-body">
          <div className="map-filter-group">
            <label className="map-filter-label">Where are you looking?</label>
            <MapFilterDropdown
              label="Where are you looking?"
              value={filters.location}
              options={[
                { value: '', label: 'All areas' },
                ...locationOptions.map((loc) => ({ value: loc, label: loc })),
              ]}
              onChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
            />
          </div>

          <div className="map-filter-group">
            <label className="map-filter-label">Room type</label>
            <MapFilterDropdown
              label="Room type"
              value={filters.occupancy?.toString() ?? ''}
              options={[
                { value: '', label: 'Any room type' },
                ...occupancyOptions.map((n) => ({ value: n.toString(), label: `${n} in 1` })),
              ]}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  occupancy: value ? Number(value) : null,
                }))
              }
            />
          </div>

          <div className="map-filter-group">
            <label className="map-filter-label">Budget (per year)</label>
            <MapFilterDropdown
              label="Budget (per year)"
              value={filters.minPrice?.toString() ?? ''}
              options={[
                { value: '', label: 'Any price' },
                ...priceOptions.map((price) => ({
                  value: price.toString(),
                  label: `GH₵${price.toLocaleString()}`,
                })),
              ]}
              onChange={(value) => {
                const price = value ? Number(value) : null;
                setFilters((prev) => ({
                  ...prev,
                  minPrice: price,
                  maxPrice: price,
                }));
              }}
            />
          </div>

          <div className="map-filter-group">
            <label className="map-filter-label">Availability</label>
            <MapFilterDropdown
              label="Availability"
              value={filters.availability}
              options={[
                { value: 'all', label: 'All' },
                { value: 'available', label: 'Available now' },
                { value: 'limited', label: 'Limited' },
              ]}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  availability: value as SearchFilters['availability'],
                }))
              }
            />
          </div>

          <div className="map-filter-group">
            <label className="map-filter-label">Facilities</label>
            <div className="map-facility-chips">
              {facilityOptions.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  className={cn(
                    'map-facility-chip',
                    filters.facilities.includes(facility) && 'map-facility-chip-active'
                  )}
                  onClick={() => toggleFacility(facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="map-filter-clear" onClick={handleClearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Map canvas */}
      <div className="map-canvas" aria-label="Accommodation map">
        <div ref={mapContainerRef} className="maplibre-container" />
        <div className={cn('map-canvas-scene', mapFallback && 'map-canvas-scene-fallback')} style={{ transform: `scale(${zoom})` }}>
          <div className="map-canvas-bg" />

          {/* Road decorations */}
          <div className="map-road map-road-one" />
          <div className="map-road map-road-two" />
          <div className="map-road map-road-three" />

          {/* Area labels */}
          {LOCATIONS.map((loc) => {
          const pos = getAreaPosition(loc);
          const style: React.CSSProperties = pos.left !== undefined ? { top: pos.top, left: pos.left } : { top: pos.top, right: pos.right };
          return (
            <div
              key={loc}
              className={cn(
                'map-area-label',
                selectedArea === loc && 'map-area-label-active'
              )}
              style={style}
            >
              {loc}
            </div>
          );
          })}

          {/* Area bubbles */}
          {visibleAreas.map((area) => {
          const summary = areaSummary[area];
          if (!summary) return null;
          const hostelCount = summary.hostels.size;
          const roomCount = summary.rooms.length;
          const availableCount = summary.rooms.reduce((sum, r) => sum + r.availableUnits, 0);
          const pos = getAreaPosition(area);
          const bubbleStyle: React.CSSProperties = pos.left !== undefined
            ? { top: pos.top, left: pos.left }
            : { top: pos.top, right: pos.right };

          return (
            <button
              key={area}
              type="button"
              className={cn(
                'map-area-bubble',
                selectedArea === area && 'map-area-bubble-active'
              )}
              style={bubbleStyle}
              onClick={() => handleSelectArea(area)}
            >
              <span className="map-area-bubble-name">{area}</span>
              <span className="map-area-bubble-meta">
                {hostelCount} {hostelCount === 1 ? 'hostel' : 'hostels'} · {roomCount} rooms
              </span>
              {availableCount > 0 && (
                <span className="map-area-bubble-available">{availableCount} available</span>
              )}
            </button>
          );
          })}

          {/* Hostel markers (when area selected) */}
          {selectedArea &&
            visibleHostelGroups.map((hostelRooms, index) => {
            const hostel = hostels.find((h) => h.id === hostelRooms[0].hostelId);
            if (!hostel) return null;
            const pos = HOSTEL_MARKER_POSITIONS[index % HOSTEL_MARKER_POSITIONS.length];
            const isSelected = hostel.id === selectedHostelId;
            const cheapestPrice = Math.min(...hostelRooms.map((r) => r.pricePerYear));
            const availableUnits = hostelRooms.reduce((sum, r) => sum + r.availableUnits, 0);

            return (
              <button
                key={hostel.id}
                type="button"
                className={cn(
                  'map-hostel-marker',
                  isSelected && 'map-hostel-marker-selected'
                )}
                style={pos}
                onClick={() => handleSelectHostel(hostel.id)}
              >
                <span className="map-hostel-marker-name">{hostel.name}</span>
                <span className="map-hostel-marker-price">GH₵{cheapestPrice.toLocaleString()}/yr</span>
                {availableUnits > 0 && (
                  <span className="map-hostel-marker-available">{availableUnits} left</span>
                )}
              </button>
            );
            })}
        </div>

        {/* Status bar */}
        <div className="map-status">
          {selectedArea ? (
            <span>
              {areaSummary[selectedArea]?.hostels.size || 0} hostels in {selectedArea} ·{' '}
              {areaSummary[selectedArea]?.rooms.reduce((sum, r) => sum + r.availableUnits, 0) || 0} rooms available
            </span>
          ) : (
            <span>
              {Object.keys(areaSummary).length} areas · {hostelGroups.length} hostels ·{' '}
              {totalAvailable} rooms available
            </span>
          )}
          {activeFilterCount > 0 && <span className="map-status-filters">· {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>}
        </div>
      </div>

      {/* Map controls */}
      <div className="map-controls">
        <button type="button" className="map-control-btn" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.6, value + 0.15))}>+</button>
        <button type="button" className="map-control-btn" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.15))}>−</button>
        <div className="map-control-divider" />
        <button type="button" className="map-control-btn" aria-label="Recenter map" onClick={() => setZoom(1)}>◎</button>
      </div>

      {/* Hostel detail card (desktop) */}
      {selectedHostel && (
        <div className="map-hostel-card" role="dialog" aria-label={`${selectedHostel.name} details`}>
          <div className="map-hostel-card-image">
            <img src={selectedHostel.photos[0]} alt={selectedHostel.name} />
            {selectedHostel.verified && (
              <span className="map-hostel-card-badge">✓ Verified</span>
            )}
          </div>
          <div className="map-hostel-card-body">
            <div className="map-hostel-card-header">
              <div>
                <h3 className="map-hostel-card-title">{selectedHostel.name}</h3>
                <p className="map-hostel-card-location">{selectedHostel.location}</p>
              </div>
              <button
                type="button"
                className="map-hostel-card-close"
                onClick={() => setSelectedHostelId(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="map-hostel-card-price">
              From <strong>GH₵{Math.min(...selectedHostel.roomOptions.map((r) => r.pricePerYear)).toLocaleString()}/year</strong>
            </p>

            <div className="map-hostel-card-meta">
              <span className="map-hostel-card-freshness">
                {getFreshnessLabel(selectedHostel.checkedAt)}
              </span>
              <span className={cn(
                'map-hostel-card-availability',
                selectedHostelRooms.reduce((sum, r) => sum + r.availableUnits, 0) > 0
                  ? 'map-hostel-card-availability--available'
                  : 'map-hostel-card-availability--full'
              )}>
                {selectedHostelRooms.reduce((sum, r) => sum + r.availableUnits, 0)} rooms available
              </span>
            </div>

            <div className="map-hostel-card-facilities">
              {selectedHostel.facilities.slice(0, 6).map((f) => (
                <span key={f} className="map-hostel-card-facility">{f}</span>
              ))}
            </div>

            <div className="map-hostel-card-room-types">
              {selectedHostel.roomOptions.map((room) => {
                const status = getAvailabilityStatus(room.availableUnits, room.totalUnits);
                return (
                  <div
                    key={room.id}
                    className={cn(
                      'map-room-type-chip',
                      status === 'full' && 'map-room-type-full'
                    )}
                  >
                    <span className="map-room-type-name">{room.name}</span>
                    <span className="map-room-type-price">GH₵{room.pricePerYear.toLocaleString()}</span>
                    <span className={cn(
                      'map-room-type-status',
                      status === 'available' && 'map-room-type-status--available',
                      status === 'limited' && 'map-room-type-status--limited',
                      status === 'full' && 'map-room-type-status--full'
                    )}>
                      {status === 'full' ? 'Full' : status === 'limited' ? `${room.availableUnits} left` : 'Available'}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              to={`/findroom/rooms?hostel=${selectedHostel.id}`}
              className="map-hostel-card-cta"
              onClick={() => setSelectedHostelId(null)}
            >
              View hostel →
            </Link>
          </div>
        </div>
      )}

      {/* List view overlay */}
      {viewMode === 'list' && (
        <div className="map-list-view">
          <div className="map-list-header">
            <div>
              <h2 className="map-list-title">Available rooms</h2>
              <p className="map-list-count">
                {hostelGroups.length} {hostelGroups.length === 1 ? 'hostel' : 'hostels'} · {totalRooms} room options
              </p>
            </div>
            <button
              type="button"
              className="map-list-close"
              onClick={() => setViewMode('map')}
              aria-label="Close list view"
            >
              ×
            </button>
          </div>
          <div className="map-list-grid">
            {hostelGroups.map((hostelRooms) => {
              const hostel = hostels.find((h) => h.id === hostelRooms[0].hostelId);
              if (!hostel) return null;
              const cheapestRoom = Math.min(...hostelRooms.map((r) => r.pricePerYear));
              const totalAvailable = hostelRooms.reduce((sum, r) => sum + r.availableUnits, 0);

              return (
                <Link
                  key={hostel.id}
                  to={`/findroom/rooms?hostel=${hostel.id}`}
                  className="map-list-card"
                >
                  <div className="map-list-card-image">
                    <img src={hostel.photos[0]} alt={hostel.name} />
                    {hostel.verified && <span className="map-list-card-badge">Verified</span>}
                  </div>
                  <div className="map-list-card-body">
                    <h3 className="map-list-card-title">{hostel.name}</h3>
                    <p className="map-list-card-location">{hostel.location}</p>
                    <p className="map-list-card-price">From GH₵{cheapestRoom.toLocaleString()}/year</p>
                    <div className="map-list-card-meta">
                      <span>{hostelRooms.length} room options</span>
                      <span
                        className={cn(
                          'map-list-card-availability',
                          totalAvailable > 0 ? 'map-list-card-availability--available' : 'map-list-card-availability--full'
                        )}
                      >
                        {totalAvailable > 0 ? `${totalAvailable} available` : 'Full'}
                      </span>
                    </div>
                    <p className="map-list-card-freshness">{getFreshnessLabel(hostel.checkedAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
