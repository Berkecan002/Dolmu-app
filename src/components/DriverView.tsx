import React, { useState, useEffect } from 'react';
import { Bus, Power, Gauge, MapPin, Radio, Users, ShieldCheck, LogOut } from 'lucide-react';
import { ActiveDriver, LiveLocationUpdatePayload, TransitRoute, User } from '../types';
import { INITIAL_USERS } from '../data/initialRoutes';
import { MapView } from './MapView';

interface DriverViewProps {
  routes: TransitRoute[];
  activeDrivers: ActiveDriver[];
  onUpdateLocation: (payload: LiveLocationUpdatePayload) => Promise<ActiveDriver | null>;
  onToggleActive: (driverId: string, isActive: boolean, isSimulated?: boolean) => Promise<ActiveDriver | null>;
}

export const DriverView: React.FC<DriverViewProps> = ({
  routes,
  activeDrivers,
  onUpdateLocation,
  onToggleActive,
}) => {
  // Login State
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [emailInput, setEmailInput] = useState('osman@dolmus.com');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Duty / Task State
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    currentUser?.assignedRouteId || routes[0]?.id || 'route_kk_1'
  );
  const [isActiveDuty, setIsActiveDuty] = useState<boolean>(false);
  const [useDeviceGps, setUseDeviceGps] = useState<boolean>(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(45);
  const [occupancy, setOccupancy] = useState<'low' | 'medium' | 'high' | 'full'>('medium');
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string | null>(null);
  const [dutyDurationSec, setDutyDurationSec] = useState<number>(0);

  // Coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 39.8453,
    lng: 33.5153,
  });

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Duty timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActiveDuty) {
      timer = setInterval(() => {
        setDutyDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      setDutyDurationSec(0);
    }
    return () => clearInterval(timer);
  }, [isActiveDuty]);

  // Sync with current active driver status in server
  useEffect(() => {
    if (currentUser) {
      const activeState = activeDrivers.find((d) => d.driver_id === currentUser.id);
      if (activeState) {
        setIsActiveDuty(activeState.is_active);
        if (activeState.current_latitude && activeState.current_longitude) {
          setCurrentCoords({ lat: activeState.current_latitude, lng: activeState.current_longitude });
        }
      }
    }
  }, [activeDrivers, currentUser]);

  // Real-Time GPS location tracking ticker (Every 10 seconds)
  useEffect(() => {
    let gpsInterval: NodeJS.Timeout;

    if (isActiveDuty && currentUser) {
      const sendLocationUpdate = async (lat: number, lng: number) => {
        const payload: LiveLocationUpdatePayload = {
          driver_id: currentUser.id,
          driver_name: currentUser.name,
          bus_plate: currentUser.busPlate || '71 M 0142',
          route_id: selectedRoute.id,
          route_number: selectedRoute.route_number,
          latitude: lat,
          longitude: lng,
          speed: simulatedSpeed,
          heading: 90,
          is_active: true,
          is_simulated: !useDeviceGps,
          occupancy,
          delay_minutes: delayMinutes,
          next_stop_name: selectedRoute.stops[2]?.name || 'Ana Durak',
        };

        const updated = await onUpdateLocation(payload);
        if (updated) {
          setLastGpsUpdate(new Date().toLocaleTimeString('tr-TR'));
        }
      };

      if (useDeviceGps && 'geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, speed } = pos.coords;
            setCurrentCoords({ lat: latitude, lng: longitude });
            setSimulatedSpeed(speed ? Math.round(speed * 3.6) : 35);
            sendLocationUpdate(latitude, longitude);
          },
          (err) => {
            console.warn('Geolocation access error, falling back to simulation:', err);
          },
          { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        gpsInterval = setInterval(() => {
          const poly = selectedRoute.polyline_coordinates;
          if (poly && poly.length > 0) {
            const randomOffset = (Math.random() - 0.5) * 0.003;
            const newLat = parseFloat((currentCoords.lat + randomOffset).toFixed(6));
            const newLng = parseFloat((currentCoords.lng + randomOffset).toFixed(6));
            setCurrentCoords({ lat: newLat, lng: newLng });
            sendLocationUpdate(newLat, newLng);
          }
        }, 10000);
      }
    }

    return () => clearInterval(gpsInterval);
  }, [isActiveDuty, currentUser, selectedRoute, useDeviceGps, simulatedSpeed, occupancy, delayMinutes, onUpdateLocation, currentCoords]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === emailInput.toLowerCase() && u.role === 'driver');
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
    } else {
      const newUser: User = {
        id: `driver_${Date.now()}`,
        name: emailInput.split('@')[0],
        email: emailInput,
        role: 'driver',
        busPlate: '71 M 0999',
        assignedRouteId: routes[0]?.id,
      };
      setCurrentUser(newUser);
      setIsLoggedIn(true);
    }
  };

  // Toggle duty start/stop
  const handleToggleDuty = async () => {
    if (!currentUser) return;
    const nextState = !isActiveDuty;
    setIsActiveDuty(nextState);

    await onToggleActive(currentUser.id, nextState, !useDeviceGps);

    if (nextState) {
      await onUpdateLocation({
        driver_id: currentUser.id,
        driver_name: currentUser.name,
        bus_plate: currentUser.busPlate || '71 M 0142',
        route_id: selectedRoute.id,
        route_number: selectedRoute.route_number,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        speed: simulatedSpeed,
        is_active: true,
        is_simulated: !useDeviceGps,
        occupancy,
        delay_minutes: delayMinutes,
      });
      setLastGpsUpdate(new Date().toLocaleTimeString('tr-TR'));
    }
  };

  // Format duty timer
  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Bus className="w-7 h-7 text-amber-700" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">Şoför Girişi</h2>
            <p className="text-xs text-slate-600 font-medium">Görev ekranına erişmek için şoför hesabınızla giriş yapın.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-Posta Adresi</label>
              <input
                id="driver-email-input"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şifre</label>
              <input
                id="driver-password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              id="driver-login-submit"
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Giriş Yap ve Göreve Başla</span>
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="text-xs text-slate-500 font-medium mb-2">Hızlı Test Dolmuş Şoförü Hesapları:</p>
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              <button
                id="demo-driver-1"
                onClick={() => {
                  setEmailInput('osman@dolmus.com');
                  setPasswordInput('123456');
                }}
                className="text-amber-700 hover:underline cursor-pointer"
              >
                Osman Yılmaz (71 M 0142 - D-1 Yahşihan Kampüs)
              </button>
              <button
                id="demo-driver-2"
                onClick={() => {
                  setEmailInput('suleyman@dolmus.com');
                  setPasswordInput('123456');
                }}
                className="text-amber-700 hover:underline cursor-pointer"
              >
                Süleyman Demir (71 M 0288 - D-2 Bahçelievler Sanayi)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Driver Duty Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-extrabold text-xl shadow-xs">
            <Bus className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-outfit">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-xs font-mono font-bold text-slate-800 border border-slate-200">
                {currentUser.busPlate || '71 M 0142'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ehliyet: {currentUser.driverLicense || 'E-Sınıfı'} • Aktif Görev Paneli
            </p>
          </div>
        </div>

        {/* Route Selector for Duty */}
        <div className="w-full lg:w-80">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Çalışılacak Hat Seçimi
          </label>
          <select
            id="driver-route-select"
            disabled={isActiveDuty}
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-60 cursor-pointer"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id} className="bg-white text-slate-900">
                {r.route_number} - {r.route_name}
              </option>
            ))}
          </select>
        </div>

        {/* Main "MESAİYE BAŞLA" Button */}
        <div className="w-full lg:w-auto">
          <button
            id="driver-btn-duty-toggle"
            onClick={handleToggleDuty}
            className={`w-full lg:w-auto px-7 py-3.5 rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer ${
              isActiveDuty
                ? 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-600'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{isActiveDuty ? 'MESAİYİ BİTİR / PASİF OL' : 'AKTİF OL / MESAİYE BAŞLA'}</span>
          </button>
        </div>

      </div>

      {/* DRIVING MODE HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: High Contrast HUD Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Duty Status & Live Ticker Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isActiveDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <h3 className="font-extrabold text-base text-slate-900">
                  {isActiveDuty ? 'CANLI YAYINDA - GPS VERİSİ GÖNDERİLİYOR' : 'MESAİ DIŞI / PASİF'}
                </h3>
              </div>
              {isActiveDuty && (
                <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                  Süre: {formatTimer(dutyDurationSec)}
                </div>
              )}
            </div>

            {/* Live GPS Update Feedback */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <Radio className={`w-4 h-4 ${isActiveDuty ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <span>
                  {isActiveDuty
                    ? `Her 10 saniyede veritabanına konum yazılıyor. (${currentCoords.lat}, ${currentCoords.lng})`
                    : 'Mesaiye başladığınızda konumunuz canlı haritaya yansıyacaktır.'}
                </span>
              </div>
              {lastGpsUpdate && (
                <span className="text-[11px] font-mono text-emerald-700 font-bold whitespace-nowrap">
                  Son Yazma: {lastGpsUpdate}
                </span>
              )}
            </div>

            {/* GPS Source Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs font-medium">
                <span className="font-bold text-slate-900">Konum Kaynağı:</span>
                <span className="text-slate-600 ml-1">
                  {useDeviceGps ? 'Cihaz Gerçek GPS (Geolocation)' : 'Otomatik Rota Simülatörü'}
                </span>
              </div>
              <button
                id="driver-btn-toggle-gps-source"
                onClick={() => setUseDeviceGps(!useDeviceGps)}
                className="px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-amber-800 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              >
                {useDeviceGps ? 'Simülasyona Geç' : 'Gerçek GPS Kullan'}
              </button>
            </div>

          </div>

          {/* Large Speedometer & Next Stop Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Speed Readout */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-1">
              <Gauge className="w-8 h-8 text-amber-600" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anlık Sürüş Hızı</span>
              <div className="text-5xl font-black text-slate-900 font-mono tracking-tight my-1">
                {isActiveDuty ? simulatedSpeed : 0}
                <span className="text-base text-amber-700 font-sans ml-1">km/s</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Azami Hız Sınırı: 70 km/s</span>
            </div>

            {/* Next Stop Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Yaklaşılan Sonraki Durak
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-2 font-outfit">
                  {selectedRoute.stops[2]?.name || 'Zafer Caddesi Meydan'}
                </h4>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-200 pt-2">
                <span>Kalan Mesafe: ~450 metre</span>
                <span className="font-bold text-emerald-700">Varış: ~2 dk</span>
              </div>
            </div>

          </div>

          {/* Quick Controls: Occupancy & Schedule Delay */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Yolcu Doluluk Durumu Güncelleme
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'low', label: 'Düşük (%25)' },
                { key: 'medium', label: 'Orta (%50)' },
                { key: 'high', label: 'Yoğun (%75)' },
                { key: 'full', label: 'TAM DOLU' },
              ].map((item) => (
                <button
                  key={item.key}
                  id={`occupancy-btn-${item.key}`}
                  onClick={() => setOccupancy(item.key as any)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    occupancy === item.key
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Delay Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700">Rötar / Tarife Durumu:</span>
              <div className="flex items-center gap-2">
                <button
                  id="delay-btn-ontime"
                  onClick={() => setDelayMinutes(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    delayMinutes === 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  Zamanında (0 dk)
                </button>
                <button
                  id="delay-btn-plus2"
                  onClick={() => setDelayMinutes(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    delayMinutes === 2 ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  +2 dk Rötar
                </button>
                <button
                  id="delay-btn-plus5"
                  onClick={() => setDelayMinutes(5)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    delayMinutes === 5 ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  +5 dk Rötar
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Driving Map Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Sürüş Navigasyon Önizleme</span>
              <span className="text-xs font-mono font-bold text-rose-600">{selectedRoute.route_number}</span>
            </h3>

            <MapView
              selectedRoute={selectedRoute}
              activeDrivers={activeDrivers}
              focusedDriverId={currentUser.id}
              height="380px"
              isDriverScreen
            />
          </div>

          <button
            id="driver-logout-btn"
            onClick={() => setIsLoggedIn(false)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Şoför Hesabından Çıkış Yap</span>
          </button>
        </div>

      </div>

    </div>
  );
};
