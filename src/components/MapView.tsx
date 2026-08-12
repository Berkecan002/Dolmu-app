import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ActiveDriver, TransitRoute } from '../types';
import { Maximize2 } from 'lucide-react';

interface MapViewProps {
  selectedRoute?: TransitRoute | null;
  allRoutes?: TransitRoute[];
  activeDrivers: ActiveDriver[];
  focusedDriverId?: string | null;
  onSelectDriver?: (driver: ActiveDriver) => void;
  height?: string;
  isDriverScreen?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  selectedRoute,
  allRoutes = [],
  activeDrivers,
  focusedDriverId,
  onSelectDriver,
  height = '100%',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineGroupRef = useRef<L.LayerGroup | null>(null);
  const stopsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const driverMarkersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Kırıkkale default center coordinates
      const defaultCenter: [number, number] = [39.8453, 33.5153];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Voyager Tile Layer for crisp modern light transit map look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add custom zoom controls to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initialize layer groups
      routePolylineGroupRef.current = L.layerGroup().addTo(map);
      stopsLayerGroupRef.current = L.layerGroup().addTo(map);
      driverMarkersGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map initialized
    };
  }, []);

  // Update Route Polylines and Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routePolylineGroupRef.current || !stopsLayerGroupRef.current) return;

    routePolylineGroupRef.current.clearLayers();
    stopsLayerGroupRef.current.clearLayers();

    const routesToDraw = selectedRoute ? [selectedRoute] : allRoutes;

    if (routesToDraw.length === 0) return;

    const bounds = L.latLngBounds([]);

    routesToDraw.forEach((route) => {
      if (!route.polyline_coordinates || route.polyline_coordinates.length === 0) return;

      const latLngs = route.polyline_coordinates.map((coord) => L.latLng(coord[0], coord[1]));
      latLngs.forEach((ll) => bounds.extend(ll));

      // White outer halo for crisp light map contrast
      const haloPoly = L.polyline(latLngs, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Main polyline path
      const routePoly = L.polyline(latLngs, {
        color: route.color || '#E11D48',
        weight: selectedRoute ? 5 : 3.5,
        opacity: selectedRoute ? 0.95 : 0.7,
        lineCap: 'round',
        lineJoin: 'round',
      });

      routePolylineGroupRef.current?.addLayer(haloPoly);
      routePolylineGroupRef.current?.addLayer(routePoly);

      // Draw Stops if selected route
      if (selectedRoute && route.id === selectedRoute.id) {
        route.stops.forEach((stop) => {
          const stopMarkerHtml = `
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-[${route.color}] text-[11px] font-extrabold text-slate-900 shadow-sm transform -translate-x-1/2 -translate-y-1/2">
              ${stop.order}
            </div>
          `;

          const customStopIcon = L.divIcon({
            html: stopMarkerHtml,
            className: 'custom-stop-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const stopMarker = L.marker([stop.lat, stop.lng], { icon: customStopIcon });
          
          stopMarker.bindTooltip(
            `<div class="font-sans font-bold text-xs text-slate-900 px-1 py-0.5">${stop.order}. ${stop.name}</div>`,
            { permanent: false, direction: 'top', offset: [0, -10] }
          );

          stopsLayerGroupRef.current?.addLayer(stopMarker);
        });
      }
    });

    // Auto fit map bounds to route if selected
    if (selectedRoute && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [selectedRoute, allRoutes]);

  // Update Active Drivers Live Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !driverMarkersGroupRef.current) return;

    driverMarkersGroupRef.current.clearLayers();

    const relevantDrivers = selectedRoute
      ? activeDrivers.filter((d) => d.route_id === selectedRoute.id && d.is_active)
      : activeDrivers.filter((d) => d.is_active);

    relevantDrivers.forEach((driver) => {
      if (!driver.current_latitude || !driver.current_longitude) return;

      const headingDeg = driver.heading || 0;
      const isFocused = focusedDriverId === driver.driver_id;

      const busMarkerHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${isFocused ? `<div class="absolute -inset-2 bg-rose-500/20 rounded-full animate-ping"></div>` : ''}
          
          <!-- Badge Header -->
          <div class="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-900 font-extrabold text-[11px] shadow-sm flex items-center gap-1 whitespace-nowrap mb-0.5 z-10">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${driver.route_number}</span>
            <span class="text-[9px] text-slate-500 font-mono font-bold">${driver.speed || 0} km/h</span>
          </div>

          <!-- Rotating Bus Marker -->
          <div class="w-9 h-9 rounded-xl bg-white border-2 border-rose-600 shadow-md flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
            <div class="text-rose-600 transform" style="transform: rotate(${headingDeg}deg);">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: busMarkerHtml,
        className: 'custom-bus-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
      });

      const marker = L.marker([driver.current_latitude, driver.current_longitude], {
        icon: customIcon,
        zIndexOffset: isFocused ? 1000 : 100,
      });

      const delayBadge = driver.delay_minutes && driver.delay_minutes > 0
        ? `<span class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">+${driver.delay_minutes} dk Rötarlı</span>`
        : `<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">Zamanında</span>`;

      const popupContent = `
        <div class="p-3 font-sans min-w-[220px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
            <div>
              <span class="font-extrabold text-base text-slate-900">${driver.route_number} Dolmuşu</span>
              <p class="text-xs font-semibold text-slate-500">Plaka: ${driver.bus_plate}</p>
            </div>
            ${delayBadge}
          </div>

          <div class="space-y-1.5 text-xs text-slate-700">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Şoför:</span>
              <span class="font-bold text-slate-900">${driver.driver_name}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Anlık Hız:</span>
              <span class="font-bold text-slate-900">${driver.speed} km/s</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Sonraki Durak:</span>
              <span class="font-bold text-rose-600">${driver.next_stop_name || 'Yaklaşıyor...'}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Doluluk:</span>
              <span class="font-semibold capitalize text-slate-900">${driver.occupancy || 'Orta'}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectDriver) onSelectDriver(driver);
      });

      driverMarkersGroupRef.current?.addLayer(marker);

      if (isFocused) {
        map.panTo([driver.current_latitude, driver.current_longitude], { animate: true, duration: 0.8 });
      }
    });
  }, [activeDrivers, selectedRoute, focusedDriverId, onSelectDriver]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRoute) return;
    const coords = selectedRoute.polyline_coordinates;
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100" style={{ height }}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {selectedRoute && (
          <button
            id="map-btn-fit-bounds"
            onClick={handleFitBounds}
            className="p-2.5 rounded-xl bg-white/95 text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-xs backdrop-blur-md transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Güzergaha Odaklan"
          >
            <Maximize2 className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Güzergaha Odaklan</span>
          </button>
        )}
      </div>

      {/* Map Route Title Overlay Badge */}
      {selectedRoute && (
        <div className="absolute top-4 left-4 z-20 bg-white/95 border border-slate-200 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-lg font-black text-xs text-white shadow-xs"
            style={{ backgroundColor: selectedRoute.color }}
          >
            {selectedRoute.route_number}
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{selectedRoute.route_name}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{selectedRoute.stops.length} Durak • {selectedRoute.totalDistanceKm} km</p>
          </div>
        </div>
      )}
    </div>
  );
};
