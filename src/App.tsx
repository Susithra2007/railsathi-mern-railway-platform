import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import {
  AlternativeJourneyOption,
  Booking,
  JourneyNotification,
  SeatClassCode,
  Station,
  Train,
} from './types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ETicketModal } from './components/ETicketModal';
import { StationScheduleModal } from './components/StationScheduleModal';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';

import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { PNRStatusPage } from './pages/PNRStatusPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminPage } from './pages/AdminPage';

import { AlertTriangle, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

function AppContent() {
  const { user, isLoggedIn } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'dashboard' | 'tracking' | 'bookings' | 'pnr' | 'admin'>('home');

  // Data State
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<JourneyNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
    date: string;
    classCode?: string;
  }>({
    from: 'MAS',
    to: 'SBC',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    classCode: '',
  });
  const [searchResults, setSearchResults] = useState<Train[]>([]);
  const [alternatives, setAlternatives] = useState<{
    directAlternatives: AlternativeJourneyOption[];
    connectingAlternatives: AlternativeJourneyOption[];
  } | undefined>(undefined);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [authModalRole, setAuthModalRole] = useState<'PASSENGER' | 'ADMIN'>('PASSENGER');
  const [selectedTrainForSchedule, setSelectedTrainForSchedule] = useState<Train | null>(null);
  const [bookingModalParams, setBookingModalParams] = useState<{
    train: Train;
    classCode: SeatClassCode;
    travelDate: string;
    fromCode?: string;
    toCode?: string;
  } | null>(null);
  const [eTicketBooking, setETicketBooking] = useState<Booking | null>(null);
  const [activeCancellationPnr, setActiveCancellationPnr] = useState<string | null>(null);
  const [cancellationResult, setCancellationResult] = useState<{
    booking: Booking;
    refundAmount: number;
    cancellationFee: number;
  } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [pnrTarget, setPnrTarget] = useState('482-910-3847');

  // Load initial dataset
  const loadInitialData = async () => {
    try {
      const [stationList, trainList] = await Promise.all([
        api.getStations(),
        api.searchTrains({}),
      ]);
      setStations(stationList);
      setTrains(trainList);

      if (user) {
        const [bookingsList, notifsList] = await Promise.all([
          api.getUserBookings(user),
          api.getNotifications(user.id),
        ]);
        setUserBookings(bookingsList);
        setNotifications(notifsList);
      } else {
        setUserBookings([]);
        setNotifications([]);
      }
    } catch (err: any) {
      console.warn('Initial load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Periodic polling for notifications
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        try {
          const notifs = await api.getNotifications(user.id);
          setNotifications(notifs);
        } catch {
          // Ignore
        }
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Search Submission
  const handleSearch = async (params: { from: string; to: string; date: string; classCode?: string }) => {
    setSearchParams(params);
    setCurrentTab('search');
    try {
      const results = await api.searchTrains(params);
      setSearchResults(results);

      const altData = await api.getAlternativeRoutes(params.from, params.to, params.date);
      setAlternatives(altData);
    } catch (err: any) {
      console.warn('Search error:', err.message);
    }
  };

  // Handle PNR lookup redirect
  const handleCheckPnr = (pnr: string) => {
    setPnrTarget(pnr);
    setCurrentTab('pnr');
  };

  // Handle successful booking
  const handleBookingSuccess = async (newBooking: Booking) => {
    setBookingModalParams(null);
    setETicketBooking(newBooking);
    if (user) {
      const updatedBookings = await api.getUserBookings(user);
      setUserBookings(updatedBookings);
    }
  };

  // Handle Ticket Cancellation execution
  const executeCancellation = async (pnr: string) => {
    if (!user) return;
    try {
      const result = await api.cancelBooking(pnr, user);
      setCancellationResult(result);
      const updatedBookings = await api.getUserBookings(user);
      setUserBookings(updatedBookings);
    } catch (err: any) {
      setToastError(err.message || 'Cancellation failed');
      setActiveCancellationPnr(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (user) {
      await api.markNotificationRead('all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    }
  };

  if (loading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold tracking-wide">
          Connecting to RailSathi Passenger Platform...
        </p>
      </div>
    );
  }

  const bookingToCancel = activeCancellationPnr
    ? userBookings.find((b) => b.pnr === activeCancellationPnr)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        onOpenAiAssistant={() => setShowAiModal(true)}
        onOpenAuthModal={(mode, role) => {
          setAuthModalMode(mode || 'LOGIN');
          setAuthModalRole(role || 'PASSENGER');
          setShowAuthModal(true);
        }}
        onOpenWorkflowGuide={() => setShowWorkflowGuide(true)}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            stations={stations}
            featuredTrains={trains}
            onSearch={handleSearch}
            onCheckPnr={handleCheckPnr}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || 'REGISTER');
              setAuthModalRole('PASSENGER');
              setShowAuthModal(true);
            }}
            onOpenWorkflowGuide={() => setShowWorkflowGuide(true)}
            onExploreTrain={(t) => {
              setSearchParams({
                from: t.sourceCode,
                to: t.destinationCode,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                classCode: '',
              });
              handleSearch({
                from: t.sourceCode,
                to: t.destinationCode,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              });
            }}
          />
        )}

        {currentTab === 'search' && (
          <SearchResultsPage
            trains={searchResults.length > 0 ? searchResults : trains}
            stations={stations}
            searchParams={searchParams}
            onSearch={handleSearch}
            onBook={(train, classCode) =>
              setBookingModalParams({
                train,
                classCode,
                travelDate: searchParams.date,
                fromCode: searchParams.from,
                toCode: searchParams.to,
              })
            }
            onViewSchedule={(train) => setSelectedTrainForSchedule(train)}
            alternatives={alternatives}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            bookings={userBookings}
            stations={stations}
            onViewETicket={(booking) => setETicketBooking(booking)}
            onOpenAiAssistant={() => setShowAiModal(true)}
            onNavigateToSearch={() => setCurrentTab('search')}
            onCheckPnr={handleCheckPnr}
            onSearch={handleSearch}
            onOpenAuthModal={() => {
              setAuthModalMode('REGISTER');
              setShowAuthModal(true);
            }}
          />
        )}

        {currentTab === 'tracking' && (
          <LiveTrackingPage
            trains={trains}
            initialTrainNumber="20607"
          />
        )}

        {currentTab === 'bookings' && (
          <MyBookingsPage
            bookings={userBookings}
            onViewETicket={(b) => setETicketBooking(b)}
            onCancelBooking={(pnr) => setActiveCancellationPnr(pnr)}
            onNavigateToSearch={() => setCurrentTab('search')}
          />
        )}

        {currentTab === 'pnr' && (
          <PNRStatusPage
            initialPnr={pnrTarget}
            onViewETicket={(b) => setETicketBooking(b)}
            onCancelBooking={(pnr) => setActiveCancellationPnr(pnr)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            trains={trains}
            stations={stations}
            onRefreshData={loadInitialData}
            onViewETicket={(b) => setETicketBooking(b)}
            onOpenAuthModal={(mode, role) => {
              setAuthModalMode(mode || 'LOGIN');
              setAuthModalRole(role || 'ADMIN');
              setShowAuthModal(true);
            }}
          />
        )}
      </main>

      <Footer />

      {/* Auth Modal (Login, Register, Forgot Password) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onLoginSuccess={(role) => {
          if (role === 'ADMIN') {
            setCurrentTab('admin');
          }
        }}
      />

      {/* System Architecture & Lifecycle Workflow Guide */}
      <WorkflowGuideModal
        isOpen={showWorkflowGuide}
        onClose={() => setShowWorkflowGuide(false)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'LOGIN');
          setShowAuthModal(true);
        }}
      />

      {/* Booking Form Modal */}
      {bookingModalParams && (
        <BookingModal
          train={bookingModalParams.train}
          classCode={bookingModalParams.classCode}
          travelDate={bookingModalParams.travelDate}
          fromCode={bookingModalParams.fromCode}
          toCode={bookingModalParams.toCode}
          onClose={() => setBookingModalParams(null)}
          onSuccess={handleBookingSuccess}
          onOpenAuthModal={() => {
            setAuthModalMode('LOGIN');
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Printable E-Ticket (ERS) Modal */}
      {eTicketBooking && (
        <ETicketModal
          booking={eTicketBooking}
          onClose={() => setETicketBooking(null)}
        />
      )}

      {/* Intermediate Stops Route Schedule Modal */}
      {selectedTrainForSchedule && (
        <StationScheduleModal
          train={selectedTrainForSchedule}
          onClose={() => setSelectedTrainForSchedule(null)}
        />
      )}

      {/* Gemini AI Assistant Modal */}
      {showAiModal && (
        <GeminiAssistantModal
          onClose={() => setShowAiModal(false)}
          activePnr={userBookings[0]?.pnr}
        />
      )}

      {/* Real-time Journey Notification Drawer */}
      <NotificationDrawer
        notifications={notifications}
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Interactive IRCTC Cancellation & Refund Modal */}
      {bookingToCancel && !cancellationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  Confirm Ticket Cancellation
                </h3>
              </div>
              <button
                onClick={() => setActiveCancellationPnr(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">PNR Number:</span>
                <span className="font-mono font-bold text-slate-900">{bookingToCancel.pnr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Train:</span>
                <span className="font-semibold text-slate-900">{bookingToCancel.trainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date:</span>
                <span className="font-mono text-slate-900">{bookingToCancel.travelDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fare Paid:</span>
                <span className="font-mono font-bold text-slate-900">₹{bookingToCancel.fareBreakdown.grandTotal}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1">
              <p className="font-semibold text-amber-950">IRCTC Refund Slab Notice:</p>
              <p>• Seats will be restored to general inventory immediately.</p>
              <p>• Standard clerkage deduction applies (&gt;48 hrs: flat clerkage; 12-48 hrs: 25%; &lt;12 hrs: 50%).</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveCancellationPnr(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Ticket
              </button>
              <button
                onClick={() => executeCancellation(bookingToCancel.pnr)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                Confirm Cancellation & Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Success Feedback Modal */}
      {cancellationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ticket Successfully Cancelled</h3>
              <p className="text-xs text-slate-500 mt-1">
                PNR {cancellationResult.booking.pnr} status has been updated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fare:</span>
                <span className="font-mono text-slate-900">₹{cancellationResult.booking.fareBreakdown.grandTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clerkage &amp; Cancellation Deductions:</span>
                <span className="font-mono text-rose-700 font-bold">-₹{cancellationResult.cancellationFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Net Refund Amount:</span>
                <span className="font-mono text-emerald-700 text-base">₹{cancellationResult.refundAmount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Refund credited to original payment mode (Demonstration). General inventory updated.
            </p>

            <button
              onClick={() => {
                setCancellationResult(null);
                setActiveCancellationPnr(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-rose-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-rose-700 animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{toastError}</span>
          </div>
          <button
            onClick={() => setToastError(null)}
            className="text-rose-300 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
