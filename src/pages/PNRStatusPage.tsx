import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { Search, Printer, AlertTriangle, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2, Download } from 'lucide-react';
import { downloadTicketHtml } from '../utils/ticketGenerator';

interface PNRStatusPageProps {
  initialPnr?: string;
  onViewETicket: (booking: Booking) => void;
  onCancelBooking: (pnr: string) => void;
}

export const PNRStatusPage: React.FC<PNRStatusPageProps> = ({
  initialPnr = '482-910-3847',
  onViewETicket,
  onCancelBooking,
}) => {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPnr = async (pnrToFetch: string) => {
    if (!pnrToFetch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBookingByPnr(pnrToFetch.trim());
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'PNR not found or invalid format.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPnr) {
      fetchPnr(initialPnr);
    }
  }, [initialPnr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPnr(pnrInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">PNR Enquiry & Current Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Check real-time chart preparation, allocated coach, and berth numbers for your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value)}
              placeholder="Enter 10-digit PNR (e.g. 482-910-3847)"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Check Status</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Lookup Unsuccessful</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Booking Details Card */}
      {booking && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                10-Digit Railway PNR
              </span>
              <div className="font-mono text-2xl font-extrabold text-amber-900 tracking-wider">
                {booking.pnr}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {booking.status}
              </span>
              <button
                onClick={() => onViewETicket(booking)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-900 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View / Print</span>
              </button>
              <button
                onClick={() => downloadTicketHtml(booking)}
                title="Download offline printable ticket file"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Train & Journey Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Train Details</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.trainName} (#{booking.trainNumber})
              </strong>
              <span className="text-slate-500">{booking.trainType}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Journey Date</span>
              <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                {booking.travelDate}
              </strong>
              <span className="text-slate-500">Departure: {booking.departureTime}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Origin Station</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.sourceName} ({booking.sourceCode})
              </strong>
              <span className="text-slate-500">Platform: {booking.departurePlatform}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Destination</span>
              <strong className="text-slate-900 text-sm block mt-0.5">
                {booking.destinationName} ({booking.destinationCode})
              </strong>
              <span className="text-slate-500">Arrival: {booking.arrivalTime}</span>
            </div>
          </div>

          {/* Passenger Berth Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Passenger & Berth Status
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Passenger</th>
                    <th className="py-2.5 px-3">Age / Gender</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Coach</th>
                    <th className="py-2.5 px-3">Berth No.</th>
                    <th className="py-2.5 px-3">Berth Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {booking.passengers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3">
                        {p.age} / {p.gender.charAt(0)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{p.status}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.coach}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.berthNumber}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{p.berthType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cancellation Option */}
          {booking.status === 'CONFIRMED' && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-rose-900">
                <span className="font-bold block">Need to cancel this reservation?</span>
                <span>
                  Standard IRCTC cancellation deductions apply based on hours remaining before departure.
                </span>
              </div>
              <button
                onClick={() => onCancelBooking(booking.pnr)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                Cancel Booking & Calculate Refund
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
