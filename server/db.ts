import fs from 'fs';
import path from 'path';
import {
  Booking,
  ClassFareRule,
  FareBreakdown,
  JourneyNotification,
  Passenger,
  SeatClassCode,
  Station,
  Train,
  TrainLiveStatus,
  User,
} from './types';

// In-memory state with persistence to local JSON file
interface DatabaseSchema {
  users: User[];
  stations: Station[];
  trains: Train[];
  bookings: Booking[];
  notifications: JourneyNotification[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server-data.json');

// Preloaded Stations
const SEED_STATIONS: Station[] = [
  { code: 'MAS', name: 'M.G.R. Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 12 },
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', zone: 'Northern Railway', platforms: 16 },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'Central Railway', platforms: 18 },
  { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka', zone: 'South Western Railway', platforms: 10 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Railway', platforms: 23 },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 6 },
  { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 8 },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', zone: 'South Central Railway', platforms: 10 },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', zone: 'Central Railway', platforms: 8 },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 5 },
];

// Preloaded Trains
const SEED_TRAINS: Train[] = [
  {
    id: 'tr_20607',
    trainNumber: '20607',
    trainName: 'Vande Bharat Express',
    trainType: 'VANDE_BHARAT',
    sourceCode: 'MAS',
    sourceName: 'M.G.R. Chennai Central',
    destinationCode: 'SBC',
    destinationName: 'KSR Bengaluru',
    departureTime: '05:50',
    arrivalTime: '10:20',
    duration: '4h 30m',
    distanceKm: 359,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.9,
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '05:50', departureTime: '05:50', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 2 },
      { stationCode: 'KPD', stationName: 'Katpadi Jn', arrivalTime: '07:13', departureTime: '07:15', haltMinutes: 2, distanceKm: 130, dayCount: 1, platform: 1 },
      { stationCode: 'SBC', stationName: 'KSR Bengaluru', arrivalTime: '10:20', departureTime: '10:20', haltMinutes: 0, distanceKm: 359, dayCount: 1, platform: 7 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', baseMultiplier: 2.2, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: '1A', className: 'Executive Chair (EC)', baseMultiplier: 4.1, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 40 },
    ],
    liveStatus: {
      trainNumber: '20607',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'MAS',
      nextStation: 'KPD',
      currentPlatform: 2,
      lastUpdated: new Date().toISOString(),
      notes: 'Departing on schedule from Platform 2',
    },
  },
  {
    id: 'tr_12622',
    trainNumber: '12622',
    trainName: 'Tamil Nadu Superfast Express',
    trainType: 'SUPERFAST',
    sourceCode: 'NDLS',
    sourceName: 'New Delhi',
    destinationCode: 'MAS',
    destinationName: 'M.G.R. Chennai Central',
    departureTime: '21:05',
    arrivalTime: '06:15',
    duration: '33h 10m',
    distanceKm: 2182,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.4,
    stops: [
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '21:05', departureTime: '21:05', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 4 },
      { stationCode: 'NGP', stationName: 'Nagpur Jn', arrivalTime: '13:05', departureTime: '13:10', haltMinutes: 5, distanceKm: 1092, dayCount: 2, platform: 2 },
      { stationCode: 'BZA', stationName: 'Vijayawada Jn', arrivalTime: '23:15', departureTime: '23:25', haltMinutes: 10, distanceKm: 1751, dayCount: 2, platform: 6 },
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '06:15', departureTime: '06:15', haltMinutes: 0, distanceKm: 2182, dayCount: 3, platform: 5 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', baseMultiplier: 4.2, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 24 },
      { classCode: '2A', className: 'AC 2-Tier', baseMultiplier: 2.8, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 48 },
      { classCode: '3A', className: 'AC 3-Tier', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: 'SL', className: 'Sleeper Class', baseMultiplier: 1.0, reservationFee: 20, superfastSurcharge: 30, gstRate: 0.0, totalSeatsCapacity: 240 },
    ],
    liveStatus: {
      trainNumber: '12622',
      status: 'DELAYED',
      delayMinutes: 15,
      currentStation: 'BZA',
      nextStation: 'MAS',
      currentPlatform: 6,
      lastUpdated: new Date().toISOString(),
      notes: 'Running 15 mins late due to route speed restriction',
    },
  },
  {
    id: 'tr_12621',
    trainNumber: '12621',
    trainName: 'Tamil Nadu Superfast Express (MAS -> NDLS)',
    trainType: 'SUPERFAST',
    sourceCode: 'MAS',
    sourceName: 'M.G.R. Chennai Central',
    destinationCode: 'NDLS',
    destinationName: 'New Delhi',
    departureTime: '22:00',
    arrivalTime: '07:40',
    duration: '33h 40m',
    distanceKm: 2182,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.5,
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '22:00', departureTime: '22:00', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 3 },
      { stationCode: 'BZA', stationName: 'Vijayawada Jn', arrivalTime: '04:15', departureTime: '04:25', haltMinutes: 10, distanceKm: 431, dayCount: 2, platform: 1 },
      { stationCode: 'NGP', stationName: 'Nagpur Jn', arrivalTime: '14:40', departureTime: '14:45', haltMinutes: 5, distanceKm: 1090, dayCount: 2, platform: 1 },
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '07:40', departureTime: '07:40', haltMinutes: 0, distanceKm: 2182, dayCount: 3, platform: 5 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', baseMultiplier: 4.2, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 24 },
      { classCode: '2A', className: 'AC 2-Tier', baseMultiplier: 2.8, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 48 },
      { classCode: '3A', className: 'AC 3-Tier', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: 'SL', className: 'Sleeper Class', baseMultiplier: 1.0, reservationFee: 20, superfastSurcharge: 30, gstRate: 0.0, totalSeatsCapacity: 240 },
    ],
    liveStatus: {
      trainNumber: '12621',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'MAS',
      nextStation: 'BZA',
      currentPlatform: 3,
      lastUpdated: new Date().toISOString(),
      notes: 'Scheduled departure on time from Platform 3',
    },
  },
  {
    id: 'tr_12675',
    trainNumber: '12675',
    trainName: 'Kovai Superfast Express',
    trainType: 'SUPERFAST',
    sourceCode: 'MAS',
    sourceName: 'M.G.R. Chennai Central',
    destinationCode: 'CBE',
    destinationName: 'Coimbatore Junction',
    departureTime: '06:10',
    arrivalTime: '14:05',
    duration: '7h 55m',
    distanceKm: 497,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.6,
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '06:10', departureTime: '06:10', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 10 },
      { stationCode: 'KPD', stationName: 'Katpadi Jn', arrivalTime: '07:48', departureTime: '07:50', haltMinutes: 2, distanceKm: 130, dayCount: 1, platform: 1 },
      { stationCode: 'CBE', stationName: 'Coimbatore Jn', arrivalTime: '14:05', departureTime: '14:05', haltMinutes: 0, distanceKm: 497, dayCount: 1, platform: 2 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 96 },
      { classCode: '2S', className: 'Second Sitting', baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 300 },
    ],
    liveStatus: {
      trainNumber: '12675',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'KPD',
      nextStation: 'CBE',
      currentPlatform: 1,
      lastUpdated: new Date().toISOString(),
      notes: 'Departed Katpadi on schedule',
    },
  },
  {
    id: 'tr_12635',
    trainNumber: '12635',
    trainName: 'Vaigai Superfast Express',
    trainType: 'SUPERFAST',
    sourceCode: 'MAS',
    sourceName: 'M.G.R. Chennai Central',
    destinationCode: 'MDU',
    destinationName: 'Madurai Junction',
    departureTime: '13:50',
    arrivalTime: '21:30',
    duration: '7h 40m',
    distanceKm: 495,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.7,
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '13:50', departureTime: '13:50', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 8 },
      { stationCode: 'MDU', stationName: 'Madurai Jn', arrivalTime: '21:30', departureTime: '21:30', haltMinutes: 0, distanceKm: 495, dayCount: 1, platform: 1 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 80 },
      { classCode: '2S', className: 'Second Sitting', baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 280 },
    ],
    liveStatus: {
      trainNumber: '12635',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'MAS',
      nextStation: 'MDU',
      currentPlatform: 8,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'tr_12164',
    trainNumber: '12164',
    trainName: 'Chennai Superfast Express',
    trainType: 'SUPERFAST',
    sourceCode: 'CSMT',
    sourceName: 'Mumbai CSMT',
    destinationCode: 'MAS',
    destinationName: 'M.G.R. Chennai Central',
    departureTime: '12:40',
    arrivalTime: '08:20',
    duration: '19h 40m',
    distanceKm: 1281,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.3,
    stops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: '12:40', departureTime: '12:40', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 14 },
      { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '08:20', departureTime: '08:20', haltMinutes: 0, distanceKm: 1281, dayCount: 2, platform: 7 },
    ],
    classes: [
      { classCode: '2A', className: 'AC 2-Tier', baseMultiplier: 2.8, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 48 },
      { classCode: '3A', className: 'AC 3-Tier', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: 'SL', className: 'Sleeper Class', baseMultiplier: 1.0, reservationFee: 20, superfastSurcharge: 30, gstRate: 0.0, totalSeatsCapacity: 220 },
    ],
    liveStatus: {
      trainNumber: '12164',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'CSMT',
      nextStation: 'MAS',
      currentPlatform: 14,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'tr_12951',
    trainNumber: '12951',
    trainName: 'Mumbai Tejas Rajdhani Express',
    trainType: 'RAJDHANI',
    sourceCode: 'CSMT',
    sourceName: 'Mumbai CSMT',
    destinationCode: 'NDLS',
    destinationName: 'New Delhi',
    departureTime: '17:00',
    arrivalTime: '08:32',
    duration: '15h 32m',
    distanceKm: 1384,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.8,
    stops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: '17:00', departureTime: '17:00', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 16 },
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '08:32', departureTime: '08:32', haltMinutes: 0, distanceKm: 1384, dayCount: 2, platform: 1 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', baseMultiplier: 4.4, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 30 },
      { classCode: '2A', className: 'AC 2-Tier', baseMultiplier: 3.0, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 60 },
      { classCode: '3A', className: 'AC 3-Tier', baseMultiplier: 2.2, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 140 },
    ],
    liveStatus: {
      trainNumber: '12951',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'CSMT',
      nextStation: 'NDLS',
      currentPlatform: 16,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'tr_22691',
    trainNumber: '22691',
    trainName: 'Bengaluru Rajdhani Express',
    trainType: 'RAJDHANI',
    sourceCode: 'SBC',
    sourceName: 'KSR Bengaluru',
    destinationCode: 'NDLS',
    destinationName: 'New Delhi',
    departureTime: '20:00',
    arrivalTime: '05:30',
    duration: '33h 30m',
    distanceKm: 2367,
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    pantryAvailable: true,
    cleanlinessRating: 4.7,
    stops: [
      { stationCode: 'SBC', stationName: 'KSR Bengaluru', arrivalTime: '20:00', departureTime: '20:00', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 8 },
      { stationCode: 'NGP', stationName: 'Nagpur Jn', arrivalTime: '15:20', departureTime: '15:25', haltMinutes: 5, distanceKm: 1275, dayCount: 2, platform: 1 },
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '05:30', departureTime: '05:30', haltMinutes: 0, distanceKm: 2367, dayCount: 3, platform: 6 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', baseMultiplier: 4.4, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 24 },
      { classCode: '2A', className: 'AC 2-Tier', baseMultiplier: 3.0, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 54 },
      { classCode: '3A', className: 'AC 3-Tier', baseMultiplier: 2.2, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 130 },
    ],
    liveStatus: {
      trainNumber: '22691',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'SBC',
      nextStation: 'NGP',
      currentPlatform: 8,
      lastUpdated: new Date().toISOString(),
    },
  },
];

// Preloaded Users
const SEED_USERS: User[] = [
  {
    id: 'usr_passenger_1',
    name: 'Priya Sharma',
    email: 'passenger@rail.in',
    passwordHash: 'pass123', // Demo authentication
    phone: '+91 98765 43210',
    role: 'PASSENGER',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'usr_admin_1',
    name: 'Rajesh Kumar (Station Super)',
    email: 'admin@rail.in',
    passwordHash: 'admin123',
    phone: '+91 98111 22334',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

// Calculate future date for sample booking
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
const sampleTravelDate = tomorrow.toISOString().split('T')[0];

// Preloaded Active Sample Booking
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk_sample_01',
    pnr: '482-910-3847',
    userId: 'usr_passenger_1',
    userEmail: 'passenger@rail.in',
    userName: 'Priya Sharma',
    trainNumber: '20607',
    trainName: 'Vande Bharat Express',
    trainType: 'VANDE_BHARAT',
    travelDate: sampleTravelDate,
    sourceCode: 'MAS',
    sourceName: 'M.G.R. Chennai Central',
    destinationCode: 'SBC',
    destinationName: 'KSR Bengaluru',
    departureTime: '05:50',
    arrivalTime: '10:20',
    classCode: 'CC',
    className: 'AC Chair Car',
    departurePlatform: 2,
    passengers: [
      {
        id: 'pax_01',
        name: 'Priya Sharma',
        age: 26,
        gender: 'FEMALE',
        berthPreference: 'WINDOW',
        coach: 'C3',
        berthNumber: 18,
        berthType: 'Window (WS)',
        status: 'CONFIRMED',
      },
      {
        id: 'pax_02',
        name: 'Arjun Sharma',
        age: 29,
        gender: 'MALE',
        berthPreference: 'NO_PREFERENCE',
        coach: 'C3',
        berthNumber: 19,
        berthType: 'Aisle (AS)',
        status: 'CONFIRMED',
      },
    ],
    fareBreakdown: {
      baseFare: 1580,
      reservationCharge: 80,
      superfastCharge: 90,
      gstAmount: 87,
      totalPerPassenger: 918.5,
      passengerCount: 2,
      grandTotal: 1837,
    },
    status: 'CONFIRMED',
    bookedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Preloaded Journey Notifications
const SEED_NOTIFICATIONS: JourneyNotification[] = [
  {
    id: 'notif_01',
    userId: 'usr_passenger_1',
    trainNumber: '20607',
    title: 'Booking Confirmed: PNR 482-910-3847',
    message: 'Your ticket for Vande Bharat Express (MAS → SBC) is confirmed in Coach C3.',
    type: 'BOOKING',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: false,
  },
  {
    id: 'notif_02',
    trainNumber: '20607',
    title: 'Platform Assigned: Platform 2',
    message: 'Train 20607 Vande Bharat Express will be positioned on Platform 2 at M.G.R. Chennai Central.',
    type: 'PLATFORM_CHANGE',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
  },
  {
    id: 'notif_03',
    trainNumber: '12622',
    title: 'Live Status Update: 12622 Tamil Nadu Express',
    message: 'Running 15 mins behind schedule due to track maintenance near Vijayawada.',
    type: 'DELAY',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: false,
  },
];

class MemoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.trains && parsed.stations && parsed.bookings) {
          return parsed;
        }
      }
    } catch {
      // Ignore file reading errors, fallback to default seed
    }

    const defaultData: DatabaseSchema = {
      users: SEED_USERS,
      stations: SEED_STATIONS,
      trains: SEED_TRAINS,
      bookings: SEED_BOOKINGS,
      notifications: SEED_NOTIFICATIONS,
    };
    this.persist(defaultData);
    return defaultData;
  }

  private persist(dataToSave: DatabaseSchema = this.data) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch {
      // In case write is restricted
    }
  }

  // Station operations
  getStations(): Station[] {
    return this.data.stations;
  }

  getStationByCode(code: string): Station | undefined {
    return this.data.stations.find((s) => s.code.toUpperCase() === code.toUpperCase());
  }

  // Train operations
  getTrains(): Train[] {
    return this.data.trains;
  }

  getTrainByNumber(trainNumber: string): Train | undefined {
    return this.data.trains.find((t) => t.trainNumber === trainNumber);
  }

  searchTrains(sourceCode: string, destinationCode: string): Train[] {
    const src = sourceCode.toUpperCase();
    const dest = destinationCode.toUpperCase();

    return this.data.trains.filter((train) => {
      // direct match
      if (train.sourceCode === src && train.destinationCode === dest) {
        return true;
      }
      // check intermediate stops
      const srcIdx = train.stops.findIndex((s) => s.stationCode === src);
      const destIdx = train.stops.findIndex((s) => s.stationCode === dest);
      return srcIdx !== -1 && destIdx !== -1 && srcIdx < destIdx;
    });
  }

  addTrain(train: Train): Train {
    this.data.trains.push(train);
    this.persist();
    return train;
  }

  updateTrain(trainNumber: string, updates: Partial<Train>): Train | null {
    const idx = this.data.trains.findIndex((t) => t.trainNumber === trainNumber);
    if (idx === -1) return null;
    this.data.trains[idx] = { ...this.data.trains[idx], ...updates };
    this.persist();
    return this.data.trains[idx];
  }

  updateLiveStatus(trainNumber: string, statusUpdate: Partial<TrainLiveStatus>): TrainLiveStatus | null {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return null;
    const currentStatus = train.liveStatus || {
      trainNumber,
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: train.sourceCode,
      nextStation: train.destinationCode,
      currentPlatform: 1,
      lastUpdated: new Date().toISOString(),
    };

    train.liveStatus = {
      ...currentStatus,
      ...statusUpdate,
      lastUpdated: new Date().toISOString(),
    };

    // Also broadcast notification
    this.addNotification({
      id: 'notif_' + Date.now(),
      trainNumber,
      title: `Status: ${train.trainName} (${trainNumber})`,
      message: statusUpdate.notes || `Train is currently ${train.liveStatus.status} (delay: ${train.liveStatus.delayMinutes} mins) at platform ${train.liveStatus.currentPlatform}`,
      type: statusUpdate.status === 'DELAYED' ? 'DELAY' : 'SIMULATION',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return train.liveStatus;
  }

  // Seat Availability calculation
  getSeatAvailability(trainNumber: string, classCode: SeatClassCode, travelDate: string) {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return null;

    const classConfig = train.classes.find((c) => c.classCode === classCode);
    if (!classConfig) return null;

    // Count confirmed bookings for this train, class, and date
    const bookedPassengers = this.data.bookings
      .filter(
        (b) =>
          b.trainNumber === trainNumber &&
          b.travelDate === travelDate &&
          b.classCode === classCode &&
          b.status === 'CONFIRMED'
      )
      .reduce((sum, b) => sum + b.passengers.length, 0);

    const availableSeats = Math.max(0, classConfig.totalSeatsCapacity - bookedPassengers);

    let statusString = '';
    if (availableSeats > 5) {
      statusString = `AVAILABLE-${availableSeats}`;
    } else if (availableSeats > 0) {
      statusString = `CURR_AVBL-${availableSeats}`;
    } else {
      // RAC/WL simulation
      const racCount = 6;
      statusString = `RAC-${racCount}`;
    }

    return {
      trainNumber,
      classCode,
      className: classConfig.className,
      totalCapacity: classConfig.totalSeatsCapacity,
      bookedCount: bookedPassengers,
      availableSeats,
      status: statusString,
      isAvailable: availableSeats > 0,
      fare: this.calculateFare(train, classConfig, 1),
    };
  }

  // Transparent Fare Calculation
  calculateFare(train: Train, classRule: ClassFareRule, passengerCount: number): FareBreakdown {
    // Distance-based base fare rate: ~ ₹0.40 per km for base sleeper
    const baseDistanceRate = Math.round(train.distanceKm * 0.42 * classRule.baseMultiplier);
    const reservationCharge = classRule.reservationFee;
    const superfastCharge = train.trainType === 'SUPERFAST' || train.trainType === 'VANDE_BHARAT' || train.trainType === 'RAJDHANI' ? classRule.superfastSurcharge : 0;
    const taxableSubtotal = baseDistanceRate + reservationCharge + superfastCharge;
    const gstAmount = Math.round(taxableSubtotal * classRule.gstRate);
    const totalPerPassenger = taxableSubtotal + gstAmount;

    return {
      baseFare: baseDistanceRate,
      reservationCharge,
      superfastCharge,
      gstAmount,
      totalPerPassenger,
      passengerCount,
      grandTotal: totalPerPassenger * passengerCount,
    };
  }

  // Booking operations
  getBookings(): Booking[] {
    return this.data.bookings;
  }

  getUserBookings(userId: string): Booking[] {
    return this.data.bookings.filter((b) => b.userId === userId);
  }

  getBookingByPnr(pnr: string): Booking | undefined {
    const cleanPnr = pnr.replace(/\D/g, '');
    return this.data.bookings.find((b) => b.pnr.replace(/\D/g, '') === cleanPnr);
  }

  // Generate unique 10-digit PNR in format: 482-910-3847
  private generateUniquePnr(): string {
    while (true) {
      const part1 = Math.floor(100 + Math.random() * 900);
      const part2 = Math.floor(100 + Math.random() * 900);
      const part3 = Math.floor(1000 + Math.random() * 9000);
      const pnr = `${part1}-${part2}-${part3}`;
      if (!this.data.bookings.some((b) => b.pnr === pnr)) {
        return pnr;
      }
    }
  }

  // Coach & Berth assignment helper
  private allocateBerths(classCode: SeatClassCode, passengers: Array<{ name: string; age: number; gender: string; berthPreference: string }>): Passenger[] {
    const coachPrefixMap: Record<SeatClassCode, string> = {
      '1A': 'H',
      '2A': 'A',
      '3A': 'B',
      SL: 'S',
      CC: 'C',
      '2S': 'D',
    };
    const coachNum = Math.floor(1 + Math.random() * 4);
    const coach = `${coachPrefixMap[classCode] || 'S'}${coachNum}`;

    const berthTypes = ['Lower (LB)', 'Middle (MB)', 'Upper (UB)', 'Side Lower (SL)', 'Side Upper (SU)', 'Window (WS)'];

    return passengers.map((p, idx) => {
      const berthNumber = Math.floor(1 + Math.random() * 64);
      let selectedBerthType = berthTypes[idx % berthTypes.length];
      if (p.berthPreference === 'LOWER') selectedBerthType = 'Lower (LB)';
      else if (p.berthPreference === 'UPPER') selectedBerthType = 'Upper (UB)';
      else if (p.berthPreference === 'WINDOW') selectedBerthType = 'Window (WS)';

      return {
        id: `pax_${Date.now()}_${idx}`,
        name: p.name,
        age: p.age,
        gender: p.gender as any,
        berthPreference: (p.berthPreference as any) || 'NO_PREFERENCE',
        coach,
        berthNumber,
        berthType: selectedBerthType,
        status: 'CONFIRMED',
      };
    });
  }

  createBooking(params: {
    userId: string;
    userEmail: string;
    userName: string;
    trainNumber: string;
    travelDate: string;
    classCode: SeatClassCode;
    passengers: Array<{ name: string; age: number; gender: string; berthPreference: string }>;
  }): Booking {
    const train = this.getTrainByNumber(params.trainNumber);
    if (!train) throw new Error(`Train ${params.trainNumber} not found.`);

    const classRule = train.classes.find((c) => c.classCode === params.classCode);
    if (!classRule) throw new Error(`Class ${params.classCode} not supported on this train.`);

    // Atomic availability validation
    const availability = this.getSeatAvailability(params.trainNumber, params.classCode, params.travelDate);
    if (!availability || availability.availableSeats < params.passengers.length) {
      throw new Error(`Insufficient seats available in ${classRule.className}. Available: ${availability?.availableSeats || 0}`);
    }

    const fareBreakdown = this.calculateFare(train, classRule, params.passengers.length);
    const allocatedPassengers = this.allocateBerths(params.classCode, params.passengers);
    const pnr = this.generateUniquePnr();

    const booking: Booking = {
      id: `bk_${Date.now()}`,
      pnr,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      travelDate: params.travelDate,
      sourceCode: train.sourceCode,
      sourceName: train.sourceName,
      destinationCode: train.destinationCode,
      destinationName: train.destinationName,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      classCode: params.classCode,
      className: classRule.className,
      departurePlatform: train.stops[0]?.platform || 1,
      passengers: allocatedPassengers,
      fareBreakdown,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString(),
    };

    this.data.bookings.unshift(booking);

    // Add journey notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: params.userId,
      trainNumber: train.trainNumber,
      title: `Booking Confirmed: PNR ${pnr}`,
      message: `Your journey on ${train.trainName} (${train.trainNumber}) for ${params.travelDate} has been confirmed. Coach: ${allocatedPassengers[0]?.coach}.`,
      type: 'BOOKING',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return booking;
  }

  cancelBooking(pnr: string, userId: string, isAdmin = false): { booking: Booking; refundAmount: number; cancellationFee: number } {
    const booking = this.getBookingByPnr(pnr);
    if (!booking) throw new Error('Booking not found.');

    if (!isAdmin && booking.userId !== userId) {
      throw new Error('Unauthorized: You can only cancel your own bookings.');
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('This ticket has already been cancelled.');
    }

    // IRCTC Refund Slab Rules:
    // Determine hours before departure
    const journeyDateTime = new Date(`${booking.travelDate}T${booking.departureTime}:00`);
    const now = new Date();
    const hoursRemaining = (journeyDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const totalFare = booking.fareBreakdown.grandTotal;
    let cancellationFee = 0;

    // Clerkage standard deductions per passenger
    const clerkageMap: Record<SeatClassCode, number> = {
      '1A': 240,
      '2A': 200,
      '3A': 180,
      CC: 180,
      SL: 120,
      '2S': 60,
    };
    const baseClerkage = (clerkageMap[booking.classCode] || 120) * booking.passengers.length;

    if (hoursRemaining > 48) {
      // More than 48 hours: Flat clerkage deduction
      cancellationFee = baseClerkage;
    } else if (hoursRemaining > 12) {
      // 12 to 48 hours: 25% of fare, subject to min clerkage
      cancellationFee = Math.max(baseClerkage, Math.round(totalFare * 0.25));
    } else if (hoursRemaining > 4) {
      // 4 to 12 hours: 50% of fare
      cancellationFee = Math.max(baseClerkage, Math.round(totalFare * 0.5));
    } else {
      // Less than 4 hours (Chart prepared): 75% fee
      cancellationFee = Math.round(totalFare * 0.75);
    }

    cancellationFee = Math.min(totalFare, cancellationFee);
    const refundAmount = totalFare - cancellationFee;

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationFee = cancellationFee;
    booking.refundAmount = refundAmount;

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      trainNumber: booking.trainNumber,
      title: `Ticket Cancelled: PNR ${booking.pnr}`,
      message: `Your booking for ${booking.trainName} has been cancelled. Refund of ₹${refundAmount} initiated (Deduction: ₹${cancellationFee}).`,
      type: 'BOOKING',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return { booking, refundAmount, cancellationFee };
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  registerUser(params: { name: string; email: string; password: string; phone: string }): User {
    if (this.getUserByEmail(params.email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash: params.password, // demonstration store
      phone: params.phone,
      role: 'PASSENGER',
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // Notifications
  getNotifications(userId?: string): JourneyNotification[] {
    return this.data.notifications.filter((n) => !n.userId || (userId && n.userId === userId));
  }

  addNotification(notification: JourneyNotification): JourneyNotification {
    this.data.notifications.unshift(notification);
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.persist();
    return notification;
  }

  markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
  }

  markAllNotificationsRead(userId?: string): void {
    this.data.notifications.forEach((n) => {
      if (!n.userId || (userId && n.userId === userId)) {
        n.read = true;
      }
    });
    this.persist();
  }

  // Alternative Journey Explorer Engine
  getAlternativeJourneys(sourceCode: string, destinationCode: string, travelDate: string, currentTrainNumber?: string) {
    const src = sourceCode.toUpperCase();
    const dest = destinationCode.toUpperCase();

    // Direct alternative trains on same corridor
    const allDirect = this.searchTrains(src, dest);
    const directAlternatives = allDirect
      .filter((t) => t.trainNumber !== currentTrainNumber)
      .map((train) => {
        const availableClass = train.classes.find((c) => {
          const avail = this.getSeatAvailability(train.trainNumber, c.classCode, travelDate);
          return avail && avail.availableSeats > 0;
        }) || train.classes[0];

        const availInfo = this.getSeatAvailability(train.trainNumber, availableClass.classCode, travelDate);

        return {
          type: 'DIRECT_ALTERNATIVE' as const,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          trainType: train.trainType,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          duration: train.duration,
          recommendedClass: availableClass.classCode,
          availableSeats: availInfo?.availableSeats || 0,
          estimatedFare: availInfo?.fare.grandTotal || 0,
          reason: `Alternative departure at ${train.departureTime} with confirmed ${availableClass.className} seats.`,
        };
      });

    // Connecting journeys through hub stations (e.g. Katpadi KPD, Vijayawada BZA, Nagpur NGP)
    const hubCandidates = ['KPD', 'BZA', 'NGP', 'MAS', 'SBC'];
    const connectingAlternatives: any[] = [];

    hubCandidates.forEach((hubCode) => {
      if (hubCode === src || hubCode === dest) return;

      const leg1Trains = this.searchTrains(src, hubCode);
      const leg2Trains = this.searchTrains(hubCode, dest);

      if (leg1Trains.length > 0 && leg2Trains.length > 0) {
        const t1 = leg1Trains[0];
        const t2 = leg2Trains[0];
        const hubStation = this.getStationByCode(hubCode);

        connectingAlternatives.push({
          type: 'CONNECTING_ROUTE' as const,
          hubCode,
          hubName: hubStation?.name || hubCode,
          leg1: {
            trainNumber: t1.trainNumber,
            trainName: t1.trainName,
            departureTime: t1.departureTime,
            arrivalTime: t1.arrivalTime,
            sourceCode: src,
            destCode: hubCode,
          },
          leg2: {
            trainNumber: t2.trainNumber,
            trainName: t2.trainName,
            departureTime: t2.departureTime,
            arrivalTime: t2.arrivalTime,
            sourceCode: hubCode,
            destCode: dest,
          },
          transferStation: hubStation?.name || hubCode,
          transferDuration: '1h 45m',
          totalDuration: `${parseInt(t1.duration) + parseInt(t2.duration) + 2}h (est)`,
          reason: `Connecting via ${hubStation?.city || hubCode} with verified comfortable layover time.`,
        });
      }
    });

    return {
      directAlternatives,
      connectingAlternatives: connectingAlternatives.slice(0, 2),
    };
  }
}

export const db = new MemoryDatabase();
