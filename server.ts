import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_ROUTES, INITIAL_USERS } from './src/data/initialRoutes';
import { ActiveDriver, TransitRoute } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store
let routes: TransitRoute[] = [...INITIAL_ROUTES];
const activeDriversMap = new Map<string, ActiveDriver>();

// Initialize default active drivers for realistic demo
const seedDrivers: ActiveDriver[] = [
  {
    driver_id: 'driver_1',
    driver_name: 'Osman Yılmaz',
    route_id: 'route_kk_1',
    route_number: 'D-1',
    bus_plate: '71 M 0142',
    current_latitude: 39.8510,
    current_longitude: 33.5020,
    speed: 38,
    heading: 90,
    is_active: true,
    is_simulated: true,
    next_stop_name: 'Kırıkkale Şehirlerarası Otogar',
    occupancy: 'medium',
    delay_minutes: 0,
    last_updated: new Date().toISOString(),
  },
  {
    driver_id: 'driver_2',
    driver_name: 'Süleyman Demir',
    route_id: 'route_kk_2',
    route_number: 'D-2',
    bus_plate: '71 M 0288',
    current_latitude: 39.8453,
    current_longitude: 33.5153,
    speed: 32,
    heading: 45,
    is_active: true,
    is_simulated: true,
    next_stop_name: 'Zafer Caddesi Meydanı',
    occupancy: 'high',
    delay_minutes: 1,
    last_updated: new Date().toISOString(),
  },
  {
    driver_id: 'driver_3',
    driver_name: 'Mustafa Kaya',
    route_id: 'route_kk_3',
    route_number: 'D-3',
    bus_plate: '71 M 0355',
    current_latitude: 39.8420,
    current_longitude: 33.5020,
    speed: 40,
    heading: 180,
    is_active: true,
    is_simulated: true,
    next_stop_name: 'Yenimahalle Kapalı Pazar Yeri',
    occupancy: 'low',
    delay_minutes: 0,
    last_updated: new Date().toISOString(),
  },
];

seedDrivers.forEach((d) => activeDriversMap.set(d.driver_id, d));

// SSE clients list
interface SSEClient {
  id: string;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastActiveDrivers() {
  const driversList = Array.from(activeDriversMap.values());
  const data = JSON.stringify({ type: 'DRIVERS_UPDATE', drivers: driversList });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// Simulated movement ticker for active simulated drivers
let polylineStepMap: Record<string, { polyIndex: number; progress: number }> = {
  driver_1: { polyIndex: 3, progress: 0.2 },
  driver_2: { polyIndex: 6, progress: 0.5 },
  driver_3: { polyIndex: 4, progress: 0.1 },
};

setInterval(() => {
  try {
    let updated = false;
    activeDriversMap.forEach((driver) => {
      if (driver.is_active && driver.is_simulated) {
        const route = routes.find((r) => r.id === driver.route_id);
        if (route && Array.isArray(route.polyline_coordinates) && route.polyline_coordinates.length > 1) {
          const coords = route.polyline_coordinates;
          let state = polylineStepMap[driver.driver_id] || { polyIndex: 0, progress: 0 };
          
          if (state.polyIndex >= coords.length) {
            state.polyIndex = 0;
          }

          let p1 = coords[state.polyIndex];
          let p2 = coords[(state.polyIndex + 1) % coords.length];

          if (!p1 || !p2) {
            state.polyIndex = 0;
            p1 = coords[0];
            p2 = coords[1] || coords[0];
          }

          if (!p1 || !p2) return;
          
          state.progress += 0.08;
          if (state.progress >= 1.0) {
            state.progress = 0;
            state.polyIndex = (state.polyIndex + 1) % coords.length;
            p1 = coords[state.polyIndex];
            p2 = coords[(state.polyIndex + 1) % coords.length];
          }

          if (!p1 || !p2) return;

          const lat = p1[0] + (p2[0] - p1[0]) * state.progress;
          const lng = p1[1] + (p2[1] - p1[1]) * state.progress;

          // Calculate heading angle
          const dy = p2[0] - p1[0];
          const dx = p2[1] - p1[1];
          const headingDeg = Math.round((Math.atan2(dx, dy) * 180) / Math.PI);

          // Find nearest next stop
          let closestStop = route.stops[0]?.name || 'Ana Durak';
          for (const stop of route.stops) {
            const dist = Math.hypot(stop.lat - lat, stop.lng - lng);
            if (dist < 0.05) {
              closestStop = stop.name;
            }
          }

          driver.current_latitude = parseFloat(lat.toFixed(6));
          driver.current_longitude = parseFloat(lng.toFixed(6));
          driver.speed = Math.floor(35 + Math.random() * 20);
          driver.heading = (headingDeg + 360) % 360;
          driver.next_stop_name = closestStop;
          driver.last_updated = new Date().toISOString();

          polylineStepMap[driver.driver_id] = state;
          updated = true;
        }
      }
    });

    if (updated) {
      broadcastActiveDrivers();
    }
  } catch (err) {
    console.error('Error in driver simulation tick:', err);
  }
}, 4000); // update simulated bus position every 4s

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes API
app.get('/api/routes', (_req, res) => {
  res.json(routes);
});

app.get('/api/routes/:id', (req, res) => {
  const route = routes.find((r) => r.id === req.params.id);
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }
  res.json(route);
});

app.post('/api/routes', (req, res) => {
  const newRoute: TransitRoute = req.body;
  if (!newRoute.id || !newRoute.route_number || !newRoute.route_name) {
    return res.status(400).json({ error: 'Invalid route format' });
  }
  const existingIdx = routes.findIndex((r) => r.id === newRoute.id);
  if (existingIdx >= 0) {
    routes[existingIdx] = newRoute;
  } else {
    routes.push(newRoute);
  }
  res.json({ success: true, route: newRoute });
});

// Users API
app.get('/api/users', (_req, res) => {
  res.json(INITIAL_USERS);
});

// Active Drivers API
app.get('/api/active-drivers', (req, res) => {
  const routeId = req.query.route_id as string | undefined;
  let driversList = Array.from(activeDriversMap.values());
  if (routeId) {
    driversList = driversList.filter((d) => d.route_id === routeId);
  }
  res.json(driversList);
});

app.post('/api/active-drivers/update', (req, res) => {
  const payload = req.body;
  if (!payload.driver_id) {
    return res.status(400).json({ error: 'driver_id is required' });
  }

  const existing: ActiveDriver = activeDriversMap.get(payload.driver_id) || {
    driver_id: payload.driver_id,
    driver_name: payload.driver_name || 'Şoför',
    route_id: payload.route_id || 'route_500t',
    route_number: payload.route_number || '500T',
    bus_plate: payload.bus_plate || '34 ABC 123',
    current_latitude: payload.latitude || 41.0082,
    current_longitude: payload.longitude || 28.9784,
    speed: payload.speed || 0,
    heading: payload.heading || 0,
    is_active: payload.is_active ?? true,
    is_simulated: payload.is_simulated ?? false,
    next_stop_name: payload.next_stop_name || 'Ana Durak',
    occupancy: payload.occupancy || 'medium',
    delay_minutes: payload.delay_minutes ?? 0,
    last_updated: new Date().toISOString(),
  };

  const updatedDriver: ActiveDriver = {
    ...existing,
    route_id: payload.route_id || existing.route_id,
    route_number: payload.route_number || existing.route_number,
    bus_plate: payload.bus_plate || existing.bus_plate,
    current_latitude: payload.latitude ?? existing.current_latitude,
    current_longitude: payload.longitude ?? existing.current_longitude,
    speed: payload.speed ?? existing.speed,
    heading: payload.heading ?? existing.heading,
    is_active: payload.is_active ?? existing.is_active,
    is_simulated: payload.is_simulated ?? existing.is_simulated,
    next_stop_name: payload.next_stop_name || existing.next_stop_name,
    occupancy: payload.occupancy || existing.occupancy,
    delay_minutes: payload.delay_minutes ?? existing.delay_minutes,
    last_updated: new Date().toISOString(),
  };

  activeDriversMap.set(payload.driver_id, updatedDriver);
  broadcastActiveDrivers();

  res.json({ success: true, driver: updatedDriver });
});

app.post('/api/active-drivers/toggle', (req, res) => {
  const { driver_id, is_active, is_simulated } = req.body;
  const driver = activeDriversMap.get(driver_id);
  if (driver) {
    driver.is_active = is_active;
    if (is_simulated !== undefined) {
      driver.is_simulated = is_simulated;
    }
    driver.last_updated = new Date().toISOString();
    activeDriversMap.set(driver_id, driver);
    broadcastActiveDrivers();
    return res.json({ success: true, driver });
  }
  res.status(404).json({ error: 'Driver not found' });
});

// SSE Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now().toString();
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial data
  const initialData = JSON.stringify({
    type: 'INITIAL_STATE',
    drivers: Array.from(activeDriversMap.values()),
    routes,
  });
  res.write(`data: ${initialData}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (e instanceof Error) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Toplu Taşıma Takip Sunucusu http://localhost:${PORT} portunda çalışıyor.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
