import React, { useState } from 'react';
import { Plus, Route, Check, Layers } from 'lucide-react';
import { ActiveDriver, TransitRoute } from '../types';
import { MapView } from './MapView';

interface AdminViewProps {
  routes: TransitRoute[];
  activeDrivers: ActiveDriver[];
  onRefreshRoutes: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  routes,
  activeDrivers,
  onRefreshRoutes,
}) => {
  const [newRouteNumber, setNewRouteNumber] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newCity, setNewCity] = useState('Kırıkkale');
  const [newFare, setNewFare] = useState('15.00');
  const [newColor, setNewColor] = useState('#2563EB');
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteNumber || !newRouteName) return;

    const baseLat = 39.8453 + (Math.random() - 0.5) * 0.03;
    const baseLng = 33.5153 + (Math.random() - 0.5) * 0.03;

    const newRouteObj: TransitRoute = {
      id: `route_${Date.now()}`,
      route_number: newRouteNumber.toUpperCase(),
      route_name: newRouteName,
      city: newCity,
      color: newColor,
      fare: parseFloat(newFare) || 20.0,
      totalDistanceKm: 15.0,
      estimatedDurationMin: 40,
      polyline_coordinates: [
        [baseLat, baseLng],
        [baseLat + 0.02, baseLng + 0.03],
        [baseLat + 0.04, baseLng + 0.05],
      ],
      stops: [
        { id: `stop_new_1`, name: `${newRouteNumber} Kalkış Peronu`, lat: baseLat, lng: baseLng, order: 1, estimatedMinutesFromStart: 0 },
        { id: `stop_new_2`, name: `Merkez Meydan`, lat: baseLat + 0.02, lng: baseLng + 0.03, order: 2, estimatedMinutesFromStart: 20 },
        { id: `stop_new_3`, name: `${newRouteNumber} Son Durak`, lat: baseLat + 0.04, lng: baseLng + 0.05, order: 3, estimatedMinutesFromStart: 40 },
      ],
      schedules: [
        {
          dayType: 'hafta_ici',
          label: 'Hafta İçi',
          times: ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        },
      ],
    };

    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRouteObj),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsAddingRoute(false);
        setNewRouteNumber('');
        setNewRouteName('');
        onRefreshRoutes();
      }
    } catch (err) {
      console.error('Error creating route:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Stat Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit">Sistem & Filo Yönetim Paneli</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Şehir toplu taşıma hatları, aktif şoförler ve canlı GPS takibi.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl font-black text-rose-600 font-mono">{routes.length}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-bold">Kayıtlı Hat</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {activeDrivers.filter((d) => d.is_active).length}
            </span>
            <span className="block text-[10px] text-slate-500 uppercase font-bold">Yayındaki Dolmuş</span>
          </div>

          <button
            id="admin-btn-add-route"
            onClick={() => setIsAddingRoute(!isAddingRoute)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Hat Ekle</span>
          </button>
        </div>
      </div>

      {/* Add New Route Form */}
      {isAddingRoute && (
        <form onSubmit={handleCreateRoute} className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Route className="w-5 h-5 text-indigo-600" />
            Yeni Toplu Taşıma Hattı Tanımla
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hat Kodu</label>
              <input
                id="new-route-code-input"
                type="text"
                required
                placeholder="ör: 25G"
                value={newRouteNumber}
                onChange={(e) => setNewRouteNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hat Adı / Güzergah</label>
              <input
                id="new-route-name-input"
                type="text"
                required
                placeholder="ör: Sanayi - Kampüs"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Şehir / Bölge</label>
              <select
                id="new-route-city-select"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Kırıkkale">Kırıkkale Merkez</option>
                <option value="Yahşihan">Yahşihan / KKÜ</option>
                <option value="Keskin">Keskin İlçesi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bilet Ücreti (TL)</label>
              <input
                id="new-route-fare-input"
                type="number"
                step="0.5"
                value={newFare}
                onChange={(e) => setNewFare(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harita Hat Rengi</label>
              <input
                id="new-route-color-input"
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              id="cancel-add-route-btn"
              type="button"
              onClick={() => setIsAddingRoute(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              id="save-add-route-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Sisteme Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Yeni hat başarıyla veritabanına eklendi!</span>
        </div>
      )}

      {/* City-Wide Fleet Map */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Tüm Şehir Canlı Filo Haritası
        </h3>

        <MapView activeDrivers={activeDrivers} allRoutes={routes} height="420px" />
      </div>

    </div>
  );
};
