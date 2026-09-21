import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { fetchHostels } from '../../services/hostelService';
import type { Hostel, RoomOption } from '../../types';
import { FACILITY_EMOJIS } from '../../lib/constants';
import { formatPricePeriod } from '../../lib/utils';
import { STU } from '../../data/geo';
import './MapPage.css';

const DEFAULT_CENTER: [number, number] = [7.34, -2.33];

type FilterType = 'all' | 'available' | 'limited' | 'full';

type AreaSummary = {
  location: string;
  count: number;
  lowestPrice: number;
  lowestPricingPeriod?: RoomOption['pricingPeriod'];
  pricingPeriods: Set<string>;
  status: string;
};

const formatPrice = (price: number, pricingPeriod?: RoomOption['pricingPeriod']) => `GH₵${price.toLocaleString('en-GH')}/${formatPricePeriod(pricingPeriod)}`;

function getStatusColor(status?: string) {
  if (status === 'Limited') return '#d39b2a';
  if (status === 'Full') return '#7f8791';
  return '#15694b';
}

function getStatusClass(status?: string) {
  if (status === 'Limited') return 'limited';
  if (status === 'Full') return 'full';
  return 'available';
}

function buildClusterPin(count: number, color: string) {
  return L.divIcon({
    className: 'map-cluster-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: ${color};
        color: #fff;
        font-weight: 800;
        font-size: 0.72rem;
        box-shadow: 0 8px 18px rgba(10, 20, 15, 0.2);
        border: 3px solid rgba(255,255,255,0.9);
      ">${count}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -14],
  });
}

function groupNearbyHostels(hostels: Hostel[]) {
  const groups: Hostel[][] = [];
  const used = new Set<number>();

  const distanceKm = (a: Hostel, b: Hostel) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad((b.latitude ?? 0) - (a.latitude ?? 0));
    const dLng = toRad((b.longitude ?? 0) - (a.longitude ?? 0));
    const lat1 = toRad(a.latitude ?? 0);
    const lat2 = toRad(b.latitude ?? 0);
    const earthRadiusKm = 6371;
    const haversine =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return earthRadiusKm * c;
  };

  hostels.forEach((hostel, index) => {
    if (used.has(index)) return;
    const cluster: Hostel[] = [hostel];
    used.add(index);

    hostels.forEach((candidate, candidateIndex) => {
      if (used.has(candidateIndex) || candidate.id === hostel.id) return;
      if (distanceKm(hostel, candidate) <= 0.35) {
        cluster.push(candidate);
        used.add(candidateIndex);
      }
    });

    groups.push(cluster);
  });

  return groups;
}

export default function MapPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<FilterType>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const areaMarkersRef = useRef<L.CircleMarker[]>([]);

  const mappedHostels = hostels.filter((h) => h.latitude != null && h.longitude != null);

  const locationOptions = useMemo(
    () => Array.from(new Set(hostels.map((hostel) => hostel.location).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [hostels],
  );

  const clearSelection = useCallback(() => {
    setSelectedHostel(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchHostels()
      .then((data) => {
        if (cancelled) return;
        setHostels(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load hostels.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const hasExisting = mapInstanceRef.current;
    if (hasExisting) {
      hasExisting.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      areaMarkersRef.current = [];
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(DEFAULT_CENTER, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.circleMarker([STU.lat, STU.lng], {
      radius: 10,
      color: '#15694b',
      weight: 4,
      fillColor: '#ffffff',
      fillOpacity: 1,
    }).addTo(map).bindTooltip('STU Campus', { permanent: true, direction: 'top', offset: [0, -10] });

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      areaMarkersRef.current = [];
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    areaMarkersRef.current.forEach((marker) => marker.remove());
    areaMarkersRef.current = [];

    const filtered = mappedHostels.filter((hostel) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = hostel.name.toLowerCase().includes(q) || hostel.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedLocation && hostel.location !== selectedLocation) return false;
      if (availabilityFilter !== 'all') {
        const roomStatus = hostel.roomOptions[0]?.availabilityStatus;
        if (availabilityFilter === 'available' && roomStatus !== 'Available') return false;
        if (availabilityFilter === 'limited' && roomStatus !== 'Limited') return false;
        if (availabilityFilter === 'full' && roomStatus !== 'Full') return false;
      }
      return true;
    });

    const map = mapInstanceRef.current;
    const bounds: L.LatLngExpression[] = [[STU.lat, STU.lng]];

    const clusterGroups = groupNearbyHostels(filtered);

    clusterGroups.forEach((group) => {
      const centroid = group.reduce(
        (acc, hostel) => {
          acc.lat += hostel.latitude ?? 0;
          acc.lng += hostel.longitude ?? 0;
          return acc;
        },
        { lat: 0, lng: 0 },
      );

      const groupLat = centroid.lat / group.length;
      const groupLng = centroid.lng / group.length;
      bounds.push([groupLat, groupLng]);

      const groupedStatus = group.some((hostel) => hostel.roomOptions[0]?.availabilityStatus === 'Full')
        ? 'Full'
        : group.some((hostel) => hostel.roomOptions[0]?.availabilityStatus === 'Limited')
          ? 'Limited'
          : 'Available';

      const clusterMarker = L.marker([groupLat, groupLng], {
        icon: buildClusterPin(group.length, getStatusColor(groupedStatus)),
      }).addTo(map);

      const clusterItems = group
        .map((hostel) => {
          const cheapestRoom = hostel.roomOptions.reduce<RoomOption | undefined>((best, room) => {
            if (!best || room.pricePerYear < best.pricePerYear) return room;
            return best;
          }, undefined);
          const status = hostel.roomOptions[0]?.availabilityStatus ?? 'Available';
          return `
            <div class="map-cluster-item">
              <div>
                <strong>${hostel.name}</strong>
                <span>${hostel.location}</span>
              </div>
              <div class="map-cluster-meta">
                <span class="map-popup-status map-popup-status-${getStatusClass(status)}">${status}</span>
                <span>${cheapestRoom ? formatPrice(cheapestRoom.pricePerYear, cheapestRoom.pricingPeriod) : 'Price on request'}</span>
              </div>
            </div>
          `;
        })
        .join('');

      const clusterHostel = group[0];
      const popupContent = `
        <div class="map-popup-card">
          <div class="map-popup-header">
            <strong>${group.length} hostels in this area</strong>
          </div>
          <span class="map-popup-meta">${clusterHostel.location}</span>
          <div class="map-cluster-list">${clusterItems}</div>
          <button type="button" class="map-popup-button" data-cluster-hostel-id="${clusterHostel.id}">View closest match</button>
        </div>
      `;

      clusterMarker.bindPopup(popupContent, { maxWidth: 300, closeButton: true });
      clusterMarker.on('click', () => setSelectedHostel(clusterHostel));
      clusterMarker.on('popupopen', () => {
        const button = mapRef.current?.querySelector(`button[data-cluster-hostel-id="${clusterHostel.id}"]`);
        button?.addEventListener('click', () => {
          clusterMarker.closePopup();
          setSelectedHostel(clusterHostel);
        });
      });
      markersRef.current.push(clusterMarker);
    });

    if (filtered.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [60, 60], maxZoom: 16 });
    } else if (mappedHostels.length === 0) {
      map.setView(DEFAULT_CENTER, 13);
    }
  }, [mapReady, mappedHostels, searchQuery, selectedLocation, availabilityFilter, selectedHostel]);

  const filteredHostels = mappedHostels.filter((hostel) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = hostel.name.toLowerCase().includes(q) || hostel.location.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (selectedLocation && hostel.location !== selectedLocation) return false;
    if (availabilityFilter !== 'all') {
      const roomStatus = hostel.roomOptions[0]?.availabilityStatus;
      if (availabilityFilter === 'available' && roomStatus !== 'Available') return false;
      if (availabilityFilter === 'limited' && roomStatus !== 'Limited') return false;
      if (availabilityFilter === 'full' && roomStatus !== 'Full') return false;
    }
    return true;
  });

  const activeClusterHostels = useMemo(() => {
    if (!selectedHostel) return [] as Hostel[];
    const cluster = groupNearbyHostels(filteredHostels).find((group) => group.some((hostel) => hostel.id === selectedHostel.id));
    return cluster ?? [selectedHostel];
  }, [filteredHostels, selectedHostel]);

  const activeClusterIndex = activeClusterHostels.findIndex((hostel) => hostel.id === selectedHostel?.id);

  const goToClusterHostel = useCallback((direction: 'prev' | 'next') => {
    if (!selectedHostel || activeClusterHostels.length <= 1) return;

    const nextIndex = direction === 'next'
      ? (activeClusterIndex + 1) % activeClusterHostels.length
      : (activeClusterIndex - 1 + activeClusterHostels.length) % activeClusterHostels.length;

    setSelectedHostel(activeClusterHostels[nextIndex]);
  }, [activeClusterHostels, activeClusterIndex, selectedHostel]);

  const areaSummaries: AreaSummary[] = Array.from(
    filteredHostels.reduce((map, hostel) => {
      const existing = map.get(hostel.location) ?? {
        location: hostel.location,
        count: 0,
        lowestPrice: Number.POSITIVE_INFINITY,
        pricingPeriods: new Set<string>(),
        status: 'Available',
      };
      const cheapest = hostel.roomOptions.reduce<RoomOption | undefined>((best, room) => {
        if (!best || room.pricePerYear < best.pricePerYear) return room;
        return best;
      }, undefined);

      existing.count += 1;
      if (cheapest) {
        existing.pricingPeriods.add(cheapest.pricingPeriod ?? 'AcademicYear');
        if (cheapest.pricePerYear < existing.lowestPrice) {
          existing.lowestPrice = cheapest.pricePerYear;
          existing.lowestPricingPeriod = cheapest.pricingPeriod;
        }
      }
      if (hostel.roomOptions[0]?.availabilityStatus === 'Limited' && existing.status === 'Available') existing.status = 'Limited';
      if (hostel.roomOptions[0]?.availabilityStatus === 'Full') existing.status = 'Full';
      map.set(hostel.location, existing);
      return map;
    }, new Map<string, AreaSummary>()).values(),
  ).sort((a, b) => b.count - a.count);

  const selectedRoom = selectedHostel?.roomOptions[0];
  const activeFilterCount = [searchQuery, selectedLocation, availabilityFilter !== 'all' ? availabilityFilter : ''].filter(Boolean).length;

  return (
    <FindRoomShell>
      <div className="map-page dabi-map-page">
        <div className="map-container" ref={mapRef} aria-label="Map showing all hostels near campus" />

        <div className="map-floating-controls">
          <div className="map-search-bar">
            <span className="map-search-icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              className="map-search-input"
              placeholder="Search hostels or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search hostels or locations"
            />
            {searchQuery && (
              <button type="button" className="map-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>
            )}
          </div>

          <button type="button" className="map-mobile-filter-toggle" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="map-filter-drawer">
            <span aria-hidden="true">☷</span>
            Filters{activeFilterCount > 0 ? ` · ${activeFilterCount} active` : ''}
          </button>

          <div className="map-filters map-filters-inline">
            <select
              className="map-filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              aria-label="Filter by location"
            >
              <option value="">All locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <select
              className="map-filter-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as FilterType)}
              aria-label="Filter by availability"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>

            {(searchQuery || selectedLocation || availabilityFilter !== 'all') && (
              <button type="button" className="map-filter-clear" onClick={() => { setSearchQuery(''); setSelectedLocation(''); setAvailabilityFilter('all'); }}>
                Clear filters
              </button>
            )}
          </div>

          {areaSummaries.length > 0 && (
            <div className="map-area-summary" aria-label="Area overview">
              {areaSummaries.slice(0, 4).map((area) => (
                <button
                  key={area.location}
                  type="button"
                  className="map-area-chip"
                  onClick={() => setSelectedLocation(area.location)}
                  aria-label={`Focus on ${area.location}`}
                >
                  <span>{area.location}</span>
                  <strong>{area.count}</strong>
                  {Number.isFinite(area.lowestPrice) && (
                    <small>From {formatPrice(area.lowestPrice, area.lowestPricingPeriod)}</small>
                  )}
                  {area.pricingPeriods.size > 1 && <em>Mixed billing periods</em>}
                </button>
              ))}
            </div>
          )}

          <div className="map-legend map-legend-inline">
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#15694b' }} /> Available</span>
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#d39b2a' }} /> Limited</span>
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#7f8791' }} /> Full</span>
            <span className="map-legend-item"><span className="map-legend-dot map-legend-stu" /> STU</span>
          </div>

        </div>

        {filtersOpen && <button type="button" className="map-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close map filters" />}
        <div id="map-filter-drawer" className={`map-filter-drawer ${filtersOpen ? 'map-filter-drawer-open' : ''}`}>
          <div className="map-filter-drawer-header">
            <div>
              <span className="map-filter-drawer-kicker">Map controls</span>
              <h2>Filter hostels</h2>
            </div>
            <button type="button" className="map-filter-drawer-close" onClick={() => setFiltersOpen(false)} aria-label="Close map filters">×</button>
          </div>
          <div className="map-filters">
            <select
              className="map-filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              aria-label="Filter by location"
            >
              <option value="">All locations</option>
              {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select
              className="map-filter-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as FilterType)}
              aria-label="Filter by availability"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>
            {(searchQuery || selectedLocation || availabilityFilter !== 'all') && (
              <button type="button" className="map-filter-clear" onClick={() => { setSearchQuery(''); setSelectedLocation(''); setAvailabilityFilter('all'); }}>
                Clear filters
              </button>
            )}
          </div>
          <div className="map-legend">
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#15694b' }} /> Available</span>
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#d39b2a' }} /> Limited</span>
            <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#7f8791' }} /> Full</span>
            <span className="map-legend-item"><span className="map-legend-dot map-legend-stu" /> STU</span>
          </div>
          <button type="button" className="map-filter-drawer-done" onClick={() => setFiltersOpen(false)}>Show results</button>
        </div>

        {loading && (
          <div className="map-loading-overlay">
            <div className="map-loading-card">
              <p>Loading map...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="map-error-overlay">
            <div className="map-error-card">
              <p>{error}</p>
              <button type="button" className="map-error-retry" onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && mappedHostels.length === 0 && (
          <div className="map-empty-overlay">
            <div className="map-empty-card">
              <h3>No hostels on the map yet</h3>
              <p>Hostels with location data will appear here once they're added.</p>
              <Link to="/findroom/explore" className="map-empty-link">Browse hostels</Link>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="map-count-badge" aria-live="polite">
            {filteredHostels.length} hostel{filteredHostels.length !== 1 ? 's' : ''} on map
          </div>
        )}

        {selectedHostel && (
          <aside className="map-side-panel" aria-label="Hostel details">
            <div className="map-side-panel-header">
              <div>
                <div className="map-side-panel-kicker">Hostel match</div>
                <h3 className="map-side-panel-title">{selectedHostel.name}</h3>
              </div>
              <button type="button" className="map-side-panel-close" onClick={clearSelection} aria-label="Close panel">×</button>
            </div>

            {activeClusterHostels.length > 1 && (
              <div className="map-side-panel-cluster-nav" aria-label="Nearby hostel navigation">
                <button type="button" className="map-side-panel-nav-button" onClick={() => goToClusterHostel('prev')} aria-label="Previous hostel">←</button>
                <span>{activeClusterIndex + 1} / {activeClusterHostels.length}</span>
                <button type="button" className="map-side-panel-nav-button" onClick={() => goToClusterHostel('next')} aria-label="Next hostel">→</button>
              </div>
            )}

            <div className="map-side-panel-body">
              <div className="map-side-panel-photos">
                {selectedHostel.photos[0] ? (
                  <img src={selectedHostel.photos[0]} alt={selectedHostel.name} />
                ) : (
                  <div className="map-side-panel-photo-placeholder">
                    <span aria-hidden="true">🏠</span>
                  </div>
                )}
              </div>

              <div className="map-side-panel-meta">
                <span className="map-side-panel-location">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
                  {selectedHostel.location}
                </span>
                {selectedHostel.landmark && <span className="map-side-panel-landmark">{selectedHostel.landmark}</span>}
                {selectedRoom && (
                  <span className="map-side-panel-price">{formatPrice(selectedRoom.pricePerYear, selectedRoom.pricingPeriod)}</span>
                )}
                <div className="map-side-panel-status-row">
                  <span className={`map-side-panel-status map-side-panel-status-${(selectedRoom?.availabilityStatus ?? 'Available').toLowerCase()}`}>
                    {selectedRoom?.availabilityStatus ?? 'Available'}
                  </span>
                  <span className="map-side-panel-distance">{selectedHostel.distanceKm ? `${selectedHostel.distanceKm.toFixed(1)} km away` : 'Near STU'}</span>
                </div>
              </div>

              {selectedHostel.facilities.length > 0 && (
                <div className="map-side-panel-facilities">
                  {selectedHostel.facilities.slice(0, 6).map((facility) => (
                    <span key={facility} className="map-side-panel-facility">
                      {FACILITY_EMOJIS[facility] ? `${FACILITY_EMOJIS[facility]} ` : ''}{facility}
                    </span>
                  ))}
                </div>
              )}

              {selectedHostel.note && (
                <p className="map-side-panel-note">{selectedHostel.note}</p>
              )}

              {selectedHostel.roomOptions.length > 1 && (
                <div className="map-side-panel-room-list">
                  {selectedHostel.roomOptions.slice(0, 4).map((room) => (
                    <Link key={room.id} to={`/findroom/rooms/${room.id}`} className="map-side-panel-room-item" data-discover="true">
                      <div>
                        <span className="map-side-panel-room-name">{room.name}</span>
                        <small>{room.availableUnits} of {room.totalUnits} available</small>
                      </div>
                      <strong>{formatPrice(room.pricePerYear, room.pricingPeriod)}</strong>
                    </Link>
                  ))}
                </div>
              )}

              <div className="map-side-panel-actions">
                <Link to={`/findroom/rooms/${selectedHostel.roomOptions[0]?.id ?? selectedHostel.id}`} className="map-side-panel-link">
                  View room details
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>
    </FindRoomShell>
  );
}
