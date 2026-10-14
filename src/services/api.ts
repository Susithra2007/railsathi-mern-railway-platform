import {
  AlternativeJourneyOption,
  Booking,
  JourneyNotification,
  SeatClassCode,
  Station,
  Train,
  TrainLiveStatus,
  User,
} from '../types';

const API_BASE = '/api';

function getHeaders(userId?: string, userRole?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) headers['x-user-id'] = userId;
  if (userRole) headers['x-user-role'] = userRole;
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name: string, email: string, password: string, phone: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  // Trains & Stations
  async getStations(): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/trains/stations`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stations');
    return data.data;
  },

  async searchTrains(params: { from?: string; to?: string; date?: string; classCode?: string }): Promise<Train[]> {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.date) query.set('date', params.date);
    if (params.classCode) query.set('classCode', params.classCode);

    const res = await fetch(`${API_BASE}/trains/search?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to search trains');
    return data.data;
  },

  async getTrainByNumber(trainNumber: string, date?: string): Promise<Train> {
    const url = date ? `${API_BASE}/trains/${trainNumber}?date=${date}` : `${API_BASE}/trains/${trainNumber}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Train not found');
    return data.data;
  },

  async getAlternativeRoutes(from: string, to: string, date: string, currentTrain?: string): Promise<{
    directAlternatives: AlternativeJourneyOption[];
    connectingAlternatives: AlternativeJourneyOption[];
  }> {
    const query = new URLSearchParams({ from, to, date });
    if (currentTrain) query.set('currentTrain', currentTrain);
    const res = await fetch(`${API_BASE}/trains/alternatives?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load alternative journeys');
    return data.data;
  },

  // Bookings
  async createBooking(
    bookingData: {
      trainNumber: string;
      travelDate: string;
      classCode: SeatClassCode;
      passengers: Array<{ name: string; age: number; gender: string; berthPreference: string }>;
    },
    user: User
  ): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(user.id, user.role),
      body: JSON.stringify({
        ...bookingData,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Booking submission failed');
    return data.data;
  },

  async getBookingByPnr(pnr: string): Promise<Booking> {
    const cleanPnr = pnr.trim();
    const res = await fetch(`${API_BASE}/bookings/pnr/${cleanPnr}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Booking not found');
    return data.data;
  },

  async getUserBookings(user: User): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings/user`, {
      headers: getHeaders(user.id, user.role),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data.data;
  },

  async cancelBooking(pnr: string, user: User): Promise<{ booking: Booking; refundAmount: number; cancellationFee: number }> {
    const res = await fetch(`${API_BASE}/bookings/cancel/${pnr}`, {
      method: 'POST',
      headers: getHeaders(user.id, user.role),
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Ticket cancellation failed');
    return data;
  },

  // Notifications
  async getNotifications(userId?: string): Promise<JourneyNotification[]> {
    const url = userId ? `${API_BASE}/admin/notifications?userId=${userId}` : `${API_BASE}/admin/notifications`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return [];
    return data.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/notifications/${id}/read`, { method: 'PUT' });
  },

  // Admin
  async getAllBookings(user: User): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: getHeaders(user.id, user.role),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all bookings');
    return data.data;
  },

  async getSystemStats(user: User): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(user.id, user.role),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data.data;
  },

  async updateLiveStatus(
    trainNumber: string,
    statusData: {
      status: string;
      delayMinutes: number;
      currentStation: string;
      nextStation: string;
      currentPlatform: number;
      notes?: string;
    },
    adminUser: User
  ): Promise<TrainLiveStatus> {
    const res = await fetch(`${API_BASE}/admin/trains/${trainNumber}/live-status`, {
      method: 'POST',
      headers: getHeaders(adminUser.id, adminUser.role),
      body: JSON.stringify({ ...statusData, role: adminUser.role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to broadcast live status');
    return data.data;
  },

  async addTrain(adminUser: User, trainData: Partial<Train>): Promise<Train> {
    const res = await fetch(`${API_BASE}/admin/trains`, {
      method: 'POST',
      headers: getHeaders(adminUser.id, adminUser.role),
      body: JSON.stringify({ ...trainData, role: adminUser.role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add train');
    return data.data;
  },

  // AI Assistant
  async askAiAssistant(prompt: string, pnr?: string, context?: string): Promise<{ reply: string; source: string }> {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, pnr, context }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'AI request failed');
    return data;
  },
};
