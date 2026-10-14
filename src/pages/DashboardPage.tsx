import React from 'react';
import { Booking, Station, Train } from '../types';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { DepartureChecklist } from '../components/DepartureChecklist';
import { TrainSearchForm } from '../components/TrainSearchForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Ticket,
  Search,
  User,
  Phone,
  Mail,
  AlertCircle,
  Download,
} from 'lucide-react';
import { downloadTicketHtml } from '../utils/ticketGenerator';

interface DashboardPageProps {
  bookings: Booking[];
  stations: Station[];
  onViewETicket: (booking: Booking) => void;
  onOpenAiAssistant: () => void;
  onNavigateToSearch: () => void;
  onCheckPnr: (pnr: string) => void;
  onSearch: (params: { from: string; to: string; date: string; classCode?: string }) => void;
  onOpenAuthModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  bookings,
  stations,
  onViewETicket,
  onOpenAiAssistant,
  onNavigateToSearch,
  onCheckPnr,
  onSearch,
  onOpenAuthModal,
}) => {
  const { user, isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'RAC');
  const upcomingBooking = activeBookings[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Passenger Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoggedIn ? 'Verified Passenger Portal' : 'Guest Passenger Session'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isLoggedIn ? `Welcome, ${user?.name}` : 'Welcome to RailSathi Passenger Portal'}
          </h1>
          <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
            {isLoggedIn
              ? `Account: ${user?.email} · Manage your confirmed bookings, departure checklists, and live companion tracking.`
              : 'Sign in to access your personal booking history, confirmed e-tickets, and departure timeline alerts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isLoggedIn ? (
            <button
              onClick={onOpenAuthModal}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          ) : (
            <button
              onClick={onOpenAiAssistant}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('ask_ai')}</span>
            </button>
          )}
          <button
            onClick={onNavigateToSearch}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-slate-700"
          >
            <Search className="w-4 h-4" />
            <span>Search Trains</span>
          </button>
        </div>
      </div>

      {/* Profile Details Card for logged in user */}
      {isLoggedIn && user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-mono">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-slate-600 font-mono">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Role: {user.role}
          </span>
        </div>
      )}

      {/* Main Grid */}
      {upcomingBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upcoming Journey Card & Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming Journey Hero Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <Ticket className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Next Confirmed Journey
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {upcomingBooking.trainName} (#{upcomingBooking.trainNumber})
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">PNR Number</div>
                  <div className="font-mono font-extrabold text-amber-900 text-lg">
                    {upcomingBooking.pnr}
                  </div>
                </div>
              </div>

              {/* Station Timing Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">From Station</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">
                    {upcomingBooking.sourceName} ({upcomingBooking.sourceCode})
                  </strong>
                  <span className="text-slate-500 text-[11px] font-mono">
                    Dep: {upcomingBooking.departureTime} · PF {upcomingBooking.departurePlatform}
                  </span>
                </div>

                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                    {upcomingBooking.className} ({upcomingBooking.classCode})
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 font-mono">
                    Distance: {upcomingBooking.fareBreakdown.distanceKm} km
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-slate-500 block">Destination</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">
                    {upcomingBooking.destinationName} ({upcomingBooking.destinationCode})
                  </strong>
                  <span className="text-slate-500 text-[11px] font-mono">
                    Arr: {upcomingBooking.arrivalTime}
                  </span>
                </div>
              </div>

              {/* Passenger Allocation Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Assigned Passengers: </span>
                  {upcomingBooking.passengers.map((p) => (
                    <strong key={p.id} className="text-slate-900 font-mono mr-2">
                      {p.name} (Coach {p.coach}, Berth {p.berthNumber} {p.berthType})
                    </strong>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onViewETicket(upcomingBooking)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print E-Ticket</span>
                  </button>
                  <button
                    onClick={() => downloadTicketHtml(upcomingBooking)}
                    title="Download offline printable ticket file"
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Journey Timeline */}
            <JourneyTimeline booking={upcomingBooking} />
          </div>

          {/* Right Column: Pre-Journey Checklist & Recent PNRs */}
          <div className="lg:col-span-4 space-y-6">
            <DepartureChecklist />

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                My Booking History ({bookings.length})
              </h4>
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onCheckPnr(b.pnr)}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-300 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-900">{b.pnr}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          b.status === 'CONFIRMED' ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 truncate">
                      {b.trainName} · {b.travelDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State for New Users */
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                {isLoggedIn ? `No Bookings Yet, ${user?.name}` : 'No Bookings on Record'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have not booked any railway tickets under this account yet. Search available trains below to check seat availability, compute distance-based fares, and reserve confirmed berths.
              </p>
            </div>
          </div>

          {/* Embedded Train Search Form on Empty Dashboard */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Book Your Next Journey</h3>
            <TrainSearchForm stations={stations} onSearch={onSearch} />
          </div>
        </div>
      )}
    </div>
  );
};
