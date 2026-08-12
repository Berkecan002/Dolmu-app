export type UserRole = 'driver' | 'passenger' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  driverLicense?: string;
  busPlate?: string;
  assignedRouteId?: string;
  avatarUrl?: string;
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  estimatedMinutesFromStart: number;
}

export interface ScheduleGroup {
  dayType: 'hafta_ici' | 'cumartesi' | 'pazar';
  label: string;
  times: string[]; // e.g. ["06:00", "06:15", "06:30", ...]
}

export interface TransitRoute {
  id: string;
  route_number: string; // e.g. "500T"
  route_name: string; // e.g. "Tuzla - Cevizlibağ"
  city: string;
  color: string;
  description?: string;
  fare: number;
  totalDistanceKm: number;
  estimatedDurationMin: number;
  polyline_coordinates: [number, number][]; // [lat, lng] array
  stops: RouteStop[];
  schedules: ScheduleGroup[];
}

export interface ActiveDriver {
  driver_id: string;
  driver_name: string;
  route_id: string;
  route_number: string;
  bus_plate: string;
  current_latitude: number;
  current_longitude: number;
  speed: number; // in km/h
  heading: number; // 0-360 degrees
  is_active: boolean;
  is_simulated?: boolean;
  next_stop_id?: string;
  next_stop_name?: string;
  occupancy?: 'low' | 'medium' | 'high' | 'full';
  delay_minutes?: number; // e.g. +2 min or -1 min
  last_updated: string; // ISO String
}

export interface LiveLocationUpdatePayload {
  driver_id: string;
  route_id: string;
  route_number?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  is_active: boolean;
  bus_plate?: string;
  driver_name?: string;
  next_stop_name?: string;
  occupancy?: 'low' | 'medium' | 'high' | 'full';
  delay_minutes?: number;
  is_simulated?: boolean;
}
