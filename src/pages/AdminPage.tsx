import React, { useState, useEffect } from 'react';
import { Booking, Station, Train, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LiveStatusSimulator } from '../components/LiveStatusSimulator';
import {
  ShieldCheck,
  Train as TrainIcon,
  Users,
  Search,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Power,
  Settings,
  Calculator,
  CheckCircle2,
} from 'lucide-react';

interface AdminPageProps {
  trains: Train[];
  stations: Station[];
  onRefreshData: () => void;
  onViewETicket: (booking: Booking) => void;
  onOpenAuthModal: (mode?: 'LOGIN' | 'REGISTER', role?: 'PASSENGER' | 'ADMIN') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  trains,
  stations,
  onRefreshData,
  onViewETicket,
  onOpenAuthModal,
}) => {
  const { user, isAdmin, login } = useAuth();
  const [stats, setStats] = useState<any>({
    totalTrains: 8,
    totalStations: 10,
    totalBookings: 1,
    confirmedCount: 1,
    cancelledCount: 0,
    totalPassengersRegistered: 2,
    totalPassengersTraveled: 2,
    totalRevenue: 1837,
  });
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRAINS' | 'BOOKINGS' | 'USERS' | 'FARE_RULES'>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  // New Train Form State
  const [newTrainNumber, setNewTrainNumber] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newSource, setNewSource] = useState('MAS');
  const [newDest, setNewDest] = useState('CBE');
  const [newDepTime, setNewDepTime] = useState('06:00');
  const [newArrTime, setNewArrTime] = useState('13:30');
  const [newDuration, setNewDuration] = useState('7h 30m');
  const [newDistance, setNewDistance] = useState(495);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Fare Rule Form State
  const [fareTrainNum, setFareTrainNum] = useState(trains[0]?.trainNumber || '20607');
  const [fareClass, setFareClass] = useState('CC');
  const [farePerKm, setFarePerKm] = useState('1.15');
  const [fareResFee, setFareResFee] = useState('40');
  const [fareSuperfast, setFareSuperfast] = useState('45');
  const [fareMsg, setFareMsg] = useState<string | null>(null);

  const loadAdminData = async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const statsData = await api.getSystemStats(user);
      setStats(statsData);
      const bookingsData = await api.getAllBookings(user);
      setAllBookings(bookingsData);
      const usersData = await api.getAllUsers(user);
      setAllUsers(usersData);
    } catch (err: any) {
      console.warn('Admin load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleToggleTrain = async (trainNumber: string) => {
    if (!user || !isAdmin) return;
    try {
      await api.toggleTrainStatus(trainNumber, user);
      onRefreshData();
      loadAdminData();
    } catch (err: any) {
      setAdminError(err.message || 'Toggle failed');
    }
  };

  const handleCreateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    try {
      const sourceStation = stations.find((s) => s.code === newSource);
      const destStation = stations.find((s) => s.code === newDest);

      await api.addTrain(user, {
        id: `tr_${newTrainNumber}`,
        trainNumber: newTrainNumber,
        trainName: newTrainName,
        trainType: 'SUPERFAST',
        sourceCode: newSource,
        sourceName: sourceStation?.name || newSource,
        destinationCode: newDest,
        destinationName: destStation?.name || newDest,
        departureTime: newDepTime,
        arrivalTime: newArrTime,
        duration: newDuration,
        distanceKm: Number(newDistance),
        runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        pantryAvailable: true,
        cleanlinessRating: 4.8,
        isActive: true,
        stops: [
          {
            stationCode: newSource,
            stationName: sourceStation?.name || newSource,
            arrivalTime: newDepTime,
            departureTime: newDepTime,
            haltMinutes: 0,
            distanceKm: 0,
            dayCount: 1,
            platform: 1,
            lat: sourceStation?.lat,
            lng: sourceStation?.lng,
          },
          {
            stationCode: newDest,
            stationName: destStation?.name || newDest,
            arrivalTime: newArrTime,
            departureTime: newArrTime,
            haltMinutes: 0,
            distanceKm: Number(newDistance),
            dayCount: 1,
            platform: 2,
            lat: destStation?.lat,
            lng: destStation?.lng,
          },
        ],
        classes: [
          { classCode: 'CC', className: 'AC Chair Car', perKmRate: 1.15, baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 100 },
          { classCode: '2S', className: 'Second Sitting', perKmRate: 0.30, baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 200 },
        ],
      });

      setFormMsg(`Train #${newTrainNumber} (${newTrainName}) added successfully!`);
      setNewTrainNumber('');
      setNewTrainName('');
      onRefreshData();
      loadAdminData();
      setTimeout(() => setFormMsg(null), 4000);
    } catch (err: any) {
      setFormMsg(err.message || 'Failed to add train');
    }
  };

  const handleUpdateFareRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    try {
      await api.updateFareRules(
        {
          trainNumber: fareTrainNum,
          classCode: fareClass,
          perKmRate: parseFloat(farePerKm),
          reservationFee: parseInt(fareResFee),
          superfastSurcharge: parseInt(fareSuperfast),
        },
        user
      );
      setFareMsg(`Fare rules updated for ${fareClass} on Train #${fareTrainNum}!`);
      onRefreshData();
      setTimeout(() => setFareMsg(null), 4000);
    } catch (err: any) {
      setFareMsg(err.message || 'Failed to update fare rule');
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      await login('admin@rail.in', 'admin123');
    } catch (err: any) {
      setAdminError(err.message || 'Admin login failed');
    }
  };

  // Access control check
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 rounded-full bg-amber-50 text-amber-700 w-16 h-16 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Protected Administrator Portal</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Access to fleet scheduling, booking audits, and fare rule configuration requires authenticated Administrator clearance. Users registered as Passengers cannot access this console.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
          <p className="font-semibold text-slate-800">Demonstration Administrator Account:</p>
          <p className="font-mono mt-1">admin@rail.in / admin123</p>
        </div>

        {adminError && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs max-w-md mx-auto flex items-center justify-between">
            <span>{adminError}</span>
            <button onClick={() => setAdminError(null)} className="text-rose-600 font-bold ml-2">✕</button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleQuickAdminLogin}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>1-Click Login (Rajesh Kumar)</span>
          </button>
          <button
            onClick={() => onOpenAuthModal('LOGIN', 'ADMIN')}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Admin Sign In</span>
          </button>
          <button
            onClick={() => onOpenAuthModal('REGISTER', 'ADMIN')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            <span>Register New Admin Account</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = allBookings.filter(
    (b) =>
      b.pnr.includes(searchFilter) ||
      b.trainName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Station Master & Administration Console</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Railway Fleet & Passenger Oversight</h1>
          <p className="text-slate-400 text-xs mt-1">
            Logged in as {user?.name} ({user?.email}) · System Clearance: SUPERINTENDENT
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {adminError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{adminError}</span>
          </div>
          <button onClick={() => setAdminError(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Operational Trains</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalTrains || trains.length}
          </div>
          <div className="text-[11px] text-slate-500">Across {stats.totalStations || 10} major stations</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Registered Passengers</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalPassengersRegistered || allUsers.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold font-mono">
            {stats.confirmedCount || 1} Active Bookings
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Reservations</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalBookings || allBookings.length}
          </div>
          <div className="text-[11px] text-slate-500">
            {stats.cancelledCount || 0} Cancelled
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Calculated Revenue</div>
          <div className="text-2xl font-black text-amber-900 font-mono tabular-nums">
            ₹{stats.totalRevenue || 1837}
          </div>
          <div className="text-[11px] text-slate-500">Net of cancellations</div>
        </div>
      </div>

      {/* Segmented Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Overview & Live Simulator
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'BOOKINGS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Bookings Audit ({allBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'USERS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Registered Passengers ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('FARE_RULES')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'FARE_RULES'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Configure Fare Rules
        </button>
        <button
          onClick={() => setActiveTab('TRAINS')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'TRAINS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Add New Train Route
        </button>
      </div>

      {/* Tab: Overview & Simulator */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <LiveStatusSimulator
              trains={trains}
              onStatusBroadcasted={() => {
                onRefreshData();
                loadAdminData();
              }}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Train Fleet Active / Inactive Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Train Fleet Status Management</h3>
              <div className="space-y-2">
                {trains.map((t) => (
                  <div
                    key={t.trainNumber}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">#{t.trainNumber}</span>
                        <span className="font-semibold text-slate-800">{t.trainName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {t.sourceCode} → {t.destinationCode} ({t.distanceKm} km)
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleTrain(t.trainNumber)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        t.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{t.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Bookings */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-sm">
              All Passenger Reservations Across Network
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by PNR, train or email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">PNR</th>
                  <th className="py-2.5 px-3">Passenger</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Train</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 font-mono">Fare</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-amber-900">{b.pnr}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {b.userName}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 truncate max-w-[140px]">
                      {b.userEmail}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {b.trainName} (#{b.trainNumber})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{b.travelDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      ₹{b.fareBreakdown.grandTotal}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <button
                        onClick={() => onViewETicket(b)}
                        className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Registered Passengers Audit */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Registered Passenger Accounts Audit
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Configure Fare Rules */}
      {activeTab === 'FARE_RULES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Configure Distance-Based Fare Rules</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust per-kilometre class multipliers, reservation fees, and superfast surcharges
            </p>
          </div>

          {fareMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{fareMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateFareRules} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Train Schedule</label>
                <select
                  value={fareTrainNum}
                  onChange={(e) => setFareTrainNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {trains.map((t) => (
                    <option key={t.trainNumber} value={t.trainNumber}>
                      #{t.trainNumber} - {t.trainName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Travel Class</label>
                <select
                  value={fareClass}
                  onChange={(e) => setFareClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="CC">AC Chair Car (CC)</option>
                  <option value="1A">AC First Class (1A)</option>
                  <option value="2A">AC 2-Tier (2A)</option>
                  <option value="3A">AC 3-Tier (3A)</option>
                  <option value="SL">Sleeper Class (SL)</option>
                  <option value="2S">Second Sitting (2S)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Per-KM Rate (₹/km)</label>
                <input
                  type="number"
                  step="0.05"
                  value={farePerKm}
                  onChange={(e) => setFarePerKm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reservation Fee (₹)</label>
                <input
                  type="number"
                  value={fareResFee}
                  onChange={(e) => setFareResFee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Superfast Charge (₹)</label>
                <input
                  type="number"
                  value={fareSuperfast}
                  onChange={(e) => setFareSuperfast(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Update Class Fare Configuration
            </button>
          </form>
        </div>
      )}

      {/* Tab: Add Train Route */}
      {activeTab === 'TRAINS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Schedule New Express Train</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure route corridors, scheduled timings, and class inventory
            </p>
          </div>

          {formMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {formMsg}
            </div>
          )}

          <form onSubmit={handleCreateTrain} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Train Number (5 digits)</label>
                <input
                  type="text"
                  value={newTrainNumber}
                  onChange={(e) => setNewTrainNumber(e.target.value)}
                  placeholder="e.g. 12676"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Train Official Name</label>
                <input
                  type="text"
                  value={newTrainName}
                  onChange={(e) => setNewTrainName(e.target.value)}
                  placeholder="e.g. Cheran Superfast Express"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Station</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {stations.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.city} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destination Station</label>
                <select
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {stations.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.city} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Departure Time</label>
                <input
                  type="time"
                  value={newDepTime}
                  onChange={(e) => setNewDepTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Arrival Time</label>
                <input
                  type="time"
                  value={newArrTime}
                  onChange={(e) => setNewArrTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Distance (km)</label>
                <input
                  type="number"
                  value={newDistance}
                  onChange={(e) => setNewDistance(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Add Train to Operational Network
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
