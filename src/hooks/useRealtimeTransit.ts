import { useEffect, useState, useCallback } from 'react';
import { ActiveDriver, TransitRoute, LiveLocationUpdatePayload } from '../types';

export function useRealtimeTransit() {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Fetch initial routes
  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/routes');
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      }
    } catch (err) {
      // Silently catch fetch errors during server reloads/reconnects
    }
  }, []);

  // Fetch active drivers manually
  const fetchActiveDrivers = useCallback(async (routeId?: string) => {
    try {
      const url = routeId ? `/api/active-drivers?route_id=${routeId}` : '/api/active-drivers';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActiveDrivers(data);
      }
    } catch (err) {
      // Silently catch fetch errors during server reloads/reconnects
    }
  }, []);

  // Listen to Server-Sent Events (SSE) for zero-latency updates
  useEffect(() => {
    fetchRoutes();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setConnected(true);
        setLoading(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INITIAL_STATE') {
            if (data.routes) setRoutes(data.routes);
            if (data.drivers) setActiveDrivers(data.drivers);
            setConnected(true);
            setLoading(false);
          } else if (data.type === 'DRIVERS_UPDATE') {
            if (data.drivers) setActiveDrivers(data.drivers);
          }
        } catch (e) {
          console.error('SSE Message parse error:', e);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        // Fallback polling if SSE drops
        fetchActiveDrivers();
      };
    } catch (err) {
      console.error('SSE connection error:', err);
      // Fallback
      fetchActiveDrivers();
      setLoading(false);
    }

    // Polling fallback interval every 5 seconds
    const pollInterval = setInterval(() => {
      fetchActiveDrivers();
    }, 5000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, [fetchRoutes, fetchActiveDrivers]);

  // Update location payload from driver
  const updateDriverLocation = async (payload: LiveLocationUpdatePayload) => {
    try {
      const res = await fetch('/api/active-drivers/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        return result.driver as ActiveDriver;
      }
    } catch (err) {
      console.error('Error updating driver location:', err);
    }
    return null;
  };

  // Toggle active shift
  const toggleDriverActive = async (driverId: string, isActive: boolean, isSimulated?: boolean) => {
    try {
      const res = await fetch('/api/active-drivers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId, is_active: isActive, is_simulated: isSimulated }),
      });
      if (res.ok) {
        const result = await res.json();
        return result.driver as ActiveDriver;
      }
    } catch (err) {
      console.error('Error toggling driver status:', err);
    }
    return null;
  };

  return {
    routes,
    activeDrivers,
    loading,
    connected,
    fetchRoutes,
    fetchActiveDrivers,
    updateDriverLocation,
    toggleDriverActive,
  };
}
