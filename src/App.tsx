import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';
import { useRealtimeTransit } from './hooks/useRealtimeTransit';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');

  const {
    routes,
    activeDrivers,
    loading,
    connected,
    fetchRoutes,
    updateDriverLocation,
    toggleDriverActive,
  } = useRealtimeTransit();

  const activeBusesCount = activeDrivers.filter((d) => d.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        activeBusesCount={activeBusesCount}
        isConnected={connected}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentRole === 'passenger' && (
            <motion.div
              key="passenger-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PassengerView
                routes={routes}
                activeDrivers={activeDrivers}
                selectedCity={selectedCity}
              />
            </motion.div>
          )}

          {currentRole === 'driver' && (
            <motion.div
              key="driver-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DriverView
                routes={routes}
                activeDrivers={activeDrivers}
                onUpdateLocation={updateDriverLocation}
                onToggleActive={toggleDriverActive}
              />
            </motion.div>
          )}

          {currentRole === 'admin' && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AdminView
                routes={routes}
                activeDrivers={activeDrivers}
                onRefreshRoutes={fetchRoutes}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Kırıkkale Dolmuş Takip - Gerçek Zamanlı Minibüs Takip Platformu</p>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Şoför Canlı GPS Takibi (10s)</span>
            <span>•</span>
            <span>KKÜ Kampüs & İlçe Güzergahları</span>
            <span>•</span>
            <span>Kalkış Sefer Saatleri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
