export type SeatClassCode = '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  platforms: number;
  lat: number;
  lng: number;
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
  lat?: number;
  lng?: number;
}

export interface ClassFareRule {
  classCode: SeatClassCode;
  className: string;
  perKmRate: number; // e.g. 0.45 for SL, 1.10 for 3A, etc.
  baseMultiplier: number;
  reservationFee: number;
  superfastSurcharge: number;
  gstRate: number; // e.g. 0.05 for AC, 0 for Sleeper/2S
  totalSeatsCapacity: number;
}

export interface TrainLiveStatus {
  trainNumber: string;
  status: 'ON_TIME' | 'DELAYED' | 'DEPARTED' | 'ARRIVED';
  delayMinutes: number;
  currentStation: string;
  previousStation: string;
  nextStation: string;
  currentPlatform: number;
  journeyProgress: number; // 0 to 100 percentage
  estimatedArrival: string;
  estimatedDeparture: string;
  dataSource: string; // e.g. "SIMULATED_ACADEMIC_DEMO"
  lastUpdated: string;
  notes?: string;
  currentLat?: number;
  currentLng?: number;
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
  isActive?: boolean;
  liveStatus?: TrainLiveStatus;
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
  distanceKm: number;
  classCode: SeatClassCode;
  className: string;
  ratePerKm: number;
  baseFare: number; // distanceKm * ratePerKm
  reservationCharge: number;
  superfastCharge: number;
  configuredChargesTotal: number; // reservationCharge + superfastCharge
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discountAmount?: number;
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
  userPhone?: string;
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
  type: 'REGISTRATION' | 'BOOKING' | 'DELAY' | 'PLATFORM_CHANGE' | 'REMINDER' | 'CANCELLATION' | 'SIMULATION';
  timestamp: string;
  read: boolean;
}
