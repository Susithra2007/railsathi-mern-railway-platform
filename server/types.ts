export type SeatClassCode = '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  platforms: number;
}

export interface IntermediateStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  distanceKm: number;
  dayCount: number;
  platform: number;
}

export interface ClassFareRule {
  classCode: SeatClassCode;
  className: string;
  baseMultiplier: number;
  reservationFee: number;
  superfastSurcharge: number;
  gstRate: number; // e.g. 0.05 for AC, 0 for Sleeper/2S
  totalSeatsCapacity: number;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: 'VANDE_BHARAT' | 'RAJDHANI' | 'SHATABDI' | 'SUPERFAST' | 'EXPRESS';
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string; // "06:00"
  arrivalTime: string; // "14:15"
  duration: string; // "8h 15m"
  distanceKm: number;
  runsOnDays: string[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  stops: IntermediateStop[];
  classes: ClassFareRule[];
  pantryAvailable: boolean;
  cleanlinessRating: number;
  liveStatus?: TrainLiveStatus;
}

export interface TrainLiveStatus {
  trainNumber: string;
  status: 'ON_TIME' | 'DELAYED' | 'DEPARTED' | 'ARRIVED';
  delayMinutes: number;
  currentStation: string;
  nextStation: string;
  currentPlatform: number;
  lastUpdated: string;
  notes?: string;
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'TRANSGENDER';
  berthPreference: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE_LOWER' | 'SIDE_UPPER' | 'WINDOW' | 'NO_PREFERENCE';
  coach: string;
  berthNumber: number;
  berthType: string;
  status: 'CONFIRMED' | 'RAC' | 'WL';
}

export interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  gstAmount: number;
  tatkalCharge?: number;
  concessionAmount?: number;
  totalPerPassenger: number;
  passengerCount: number;
  grandTotal: number;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  userEmail: string;
  userName: string;
  trainNumber: string;
  trainName: string;
  trainType: string;
  travelDate: string; // YYYY-MM-DD
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  classCode: SeatClassCode;
  className: string;
  passengers: Passenger[];
  fareBreakdown: FareBreakdown;
  status: 'CONFIRMED' | 'RAC' | 'WAITLISTED' | 'CANCELLED';
  bookedAt: string;
  cancelledAt?: string;
  refundAmount?: number;
  cancellationFee?: number;
  departurePlatform: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'PASSENGER' | 'ADMIN';
  createdAt: string;
}

export interface JourneyNotification {
  id: string;
  userId?: string; // empty means broadcast to all
  trainNumber?: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'DELAY' | 'PLATFORM_CHANGE' | 'REMINDER' | 'SIMULATION';
  timestamp: string;
  read: boolean;
}
