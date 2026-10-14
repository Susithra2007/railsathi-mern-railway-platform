import React, { useState } from 'react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { Printer, XCircle, AlertTriangle, CheckCircle2, Calendar, Clock, Ticket } from 'lucide-react';

interface MyBookingsPageProps {
  bookings: Booking[];
  onViewETicket: (booking: Booking) => void;
  onCancelBooking: (pnr: string) => void;
  onNavigateToSearch: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  onViewETicket,
  onCancelBooking,
  onNavigateToSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'RAC';
    if (activeTab === 'COMPLETED') return false; // In demonstration, all non-cancelled are upcoming
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Railway Bookings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View booking history, print e-tickets, and manage cancellations
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Journeys ({bookings.filter((b) => b.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'CANCELLED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        PNR: {b.pnr}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Booked on: {new Date(b.bookedAt).toLocaleDateString()} · {b.className} ({b.classCode})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewETicket(b)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print ERS</span>
                  </button>
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => onCancelBooking(b.pnr)}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Route & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Train Name</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">
                    {b.trainName} (#{b.trainNumber})
                  </strong>
                  <span className="text-slate-500 text-[11px]">{b.trainType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Journey Date</span>
                  <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                    {b.travelDate}
                  </strong>
                  <span className="text-slate-500 text-[11px]">Departure: {b.departureTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">From / Platform</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">
                    {b.sourceName} ({b.sourceCode})
                  </strong>
                  <span className="text-slate-500 text-[11px]">Platform {b.departurePlatform}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Destination</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">
                    {b.destinationName} ({b.destinationCode})
                  </strong>
                  <span className="text-slate-500 text-[11px]">Arrival: {b.arrivalTime}</span>
                </div>
              </div>

              {/* Passengers and Refund Details */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Passengers: </span>
                  {b.passengers.map((p, i) => (
                    <span key={p.id} className="mr-2">
                      {p.name} (Coach {p.coach}, Berth {p.berthNumber} {p.berthType})
                      {i < b.passengers.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>

                <div className="font-mono text-slate-900 font-bold">
                  Total Fare: ₹{b.fareBreakdown.grandTotal}
                  {b.status === 'CANCELLED' && b.refundAmount !== undefined && (
                    <span className="text-emerald-700 ml-2">
                      (Refund: ₹{b.refundAmount})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No {activeTab.toLowerCase()} reservations found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to explore? Search Indian Railways routes and reserve confirmed berths right away.
          </p>
          <button
            onClick={onNavigateToSearch}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors"
          >
            Search Trains
          </button>
        </div>
      )}
    </div>
  );
};
