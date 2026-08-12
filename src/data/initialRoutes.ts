import { TransitRoute, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'driver_1',
    name: 'Osman Yılmaz',
    email: 'osman@dolmus.com',
    role: 'driver',
    phone: '0532 711 7171',
    driverLicense: 'E-Sınıfı 71920',
    busPlate: '71 M 0142',
    assignedRouteId: 'route_kk_1',
  },
  {
    id: 'driver_2',
    name: 'Süleyman Demir',
    email: 'suleyman@dolmus.com',
    role: 'driver',
    phone: '0535 712 7172',
    driverLicense: 'E-Sınıfı 71210',
    busPlate: '71 M 0288',
    assignedRouteId: 'route_kk_2',
  },
  {
    id: 'driver_3',
    name: 'Mustafa Kaya',
    email: 'mustafa@dolmus.com',
    role: 'driver',
    phone: '0542 713 7173',
    driverLicense: 'E-Sınıfı 71903',
    busPlate: '71 M 0355',
    assignedRouteId: 'route_kk_3',
  },
  {
    id: 'passenger_demo',
    name: 'Ayşe Yıldız',
    email: 'ayse@yolcu.com',
    role: 'passenger',
  },
];

export const INITIAL_ROUTES: TransitRoute[] = [
  {
    id: 'route_kk_1',
    route_number: 'D-1',
    route_name: 'Yahşihan Kampüs - Otogar - Zafer Caddesi',
    city: 'Kırıkkale',
    color: '#E11D48', // Vibrant Rose/Red
    description: 'KKÜ Üniversite Kampüsü, Yenişehir, Otogar ve Şehir Merkezi ana dolmuş hattı.',
    fare: 15.00,
    totalDistanceKm: 14.5,
    estimatedDurationMin: 30,
    polyline_coordinates: [
      [39.8660, 33.4650], // KKÜ Kampüs Rektörlük
      [39.8590, 33.4810], // Yenişehir Öğrenci Yurtları
      [39.8510, 33.5020], // Kırıkkale Otogarı
      [39.8470, 33.5110], // Yüksek İhtisas Hastanesi
      [39.8453, 33.5153], // Cumhuriyet Meydanı / Zafer Caddesi
      [39.8430, 33.5190], // Kırıkkale Valiliği / Hüseyin Kahya Parkı
    ],
    stops: [
      { id: 'stop_kk1_1', name: 'KKÜ Üniversite Kampüsü (Son Durak)', lat: 39.8660, lng: 33.4650, order: 1, estimatedMinutesFromStart: 0 },
      { id: 'stop_kk1_2', name: 'Yenişehir Yurtlar Bölgesi', lat: 39.8590, lng: 33.4810, order: 2, estimatedMinutesFromStart: 7 },
      { id: 'stop_kk1_3', name: 'Kırıkkale Şehirlerarası Otogar', lat: 39.8510, lng: 33.5020, order: 3, estimatedMinutesFromStart: 15 },
      { id: 'stop_kk1_4', name: 'Yüksek İhtisas Hastanesi Sapağı', lat: 39.8470, lng: 33.5110, order: 4, estimatedMinutesFromStart: 22 },
      { id: 'stop_kk1_5', name: 'Zafer Caddesi / Cumhuriyet Meydanı', lat: 39.8453, lng: 33.5153, order: 5, estimatedMinutesFromStart: 26 },
      { id: 'stop_kk1_6', name: 'Hüseyin Kahya Parkı (Valilik)', lat: 39.8430, lng: 33.5190, order: 6, estimatedMinutesFromStart: 30 },
    ],
    schedules: [
      {
        dayType: 'hafta_ici',
        label: 'Hafta İçi (5 dk Arayla)',
        times: ['06:30', '06:40', '06:50', '07:00', '07:10', '07:20', '07:30', '07:40', '07:50', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00', '22:00', '23:00'],
      },
      {
        dayType: 'cumartesi',
        label: 'Cumartesi',
        times: ['07:00', '07:20', '07:40', '08:00', '08:30', '09:00', '09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
      },
      {
        dayType: 'pazar',
        label: 'Pazar & Tatil',
        times: ['07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
      },
    ],
  },
  {
    id: 'route_kk_2',
    route_number: 'D-2',
    route_name: 'Bahçelievler - Sanayi - Çallı Hacılı',
    city: 'Kırıkkale',
    color: '#2563EB', // Royal Blue
    description: 'Bahçelievler, Nokta Camii, Şehir Merkezi ve Sanayi Sitesi dolmuş hattı.',
    fare: 15.00,
    totalDistanceKm: 12.0,
    estimatedDurationMin: 25,
    polyline_coordinates: [
      [39.8320, 33.5010], // Bahçelievler
      [39.8390, 33.5100], // Nokta Camii
      [39.8453, 33.5153], // Zafer Caddesi Meydan
      [39.8520, 33.5310], // Sanayi Sitesi
      [39.8610, 33.5480], // Çallı Hacılı
    ],
    stops: [
      { id: 'stop_kk2_1', name: 'Bahçelievler Son Durak', lat: 39.8320, lng: 33.5010, order: 1, estimatedMinutesFromStart: 0 },
      { id: 'stop_kk2_2', name: 'Nokta Camii Bulvarı', lat: 39.8390, lng: 33.5100, order: 2, estimatedMinutesFromStart: 6 },
      { id: 'stop_kk2_3', name: 'Zafer Caddesi Meydanı', lat: 39.8453, lng: 33.5153, order: 3, estimatedMinutesFromStart: 12 },
      { id: 'stop_kk2_4', name: 'Kırıkkale Sanayi Sitesi Girişi', lat: 39.8520, lng: 33.5310, order: 4, estimatedMinutesFromStart: 18 },
      { id: 'stop_kk2_5', name: 'Çallı Hacılı Son Durak', lat: 39.8610, lng: 33.5480, order: 5, estimatedMinutesFromStart: 25 },
    ],
    schedules: [
      {
        dayType: 'hafta_ici',
        label: 'Hafta İçi',
        times: ['07:00', '07:15', '07:30', '07:45', '08:00', '08:20', '08:40', '09:00', '09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00', '21:00'],
      },
      {
        dayType: 'cumartesi',
        label: 'Cumartesi',
        times: ['07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        dayType: 'pazar',
        label: 'Pazar',
        times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      },
    ],
  },
  {
    id: 'route_kk_3',
    route_number: 'D-3',
    route_name: 'Etiler - Yenimahalle - Tıp Fakültesi',
    city: 'Kırıkkale',
    color: '#059669', // Emerald Green
    description: 'Etiler mahallesi, Yenimahalle pazarı ve KKÜ Tıp Fakültesi hastane hattı.',
    fare: 15.00,
    totalDistanceKm: 13.2,
    estimatedDurationMin: 28,
    polyline_coordinates: [
      [39.8380, 33.4880], // Etiler
      [39.8420, 33.5020], // Yenimahalle
      [39.8453, 33.5153], // Zafer Caddesi Saat Kulesi
      [39.8510, 33.5220], // Bağlarbaşı / Yüksek İhtisas
      [39.8630, 33.4680], // Tıp Fakültesi Hastanesi
    ],
    stops: [
      { id: 'stop_kk3_1', name: 'Etiler Mahallesi Son Durak', lat: 39.8380, lng: 33.4880, order: 1, estimatedMinutesFromStart: 0 },
      { id: 'stop_kk3_2', name: 'Yenimahalle Kapalı Pazar Yeri', lat: 39.8420, lng: 33.5020, order: 2, estimatedMinutesFromStart: 6 },
      { id: 'stop_kk3_3', name: 'Saat Kulesi / Çarşı Merkezi', lat: 39.8453, lng: 33.5153, order: 3, estimatedMinutesFromStart: 12 },
      { id: 'stop_kk3_4', name: 'Bağlarbaşı Yüksek İhtisas', lat: 39.8510, lng: 33.5220, order: 4, estimatedMinutesFromStart: 18 },
      { id: 'stop_kk3_5', name: 'KKÜ Tıp Fakültesi Hastanesi', lat: 39.8630, lng: 33.4680, order: 5, estimatedMinutesFromStart: 28 },
    ],
    schedules: [
      {
        dayType: 'hafta_ici',
        label: 'Hafta İçi',
        times: ['06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:20', '08:40', '09:00', '09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:15', '20:00', '21:00'],
      },
      {
        dayType: 'cumartesi',
        label: 'Cumartesi',
        times: ['07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        dayType: 'pazar',
        label: 'Pazar',
        times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      },
    ],
  },
  {
    id: 'route_kk_4',
    route_number: 'D-4',
    route_name: 'Gürler - Yuva Mahallesi - Millet Bahçesi',
    city: 'Kırıkkale',
    color: '#D97706', // Amber / Gold
    description: 'Gürler mahallesi, Atatürk Bulvarı, Yuva ve Millet Bahçesi dolmuş hattı.',
    fare: 15.00,
    totalDistanceKm: 11.0,
    estimatedDurationMin: 22,
    polyline_coordinates: [
      [39.8350, 33.5280], // Gürler
      [39.8410, 33.5210], // Atatürk Bulvarı
      [39.8453, 33.5153], // Cumhuriyet Meydanı
      [39.8550, 33.5090], // Yuva Mahallesi
      [39.8600, 33.5180], // Millet Bahçesi
    ],
    stops: [
      { id: 'stop_kk4_1', name: 'Gürler Mahallesi Son Durak', lat: 39.8350, lng: 33.5280, order: 1, estimatedMinutesFromStart: 0 },
      { id: 'stop_kk4_2', name: 'Atatürk Bulvarı Durağı', lat: 39.8410, lng: 33.5210, order: 2, estimatedMinutesFromStart: 5 },
      { id: 'stop_kk4_3', name: 'Cumhuriyet Meydanı Göbek', lat: 39.8453, lng: 33.5153, order: 3, estimatedMinutesFromStart: 10 },
      { id: 'stop_kk4_4', name: 'Yuva Mahallesi Okul Durağı', lat: 39.8550, lng: 33.5090, order: 4, estimatedMinutesFromStart: 16 },
      { id: 'stop_kk4_5', name: 'Kırıkkale Millet Bahçesi', lat: 39.8600, lng: 33.5180, order: 5, estimatedMinutesFromStart: 22 },
    ],
    schedules: [
      {
        dayType: 'hafta_ici',
        label: 'Hafta İçi',
        times: ['07:00', '07:20', '07:40', '08:00', '08:20', '08:40', '09:10', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '16:40', '17:20', '18:00', '18:40', '19:30', '20:30'],
      },
      {
        dayType: 'cumartesi',
        label: 'Cumartesi',
        times: ['07:30', '08:15', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        dayType: 'pazar',
        label: 'Pazar',
        times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      },
    ],
  },
  {
    id: 'route_kk_5',
    route_number: 'D-5',
    route_name: 'Kırıkkale - Keskin Dolmuş Hattı',
    city: 'Kırıkkale',
    color: '#7C3AED', // Purple
    description: 'Kırıkkale İl Merkezi, Hasandede ve Keskin İlçe Meydanı arası ilçe dolmuş hattı.',
    fare: 30.00,
    totalDistanceKm: 27.5,
    estimatedDurationMin: 35,
    polyline_coordinates: [
      [39.8453, 33.5153], // Kırıkkale Meydan
      [39.8250, 33.5350], // Kayseri Yolu Çıkışı
      [39.7520, 33.5280], // Hasandede Sapağı
      [39.6730, 33.6120], // Keskin İlçe Meydanı
    ],
    stops: [
      { id: 'stop_kk5_1', name: 'Kırıkkale Merkez Dolmuş Durakları', lat: 39.8453, lng: 33.5153, order: 1, estimatedMinutesFromStart: 0 },
      { id: 'stop_kk5_2', name: 'Kayseri Yolu Bölge Trafik', lat: 39.8250, lng: 33.5350, order: 2, estimatedMinutesFromStart: 8 },
      { id: 'stop_kk5_3', name: 'Hasandede Beldesi Sapağı', lat: 39.7520, lng: 33.5280, order: 3, estimatedMinutesFromStart: 20 },
      { id: 'stop_kk5_4', name: 'Keskin İlçe Meydanı (Son Durak)', lat: 39.6730, lng: 33.6120, order: 4, estimatedMinutesFromStart: 35 },
    ],
    schedules: [
      {
        dayType: 'hafta_ici',
        label: 'Hafta İçi (Her Saat Başı)',
        times: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '17:30', '18:00', '18:30', '19:30', '20:30', '21:30'],
      },
      {
        dayType: 'cumartesi',
        label: 'Cumartesi',
        times: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        dayType: 'pazar',
        label: 'Pazar',
        times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      },
    ],
  },
];
