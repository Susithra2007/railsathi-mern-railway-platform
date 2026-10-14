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
  gstRate: number;
  totalSeatsCapacity: number;
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

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: 'VANDE_BHARAT' | 'RAJDHANI' | 'SHATABDI' | 'SUPERFAST' | 'EXPRESS';
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distanceKm: number;
  runsOnDays: string[];
  stops: IntermediateStop[];
  classes: ClassFareRule[];
  pantryAvailable: boolean;
  cleanlinessRating: number;
  liveStatus?: TrainLiveStatus;
  classAvailabilities?: {
    classCode: SeatClassCode;
    className: string;
    status: string;
    availableSeats: number;
    fare: FareBreakdown;
  }[];
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
  travelDate: string;
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
  trainLiveStatus?: TrainLiveStatus;
  stops?: IntermediateStop[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'PASSENGER' | 'ADMIN';
  createdAt?: string;
}

export interface JourneyNotification {
  id: string;
  userId?: string;
  trainNumber?: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'DELAY' | 'PLATFORM_CHANGE' | 'REMINDER' | 'SIMULATION';
  timestamp: string;
  read: boolean;
}

export interface AlternativeJourneyOption {
  type: 'DIRECT_ALTERNATIVE' | 'CONNECTING_ROUTE';
  trainNumber?: string;
  trainName?: string;
  trainType?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  recommendedClass?: SeatClassCode;
  availableSeats?: number;
  estimatedFare?: number;
  reason: string;
  hubCode?: string;
  hubName?: string;
  leg1?: {
    trainNumber: string;
    trainName: string;
    departureTime: string;
    arrivalTime: string;
    sourceCode: string;
    destCode: string;
  };
  leg2?: {
    trainNumber: string;
    trainName: string;
    departureTime: string;
    arrivalTime: string;
    sourceCode: string;
    destCode: string;
  };
  transferStation?: string;
  transferDuration?: string;
  totalDuration?: string;
}
