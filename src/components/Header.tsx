import React from 'react';
import { Bus, Navigation, ShieldCheck, Radio, MapPin } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  activeBusesCount: number;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedCity,
  onCityChange,
  activeBusesCount,
  isConnected,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Bus className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight font-outfit">
                Berke Baba'nın <span className="text-rose-600">Seferleri</span>
              </h1>
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isConnected ? '71 M Canlı Takip' : 'Bağlanıyor...'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Kırıkkale Dolmuş & Minibüs Hatları Takip Sistemi</p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="role-btn-passenger"
            onClick={() => onRoleChange('passenger')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentRole === 'passenger'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Yolcu</span>
          </button>

          <button
            id="role-btn-driver"
            onClick={() => onRoleChange('driver')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentRole === 'driver'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Şoför Portalı</span>
          </button>

          <button
            id="role-btn-admin"
            onClick={() => onRoleChange('admin')}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Yönetim</span>
          </button>
        </div>

        {/* Right Section: City Filter & Active Bus Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span>{activeBusesCount} Dolmuş Yayında</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <select
              id="header-city-select"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="Tümü" className="bg-white text-slate-900">Tüm Hatlar</option>
              <option value="Kırıkkale" className="bg-white text-slate-900">Kırıkkale Merkez</option>
              <option value="Yahşihan" className="bg-white text-slate-900">Yahşihan / KKÜ</option>
              <option value="Keskin" className="bg-white text-slate-900">Keskin İlçesi</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
