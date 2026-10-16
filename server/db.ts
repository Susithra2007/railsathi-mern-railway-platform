import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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

interface DatabaseSchema {
  users: User[];
  stations: Station[];
  trains: Train[];
  bookings: Booking[];
  notifications: JourneyNotification[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server-data.json');

// Real railway stations with real-world geographical coordinates for route mapping
const SEED_STATIONS: Station[] = [
  { code: 'MAS', name: 'M.G.R. Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 12, lat: 13.0827, lng: 80.2755 },
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', zone: 'Northern Railway', platforms: 16, lat: 28.6429, lng: 77.2195 },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'Central Railway', platforms: 18, lat: 18.9400, lng: 72.8354 },
  { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka', zone: 'South Western Railway', platforms: 10, lat: 12.9779, lng: 77.5683 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Railway', platforms: 23, lat: 22.5830, lng: 88.3426 },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 6, lat: 11.0016, lng: 76.9665 },
  { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 8, lat: 9.9252, lng: 78.1198 },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', zone: 'South Central Railway', platforms: 10, lat: 16.5186, lng: 80.6199 },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', zone: 'Central Railway', platforms: 8, lat: 21.1528, lng: 79.0882 },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu', zone: 'Southern Railway', platforms: 5, lat: 12.9698, lng: 79.1378 },
];

// Preloaded Trains with configured per-km fare rates and intermediate stops
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
    isActive: true,
    stops: [
      { stationCode: 'MAS', stationName: 'M.G.R. Chennai Central', arrivalTime: '05:50', departureTime: '05:50', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 2, lat: 13.0827, lng: 80.2755 },
      { stationCode: 'KPD', stationName: 'Katpadi Junction', arrivalTime: '07:13', departureTime: '07:15', haltMinutes: 2, distanceKm: 130, dayCount: 1, platform: 1, lat: 12.9698, lng: 79.1378 },
      { stationCode: 'SBC', stationName: 'KSR Bengaluru City', arrivalTime: '10:20', departureTime: '10:20', haltMinutes: 0, distanceKm: 359, dayCount: 1, platform: 7, lat: 12.9779, lng: 77.5683 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', perKmRate: 1.15, baseMultiplier: 2.2, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: '1A', className: 'Executive Chair Car (EC)', perKmRate: 2.65, baseMultiplier: 4.1, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 40 },
    ],
    liveStatus: {
      trainNumber: '20607',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'Katpadi Junction (KPD)',
      previousStation: 'M.G.R. Chennai Central (MAS)',
      nextStation: 'KSR Bengaluru City (SBC)',
      currentPlatform: 1,
      journeyProgress: 42,
      estimatedArrival: '10:20',
      estimatedDeparture: '05:50',
      dataSource: 'SIMULATED_ACADEMIC_DEMO',
      lastUpdated: new Date().toISOString(),
      notes: 'Departed Katpadi Junction right on time. Approaching Jolarpettai sector.',
      currentLat: 12.9698,
      currentLng: 79.1378,
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
    isActive: true,
    stops: [
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '21:05', departureTime: '21:05', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 4, lat: 28.6429, lng: 77.2195 },
      { stationCode: 'NGP', stationName: 'Nagpur Junction', arrivalTime: '13:05', departureTime: '13:10', haltMinutes: 5, distanceKm: 1092, dayCount: 2, platform: 2, lat: 21.1528, lng: 79.0882 },
      { stationCode: 'BZA', stationName: 'Vijayawada Junction', arrivalTime: '23:15', departureTime: '23:25', haltMinutes: 10, distanceKm: 1751, dayCount: 2, platform: 6, lat: 16.5186, lng: 80.6199 },
      { stationCode: 'MAS', stationName: 'M.G.R. Chennai Central', arrivalTime: '06:15', departureTime: '06:15', haltMinutes: 0, distanceKm: 2182, dayCount: 3, platform: 5, lat: 13.0827, lng: 80.2755 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', perKmRate: 2.65, baseMultiplier: 4.2, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 24 },
      { classCode: '2A', className: 'AC 2-Tier', perKmRate: 1.85, baseMultiplier: 2.8, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 48 },
      { classCode: '3A', className: 'AC 3-Tier', perKmRate: 1.25, baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 120 },
      { classCode: 'SL', className: 'Sleeper Class', perKmRate: 0.48, baseMultiplier: 1.0, reservationFee: 20, superfastSurcharge: 30, gstRate: 0.0, totalSeatsCapacity: 240 },
    ],
    liveStatus: {
      trainNumber: '12622',
      status: 'DELAYED',
      delayMinutes: 20,
      currentStation: 'Vijayawada Junction (BZA)',
      previousStation: 'Nagpur Junction (NGP)',
      nextStation: 'M.G.R. Chennai Central (MAS)',
      currentPlatform: 6,
      journeyProgress: 78,
      estimatedArrival: '06:35',
      estimatedDeparture: '21:05',
      dataSource: 'SIMULATED_ACADEMIC_DEMO',
      lastUpdated: new Date().toISOString(),
      notes: 'Speed restriction due to track maintenance near Krishna River bridge.',
      currentLat: 16.5186,
      currentLng: 80.6199,
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
    isActive: true,
    stops: [
      { stationCode: 'MAS', stationName: 'M.G.R. Chennai Central', arrivalTime: '06:10', departureTime: '06:10', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 10, lat: 13.0827, lng: 80.2755 },
      { stationCode: 'KPD', stationName: 'Katpadi Junction', arrivalTime: '07:48', departureTime: '07:50', haltMinutes: 2, distanceKm: 130, dayCount: 1, platform: 1, lat: 12.9698, lng: 79.1378 },
      { stationCode: 'CBE', stationName: 'Coimbatore Junction', arrivalTime: '14:05', departureTime: '14:05', haltMinutes: 0, distanceKm: 497, dayCount: 1, platform: 2, lat: 11.0016, lng: 76.9665 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', perKmRate: 1.15, baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 96 },
      { classCode: '2S', className: 'Second Sitting (2S)', perKmRate: 0.30, baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 300 },
    ],
    liveStatus: {
      trainNumber: '12675',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'Katpadi Junction (KPD)',
      previousStation: 'M.G.R. Chennai Central (MAS)',
      nextStation: 'Coimbatore Junction (CBE)',
      currentPlatform: 1,
      journeyProgress: 32,
      estimatedArrival: '14:05',
      estimatedDeparture: '06:10',
      dataSource: 'SIMULATED_ACADEMIC_DEMO',
      lastUpdated: new Date().toISOString(),
      notes: 'Running on schedule with high punctuality.',
      currentLat: 12.9698,
      currentLng: 79.1378,
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
    isActive: true,
    stops: [
      { stationCode: 'MAS', stationName: 'M.G.R. Chennai Central', arrivalTime: '13:50', departureTime: '13:50', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 8, lat: 13.0827, lng: 80.2755 },
      { stationCode: 'MDU', stationName: 'Madurai Junction', arrivalTime: '21:30', departureTime: '21:30', haltMinutes: 0, distanceKm: 495, dayCount: 1, platform: 1, lat: 9.9252, lng: 78.1198 },
    ],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', perKmRate: 1.15, baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 80 },
      { classCode: '2S', className: 'Second Sitting', perKmRate: 0.30, baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 280 },
    ],
    liveStatus: {
      trainNumber: '12635',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'M.G.R. Chennai Central (MAS)',
      previousStation: 'M.G.R. Chennai Central (MAS)',
      nextStation: 'Madurai Junction (MDU)',
      currentPlatform: 8,
      journeyProgress: 5,
      estimatedArrival: '21:30',
      estimatedDeparture: '13:50',
      dataSource: 'SIMULATED_ACADEMIC_DEMO',
      lastUpdated: new Date().toISOString(),
      notes: 'Scheduled boarding open at Platform 8.',
      currentLat: 13.0827,
      currentLng: 80.2755,
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
    isActive: true,
    stops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: '17:00', departureTime: '17:00', haltMinutes: 0, distanceKm: 0, dayCount: 1, platform: 16, lat: 18.9400, lng: 72.8354 },
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '08:32', departureTime: '08:32', haltMinutes: 0, distanceKm: 1384, dayCount: 2, platform: 1, lat: 28.6429, lng: 77.2195 },
    ],
    classes: [
      { classCode: '1A', className: 'AC 1st Class', perKmRate: 2.65, baseMultiplier: 4.4, reservationFee: 60, superfastSurcharge: 75, gstRate: 0.05, totalSeatsCapacity: 30 },
      { classCode: '2A', className: 'AC 2-Tier', perKmRate: 1.85, baseMultiplier: 3.0, reservationFee: 50, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 60 },
      { classCode: '3A', className: 'AC 3-Tier', perKmRate: 1.25, baseMultiplier: 2.2, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 140 },
    ],
    liveStatus: {
      trainNumber: '12951',
      status: 'ON_TIME',
      delayMinutes: 0,
      currentStation: 'Surat Division',
      previousStation: 'Mumbai CSMT (CSMT)',
      nextStation: 'New Delhi (NDLS)',
      currentPlatform: 1,
      journeyProgress: 28,
      estimatedArrival: '08:32',
      estimatedDeparture: '17:00',
      dataSource: 'SIMULATED_ACADEMIC_DEMO',
      lastUpdated: new Date().toISOString(),
      notes: 'Cruising at 130 km/h with Tejas Smart Coach telemetry active.',
      currentLat: 21.1702,
      currentLng: 72.8311,
    },
  },
];

// Seed Users with BCrypt-hashed passwords for security
// Plaintext passwords:
// passenger@rail.in -> pass123
// admin@rail.in -> admin123
const SEED_USERS: User[] = [
  {
    id: 'usr_passenger_demo',
    name: 'Priya Sharma',
    email: 'passenger@rail.in',
    passwordHash: bcrypt.hashSync('pass123', 10),
    phone: '+91 98765 43210',
    role: 'PASSENGER',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'usr_admin_demo',
    name: 'Rajesh Kumar (Station Super)',
    email: 'admin@rail.in',
    passwordHash: bcrypt.hashSync('admin123', 10),
    phone: '+91 98111 22334',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

// Tomorrow's sample date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
const sampleTravelDate = tomorrow.toISOString().split('T')[0];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk_sample_01',
    pnr: '482-910-3847',
    userId: 'usr_passenger_demo',
    userEmail: 'passenger@rail.in',
    userName: 'Priya Sharma',
    userPhone: '+91 98765 43210',
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
      distanceKm: 359,
      classCode: 'CC',
      className: 'AC Chair Car',
      ratePerKm: 1.15,
      baseFare: 413, // 359 * 1.15 = ~413
      reservationCharge: 40,
      superfastCharge: 45,
      configuredChargesTotal: 85,
      subtotal: 498,
      gstRate: 0.05,
      gstAmount: 25,
      totalPerPassenger: 523,
      passengerCount: 2,
      grandTotal: 1046,
    },
    status: 'CONFIRMED',
    bookedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const SEED_NOTIFICATIONS: JourneyNotification[] = [
  {
    id: 'notif_demo_01',
    userId: 'usr_passenger_demo',
    trainNumber: '20607',
    title: 'Booking Confirmed: PNR 482-910-3847',
    message: 'Your ticket for Vande Bharat Express (MAS → SBC) is confirmed in Coach C3.',
    type: 'BOOKING',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: false,
  },
  {
    id: 'notif_demo_02',
    trainNumber: '20607',
    title: 'Platform Position Assigned',
    message: 'Train 20607 will be received on Platform 2 at M.G.R. Chennai Central.',
    type: 'PLATFORM_CHANGE',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
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
          // Ensure demo admin and passenger credentials always have valid hashes
          const admin = parsed.users.find((u: User) => u.email.toLowerCase() === 'admin@rail.in');
          if (admin) {
            try {
              if (!bcrypt.compareSync('admin123', admin.passwordHash)) {
                admin.passwordHash = bcrypt.hashSync('admin123', 10);
                admin.role = 'ADMIN';
              }
            } catch {
              admin.passwordHash = bcrypt.hashSync('admin123', 10);
              admin.role = 'ADMIN';
            }
          }
          const passenger = parsed.users.find((u: User) => u.email.toLowerCase() === 'passenger@rail.in');
          if (passenger) {
            try {
              if (!bcrypt.compareSync('pass123', passenger.passwordHash)) {
                passenger.passwordHash = bcrypt.hashSync('pass123', 10);
              }
            } catch {
              passenger.passwordHash = bcrypt.hashSync('pass123', 10);
            }
          }
          return parsed;
        }
      }
    } catch {
      // Ignore
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

  // --- USER AUTHENTICATION & MANAGEMENT ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  registerUser(params: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'PASSENGER' | 'ADMIN';
    designation?: string;
  }): User {
    const cleanEmail = params.email.trim().toLowerCase();
    if (this.getUserByEmail(cleanEmail)) {
      throw new Error(`An account with email '${cleanEmail}' is already registered. Please sign in instead.`);
    }

    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Secure password hashing with bcryptjs
    const passwordHash = bcrypt.hashSync(params.password, 10);
    const assignedRole: 'PASSENGER' | 'ADMIN' = params.role === 'ADMIN' ? 'ADMIN' : 'PASSENGER';

    const displayName = params.designation && assignedRole === 'ADMIN'
      ? `${params.name.trim()} (${params.designation.trim()})`
      : params.name.trim();

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: displayName,
      email: cleanEmail,
      passwordHash,
      phone: params.phone.trim(),
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);

    // Add welcome notification for new user
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: assignedRole === 'ADMIN' ? 'Railway Admin Access Granted' : 'Welcome to RailSathi!',
      message:
        assignedRole === 'ADMIN'
          ? `Welcome ${newUser.name}! Your Railway Official Administrator account is active. You have full access to Train Management, Live Tracking Simulator, Fare Rules, and PNR Control.`
          : `Namaste ${newUser.name}! Your passenger account has been registered. Search trains and book your journeys easily.`,
      type: 'REGISTRATION',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return newUser;
  }

  validatePassword(email: string, passwordAttempt: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    // Guaranteed demo account check
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@rail.in' && passwordAttempt === 'admin123') {
      if (user.role !== 'ADMIN') {
        user.role = 'ADMIN';
        this.persist();
      }
      return user;
    }
    if (cleanEmail === 'passenger@rail.in' && passwordAttempt === 'pass123') {
      return user;
    }

    let isValid = false;
    try {
      if (user.passwordHash && (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$'))) {
        isValid = bcrypt.compareSync(passwordAttempt, user.passwordHash);
      } else {
        isValid = passwordAttempt === user.passwordHash;
      }
    } catch {
      isValid = passwordAttempt === user.passwordHash;
    }

    if (!isValid) return null;

    // If password was stored in plaintext, upgrade to bcrypt on the fly!
    if (!user.passwordHash.startsWith('$2')) {
      try {
        user.passwordHash = bcrypt.hashSync(passwordAttempt, 10);
        this.persist();
      } catch {
        // Continue even if persist fails
      }
    }

    return user;
  }

  resetPassword(email: string, newPass: string): boolean {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    user.passwordHash = bcrypt.hashSync(newPass, 10);
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Password Updated',
      message: 'Your account password has been reset successfully.',
      type: 'REGISTRATION',
      timestamp: new Date().toISOString(),
      read: false,
    });
    this.persist();
    return true;
  }

  updateUserProfile(userId: string, updates: { name?: string; phone?: string }): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    this.persist();
    return user;
  }

  // --- STATIONS & TRAINS ---
  getStations(): Station[] {
    return this.data.stations;
  }

  getStationByCode(code: string): Station | undefined {
    return this.data.stations.find((s) => s.code.toUpperCase() === code.trim().toUpperCase());
  }

  getTrains(): Train[] {
    return this.data.trains;
  }

  getTrainByNumber(trainNumber: string): Train | undefined {
    return this.data.trains.find((t) => t.trainNumber === trainNumber.trim());
  }

  searchTrains(sourceCode: string, destinationCode: string): Train[] {
    const src = sourceCode.trim().toUpperCase();
    const dest = destinationCode.trim().toUpperCase();

    if (src === dest) {
      throw new Error('Source and Destination stations cannot be the same.');
    }

    return this.data.trains.filter((train) => {
      if (train.isActive === false) return false;

      // direct origin-destination match
      if (train.sourceCode === src && train.destinationCode === dest) {
        return true;
      }

      // intermediate stops verification
      const srcIdx = train.stops.findIndex((s) => s.stationCode === src);
      const destIdx = train.stops.findIndex((s) => s.stationCode === dest);
      return srcIdx !== -1 && destIdx !== -1 && srcIdx < destIdx;
    });
  }

  // Distance calculation between stations along train stops
  calculateRouteDistance(train: Train, fromCode: string, toCode: string): number {
    const src = fromCode.trim().toUpperCase();
    const dest = toCode.trim().toUpperCase();

    if (train.sourceCode === src && train.destinationCode === dest) {
      return train.distanceKm;
    }

    const srcStop = train.stops.find((s) => s.stationCode === src);
    const destStop = train.stops.find((s) => s.stationCode === dest);

    if (srcStop && destStop && destStop.distanceKm >= srcStop.distanceKm) {
      return destStop.distanceKm - srcStop.distanceKm;
    }

    return train.distanceKm;
  }

  // --- DISTANCE-BASED FARE CALCULATION ---
  // Formula:
  // Base Fare = Route Distance (km) × Class Rate per km
  // Total Fare = (Base Fare + Configured Charges) × Passenger Count - Applicable Discounts
  calculateFare(
    train: Train,
    classRule: ClassFareRule,
    passengerCount: number,
    fromCode?: string,
    toCode?: string
  ): FareBreakdown {
    const distanceKm = fromCode && toCode
      ? this.calculateRouteDistance(train, fromCode, toCode)
      : train.distanceKm;

    const ratePerKm = classRule.perKmRate || 0.45;
    const baseFare = Math.round(distanceKm * ratePerKm);
    const reservationCharge = classRule.reservationFee;
    const superfastCharge = train.trainType === 'SUPERFAST' || train.trainType === 'VANDE_BHARAT' || train.trainType === 'RAJDHANI'
      ? classRule.superfastSurcharge
      : 0;
    const configuredChargesTotal = reservationCharge + superfastCharge;
    const subtotal = baseFare + configuredChargesTotal;
    const gstRate = classRule.gstRate || 0;
    const gstAmount = Math.round(subtotal * gstRate);
    const totalPerPassenger = subtotal + gstAmount;

    return {
      distanceKm,
      classCode: classRule.classCode,
      className: classRule.className,
      ratePerKm,
      baseFare,
      reservationCharge,
      superfastCharge,
      configuredChargesTotal,
      subtotal,
      gstRate,
      gstAmount,
      totalPerPassenger,
      passengerCount,
      grandTotal: totalPerPassenger * passengerCount,
    };
  }

  // --- SEAT AVAILABILITY ---
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

  // --- TICKET BOOKING & PNR ---
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

  private allocateBerths(
    classCode: SeatClassCode,
    passengers: Array<{ name: string; age: number; gender: string; berthPreference: string }>
  ): Passenger[] {
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
    userPhone?: string;
    trainNumber: string;
    travelDate: string;
    classCode: SeatClassCode;
    fromCode?: string;
    toCode?: string;
    passengers: Array<{ name: string; age: number; gender: string; berthPreference: string }>;
  }): Booking {
    const train = this.getTrainByNumber(params.trainNumber);
    if (!train) throw new Error(`Train #${params.trainNumber} not found.`);

    const classRule = train.classes.find((c) => c.classCode === params.classCode);
    if (!classRule) throw new Error(`Class ${params.classCode} not supported on train #${train.trainNumber}.`);

    // Server-side seat validation
    const availability = this.getSeatAvailability(params.trainNumber, params.classCode, params.travelDate);
    if (!availability || availability.availableSeats < params.passengers.length) {
      throw new Error(`Insufficient seats available in ${classRule.className}. Available: ${availability?.availableSeats || 0}`);
    }

    const fareBreakdown = this.calculateFare(
      train,
      classRule,
      params.passengers.length,
      params.fromCode,
      params.toCode
    );

    const allocatedPassengers = this.allocateBerths(params.classCode, params.passengers);
    const pnr = this.generateUniquePnr();

    const fromStation = params.fromCode ? this.getStationByCode(params.fromCode) : null;
    const toStation = params.toCode ? this.getStationByCode(params.toCode) : null;

    const booking: Booking = {
      id: `bk_${Date.now()}`,
      pnr,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userPhone: params.userPhone,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      travelDate: params.travelDate,
      sourceCode: fromStation?.code || train.sourceCode,
      sourceName: fromStation?.name || train.sourceName,
      destinationCode: toStation?.code || train.destinationCode,
      destinationName: toStation?.name || train.destinationName,
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

    // Add user-specific booking notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: params.userId,
      trainNumber: train.trainNumber,
      title: `Booking Confirmed: PNR ${pnr}`,
      message: `Your booking for ${train.trainName} on ${params.travelDate} is confirmed in Coach ${allocatedPassengers[0]?.coach}.`,
      type: 'BOOKING',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return booking;
  }

  // --- BOOKING MANAGEMENT & CANCELLATION ---
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

  cancelBooking(pnr: string, requestingUserId: string, isAdmin = false): { booking: Booking; refundAmount: number; cancellationFee: number } {
    const booking = this.getBookingByPnr(pnr);
    if (!booking) throw new Error('Booking not found with the specified PNR.');

    // Security check: Passenger can only cancel their own booking!
    if (!isAdmin && booking.userId !== requestingUserId) {
      throw new Error('Access denied: You are not authorized to cancel another passenger\'s booking.');
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('This ticket has already been cancelled.');
    }

    // IRCTC Refund Slab Calculation
    const journeyDateTime = new Date(`${booking.travelDate}T${booking.departureTime}:00`);
    const now = new Date();
    const hoursRemaining = (journeyDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const totalFare = booking.fareBreakdown.grandTotal;

    const clerkageMap: Record<SeatClassCode, number> = {
      '1A': 240,
      '2A': 200,
      '3A': 180,
      CC: 180,
      SL: 120,
      '2S': 60,
    };
    const baseClerkage = (clerkageMap[booking.classCode] || 120) * booking.passengers.length;

    let cancellationFee = 0;
    if (hoursRemaining > 48) {
      cancellationFee = baseClerkage;
    } else if (hoursRemaining > 12) {
      cancellationFee = Math.max(baseClerkage, Math.round(totalFare * 0.25));
    } else if (hoursRemaining > 4) {
      cancellationFee = Math.max(baseClerkage, Math.round(totalFare * 0.5));
    } else {
      cancellationFee = Math.round(totalFare * 0.75);
    }

    cancellationFee = Math.min(totalFare, cancellationFee);
    const refundAmount = totalFare - cancellationFee;

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationFee = cancellationFee;
    booking.refundAmount = refundAmount;

    // Send user notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      trainNumber: booking.trainNumber,
      title: `Ticket Cancelled: PNR ${booking.pnr}`,
      message: `Your booking for ${booking.trainName} has been cancelled. Demo refund of ₹${refundAmount} calculated.`,
      type: 'CANCELLATION',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return { booking, refundAmount, cancellationFee };
  }

  // --- LIVE TRAIN TRACKING & SIMULATION ---
  getLiveTrainStatus(trainNumber: string): TrainLiveStatus | null {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return null;

    if (!train.liveStatus) {
      train.liveStatus = {
        trainNumber: train.trainNumber,
        status: 'ON_TIME',
        delayMinutes: 0,
        currentStation: train.sourceName,
        previousStation: train.sourceName,
        nextStation: train.stops[1]?.stationName || train.destinationName,
        currentPlatform: 1,
        journeyProgress: 15,
        estimatedArrival: train.arrivalTime,
        estimatedDeparture: train.departureTime,
        dataSource: 'SIMULATED_ACADEMIC_DEMO',
        lastUpdated: new Date().toISOString(),
        currentLat: train.stops[0]?.lat || 13.0827,
        currentLng: train.stops[0]?.lng || 80.2755,
      };
    }

    return train.liveStatus;
  }

  advanceLiveSimulation(trainNumber: string): TrainLiveStatus | null {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return null;

    const currentStatus = this.getLiveTrainStatus(trainNumber);
    if (!currentStatus) return null;

    let newProgress = (currentStatus.journeyProgress + 15) % 100;
    if (newProgress === 0) newProgress = 10;

    // Calculate station progression
    const stopCount = train.stops.length;
    const currentStopIdx = Math.min(
      stopCount - 1,
      Math.floor((newProgress / 100) * stopCount)
    );
    const prevStop = train.stops[Math.max(0, currentStopIdx - 1)];
    const curStop = train.stops[currentStopIdx];
    const nxtStop = train.stops[Math.min(stopCount - 1, currentStopIdx + 1)];

    train.liveStatus = {
      ...currentStatus,
      journeyProgress: newProgress,
      currentStation: curStop.stationName,
      previousStation: prevStop.stationName,
      nextStation: nxtStop.stationName,
      currentPlatform: curStop.platform || 1,
      currentLat: curStop.lat || train.stops[0]?.lat,
      currentLng: curStop.lng || train.stops[0]?.lng,
      lastUpdated: new Date().toISOString(),
      notes: `Advancing on route. Current position: ${curStop.stationName}.`,
    };

    this.persist();
    return train.liveStatus;
  }

  updateLiveStatus(trainNumber: string, statusUpdate: Partial<TrainLiveStatus>): TrainLiveStatus | null {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return null;

    train.liveStatus = {
      ...(train.liveStatus || this.getLiveTrainStatus(trainNumber)!),
      ...statusUpdate,
      lastUpdated: new Date().toISOString(),
    };

    this.addNotification({
      id: `notif_${Date.now()}`,
      trainNumber,
      title: `Live Status: ${train.trainName} (#${trainNumber})`,
      message: statusUpdate.notes || `Train is currently ${train.liveStatus.status} (delay: ${train.liveStatus.delayMinutes} mins) at platform ${train.liveStatus.currentPlatform}`,
      type: statusUpdate.status === 'DELAYED' ? 'DELAY' : 'SIMULATION',
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.persist();
    return train.liveStatus;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): JourneyNotification[] {
    return this.data.notifications.filter((n) => !n.userId || (userId && n.userId === userId));
  }

  addNotification(notification: JourneyNotification): JourneyNotification {
    this.data.notifications.unshift(notification);
    if (this.data.notifications.length > 60) {
      this.data.notifications = this.data.notifications.slice(0, 60);
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

  // --- ADMIN MANAGEMENT ---
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

  toggleTrainActive(trainNumber: string): boolean {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) return false;
    train.isActive = train.isActive === false ? true : false;
    this.persist();
    return train.isActive;
  }

  // --- ALTERNATIVE JOURNEY EXPLORER ---
  getAlternativeJourneys(sourceCode: string, destinationCode: string, travelDate: string, currentTrainNumber?: string) {
    const src = sourceCode.toUpperCase();
    const dest = destinationCode.toUpperCase();

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
