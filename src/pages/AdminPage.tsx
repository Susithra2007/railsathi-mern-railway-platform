import React, { useState, useEffect } from 'react';
import { Booking, Station, Train } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LiveStatusSimulator } from '../components/LiveStatusSimulator';
import { ShieldCheck, Train as TrainIcon, Users, DollarSign, Plus, Search, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminPageProps {
  trains: Train[];
  stations: Station[];
  onRefreshData: () => void;
  onViewETicket: (booking: Booking) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  trains,
  stations,
  onRefreshData,
  onViewETicket,
}) => {
  const { user, isAdmin, switchRole } = useAuth();
  const [stats, setStats] = useState<any>({
    totalTrains: 8,
    totalStations: 10,
    totalBookings: 1,
    confirmedCount: 1,
    cancelledCount: 0,
    totalPassengers: 2,
    totalRevenue: 1837,
  });
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRAINS' | 'BOOKINGS' | 'SIMULATOR'>('OVERVIEW');
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

  const loadAdminData = async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const statsData = await api.getSystemStats(user);
      setStats(statsData);
      const bookingsData = await api.getAllBookings(user);
      setAllBookings(bookingsData);
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
          },
        ],
        classes: [
          { classCode: 'CC', className: 'AC Chair Car', baseMultiplier: 2.0, reservationFee: 40, superfastSurcharge: 45, gstRate: 0.05, totalSeatsCapacity: 100 },
          { classCode: '2S', className: 'Second Sitting', baseMultiplier: 0.7, reservationFee: 15, superfastSurcharge: 15, gstRate: 0.0, totalSeatsCapacity: 200 },
        ],
      } as any);

      setFormMsg(`Train #${newTrainNumber} (${newTrainName}) added successfully!`);
      setNewTrainNumber('');
      setNewTrainName('');
      onRefreshData();
      setTimeout(() => setFormMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add train');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 rounded-full bg-amber-50 text-amber-700 w-16 h-16 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Administrator Clearance Required</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The Admin Console is restricted to railway station superintendents and division managers. You are currently browsing as a passenger.
        </p>
        <button
          onClick={() => switchRole('ADMIN')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Switch to Admin Account (Rajesh Kumar)</span>
        </button>
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
            Logged in as {user?.name} · System Audit ID: #AD-MAS-01
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Active Fleet Trains</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalTrains || trains.length}
          </div>
          <div className="text-[11px] text-slate-500">Across 10 railway stations</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Reservations</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalBookings || allBookings.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold font-mono">
            {stats.confirmedCount || 1} Confirmed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Passengers</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalPassengers || 2}
          </div>
          <div className="text-[11px] text-slate-500">With verified coach/berths</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase">Calculated Revenue</div>
          <div className="text-2xl font-black text-amber-900 font-mono tabular-nums">
            ₹{stats.totalRevenue || 1837}
          </div>
          <div className="text-[11px] text-slate-500">Net of refunds</div>
        </div>
      </div>

      {/* Segmented Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          System Overview & Simulator
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`px-3.5 py-2 rounded-lg transition-colors ${
            activeTab === 'BOOKINGS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          System Bookings Audit ({allBookings.length})
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
            {/* Quick Fleet Health */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Station Hub Coverage</h3>
              <div className="space-y-2">
                {stations.slice(0, 6).map((s) => (
                  <div
                    key={s.code}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{s.city}</span>
                      <span className="text-slate-500 font-mono text-[11px] ml-1.5">
                        ({s.code})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 font-semibold">
                      {s.platforms} Platforms
                    </span>
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
                  <th className="py-2.5 px-3">Train</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Route</th>
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
                    <td className="py-2.5 px-3 font-sans">
                      {b.trainName} (#{b.trainNumber})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{b.travelDate}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {b.sourceCode} → {b.destinationCode}
                    </td>
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
