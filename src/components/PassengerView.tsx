import React, { useState, useMemo } from 'react';
import { Search, Bus, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { ActiveDriver, TransitRoute } from '../types';
import { MapView } from './MapView';

interface PassengerViewProps {
  routes: TransitRoute[];
  activeDrivers: ActiveDriver[];
  selectedCity: string;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  routes,
  activeDrivers,
  selectedCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id || 'route_kk_1');
  const [scheduleDayType, setScheduleDayType] = useState<'hafta_ici' | 'cumartesi' | 'pazar'>('hafta_ici');
  const [activeBottomTab, setActiveBottomTab] = useState<'schedules' | 'stops' | 'live_buses'>('schedules');
  const [focusedDriverId, setFocusedDriverId] = useState<string | null>(null);

  // Filter routes based on city & search query
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesCity = selectedCity === 'Tümü' || route.city === selectedCity;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        route.route_number.toLowerCase().includes(query) ||
        route.route_name.toLowerCase().includes(query) ||
        route.stops.some((s) => s.name.toLowerCase().includes(query));
      return matchesCity && matchesQuery;
    });
  }, [routes, selectedCity, searchQuery]);

  // Selected route object
  const selectedRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0] || null;
  }, [routes, selectedRouteId]);

  // Active drivers on selected route
  const routeActiveDrivers = useMemo(() => {
    if (!selectedRoute) return [];
    return activeDrivers.filter((d) => d.route_id === selectedRoute.id && d.is_active);
  }, [activeDrivers, selectedRoute]);

  // Calculate next departure time
  const nextDepartureInfo = useMemo(() => {
    if (!selectedRoute) return null;
    const currentScheduleGroup = selectedRoute.schedules.find((s) => s.dayType === scheduleDayType);
    if (!currentScheduleGroup || currentScheduleGroup.times.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const timeStr of currentScheduleGroup.times) {
      const [h, m] = timeStr.split(':').map(Number);
      const scheduleMinutes = h * 60 + m;
      if (scheduleMinutes >= currentMinutes) {
        const diffMin = scheduleMinutes - currentMinutes;
        return { timeStr, diffMin };
      }
    }

    // Default to first departure tomorrow if past all
    return { timeStr: currentScheduleGroup.times[0], diffMin: null };
  }, [selectedRoute, scheduleDayType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Search Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                Yolcu Portalı
              </span>
              <span className="text-xs text-slate-500 font-medium">Canlı Takip</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
              Hangi Dolmuş Hattını Arıyorsunuz?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Hat kodu veya durak adı yazarak Kırıkkale dolmuşlarının canlı konumlarını ve kalkış saatlerini görün.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="passenger-route-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dolmuş Hattı Ara (ör: D-1, Kampüs, Zafer Cad.)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Route Pills Horizontal Selector */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredRoutes.map((route) => {
            const activeCount = activeDrivers.filter((d) => d.route_id === route.id && d.is_active).length;
            const isSelected = selectedRouteId === route.id;

            return (
              <button
                key={route.id}
                id={`route-pill-${route.id}`}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  setFocusedDriverId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-200/60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                <span>{route.route_number}</span>
                <span className="text-[11px] opacity-90 hidden sm:inline">{route.route_name}</span>
                {activeCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full font-black text-[10px] ${
                    isSelected ? 'bg-white text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeCount} Canlı
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Screen Area: Top Map + Bottom Schedules/Stops */}
      {selectedRoute ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top/Main Map Area */}
          <div className="lg:col-span-12 space-y-4">
            
            {/* Map Component Header Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="px-3 py-1.5 rounded-xl text-white font-extrabold text-base shadow-xs"
                  style={{ backgroundColor: selectedRoute.color }}
                >
                  {selectedRoute.route_number}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-outfit">
                    {selectedRoute.route_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                    <span>{selectedRoute.city}</span>
                    <span>•</span>
                    <span>{selectedRoute.stops.length} Durak</span>
                    <span>•</span>
                    <span>Ücret: {selectedRoute.fare.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>

              {/* Active Drivers Live Status Badge */}
              <div className="flex items-center gap-3">
                {routeActiveDrivers.length > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{routeActiveDrivers.length} Dolmuş Haritada Canlı Hareket Ediyor</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Şu Anda Yayında Dolmuş Yok</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <MapView
              selectedRoute={selectedRoute}
              activeDrivers={activeDrivers}
              focusedDriverId={focusedDriverId}
              onSelectDriver={(driver) => setFocusedDriverId(driver.driver_id)}
              height="440px"
            />
          </div>

          {/* Bottom Split Section: Schedules, Stops Timeline & Live Drivers Roster */}
          <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            
            {/* Bottom Nav Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  id="tab-btn-schedules"
                  onClick={() => setActiveBottomTab('schedules')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeBottomTab === 'schedules'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Kalkış Saatleri</span>
                </button>

                <button
                  id="tab-btn-stops"
                  onClick={() => setActiveBottomTab('stops')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeBottomTab === 'stops'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Durak Listesi ({selectedRoute.stops.length})</span>
                </button>

                <button
                  id="tab-btn-live-buses"
                  onClick={() => setActiveBottomTab('live_buses')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeBottomTab === 'live_buses'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  <span>Hat Dolmuşları ({routeActiveDrivers.length})</span>
                </button>
              </div>

              {/* Day Filter Selector for Schedules */}
              {activeBottomTab === 'schedules' && (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                  <button
                    id="day-btn-hafta-ici"
                    onClick={() => setScheduleDayType('hafta_ici')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      scheduleDayType === 'hafta_ici' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hafta İçi
                  </button>
                  <button
                    id="day-btn-cumartesi"
                    onClick={() => setScheduleDayType('cumartesi')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      scheduleDayType === 'cumartesi' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cumartesi
                  </button>
                  <button
                    id="day-btn-pazar"
                    onClick={() => setScheduleDayType('pazar')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      scheduleDayType === 'pazar' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pazar / Tatil
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: Schedules (Kalkış Saatleri) */}
            {activeBottomTab === 'schedules' && (
              <div className="space-y-4">
                
                {/* Next Upcoming Departure Banner */}
                {nextDepartureInfo && (
                  <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-600 text-white font-bold shadow-xs">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-rose-800 font-bold uppercase tracking-wider">Bir Sonraki Sefer Saatı</span>
                        <h4 className="text-xl font-black text-rose-950 font-outfit">
                          {nextDepartureInfo.timeStr}
                        </h4>
                      </div>
                    </div>
                    {nextDepartureInfo.diffMin !== null && (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 text-xs font-extrabold">
                        {nextDepartureInfo.diffMin === 0 ? 'Şimdi Kalkıyor!' : `${nextDepartureInfo.diffMin} dakika sonra kalkıyor`}
                      </div>
                    )}
                  </div>
                )}

                {/* Departure Times Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Tüm Kalkış Saatleri
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {selectedRoute.schedules
                      .find((s) => s.dayType === scheduleDayType)
                      ?.times.map((time) => {
                        const isNext = nextDepartureInfo?.timeStr === time;
                        return (
                          <div
                            key={time}
                            className={`px-3 py-2 rounded-xl text-center font-mono text-xs font-bold border transition-all ${
                              isNext
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs scale-105'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {time}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Stops Timeline */}
            {activeBottomTab === 'stops' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hat Güzergah Durakları ve Yaklaşık Süreler
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedRoute.stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: selectedRoute.color }}
                        >
                          {stop.order}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900">{stop.name}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Başlangıçtan +{stop.estimatedMinutesFromStart} dk
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Live Active Drivers */}
            {activeBottomTab === 'live_buses' && (
              <div>
                {routeActiveDrivers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routeActiveDrivers.map((driver) => (
                      <div
                        key={driver.driver_id}
                        onClick={() => setFocusedDriverId(driver.driver_id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          focusedDriverId === driver.driver_id
                            ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                            <Bus className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-900">{driver.driver_name}</h5>
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] text-slate-800 font-mono font-bold">
                                {driver.bus_plate}
                              </span>
                            </div>
                            <p className="text-xs text-rose-700 font-semibold mt-0.5">
                              Sonraki Durak: {driver.next_stop_name || 'Yolda...'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 font-mono">{driver.speed} km/s</span>
                          <p className="text-[10px] text-slate-500 font-medium">Anlık GPS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm font-medium">
                    Bu hatta şu anda yayında aktif otobüs bulunmuyor.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 font-medium">
          Aramanızla eşleşen hat bulunamadı.
        </div>
      )}

    </div>
  );
};
