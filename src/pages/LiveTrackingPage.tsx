import React, { useState, useEffect } from 'react';
import { Train, TrainLiveStatus } from '../types';
import { api } from '../services/api';
import {
  Train as TrainIcon,
  Search,
  MapPin,
  Clock,
  Radio,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Info,
} from 'lucide-react';

interface LiveTrackingPageProps {
  trains: Train[];
  initialTrainNumber?: string;
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({
  trains,
  initialTrainNumber = '20607',
}) => {
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(initialTrainNumber);
  const [trackingData, setTrackingData] = useState<{
    train: Train;
    liveStatus: TrainLiveStatus;
    stops: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchTracking = async (tNum: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const data = await api.getLiveTrainTracking(tNum);
      setTrackingData(data);
    } catch (err: any) {
      console.warn('Tracking fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(selectedTrainNumber);
  }, [selectedTrainNumber]);

  // Periodic automatic simulation updates (every 12 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedTrainNumber) {
        api.getLiveTrainTracking(selectedTrainNumber).then((data) => {
          setTrackingData(data);
        }).catch(() => {});
      }
    }, 12000);
    return () => clearInterval(timer);
  }, [selectedTrainNumber]);

  const handleManualAdvance = async () => {
    setSimulating(true);
    setSearchError(null);
    try {
      const updatedStatus = await api.advanceSimulationStep(selectedTrainNumber);
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          liveStatus: updatedStatus,
        });
      }
    } catch (err: any) {
      setSearchError(err.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const query = searchInput.trim().toUpperCase();
    const matched = trains.find(
      (t) => t.trainNumber === query || t.trainName.toUpperCase().includes(query)
    );
    if (matched) {
      setSelectedTrainNumber(matched.trainNumber);
    } else {
      setSearchError(`No train found matching "${searchInput}". Please select from the fleet list.`);
    }
  };

  const currentTrain = trackingData?.train || trains.find((t) => t.trainNumber === selectedTrainNumber) || trains[0];
  const liveStatus = trackingData?.liveStatus || currentTrain?.liveStatus;
  const stops = trackingData?.stops || currentTrain?.stops || [];
  const isDelayed = (liveStatus?.delayMinutes || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner with Honest Demo Disclosure */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Simulated Live Railway Tracking (Academic Demo)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Live Train Status & Route Map Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time route progress, intermediate station halts, delay estimates, and track telemetry
            </p>
          </div>

          {/* Quick Train Selector */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedTrainNumber}
              onChange={(e) => setSelectedTrainNumber(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500"
            >
              {trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} - {t.trainName} ({t.sourceCode} → {t.destinationCode})
                </option>
              ))}
            </select>

            <button
              onClick={handleManualAdvance}
              disabled={simulating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
              title="Advance train along route in simulation"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400" />
              <span>{simulating ? 'Advancing...' : 'Advance Train Position (Demo)'}</span>
            </button>
          </div>
        </div>

        {/* Live Tracking Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-1 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search train by number or name (e.g. 20607, 12622, Vande Bharat)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Track Train
          </button>
        </form>

        {searchError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{searchError}</span>
            <button onClick={() => setSearchError(null)} className="text-rose-700 hover:text-rose-900 font-bold text-xs ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Tracking Overview Card */}
      {currentTrain && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Strip */}
          <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded text-xs">
                  #{currentTrain.trainNumber}
                </span>
                <h2 className="text-xl font-bold">{currentTrain.trainName}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {currentTrain.trainType}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Route: {currentTrain.sourceName} ({currentTrain.sourceCode}) → {currentTrain.destinationName} ({currentTrain.destinationCode}) · Total Distance: {currentTrain.distanceKm} km
              </p>
            </div>

            {/* Delay & Status Badge */}
            <div className="flex items-center gap-3">
              {isDelayed ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Late by {liveStatus?.delayMinutes} mins</span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Right Time (On Schedule)</span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Journey Progress Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Journey Progress:</span>
                <span className="font-mono text-slate-600">{liveStatus?.journeyProgress || 35}% Completed</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Last Telemetry Update: {new Date(liveStatus?.lastUpdated || Date.now()).toLocaleTimeString()}
              </div>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.max(8, liveStatus?.journeyProgress || 35)}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full opacity-80 animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Current Location KPI Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Current Position / Sector</span>
              <strong className="text-slate-900 text-sm block">
                {liveStatus?.currentStation || currentTrain.stops[1]?.stationName}
              </strong>
              <span className="text-[11px] text-slate-500">Platform {liveStatus?.currentPlatform || 1}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Previous Station Passed</span>
              <strong className="text-slate-900 text-sm block">
                {liveStatus?.previousStation || currentTrain.sourceName}
              </strong>
              <span className="text-[11px] text-emerald-700 font-medium">Cleared signal</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Next Upcoming Halt</span>
              <strong className="text-slate-900 text-sm block">
                {liveStatus?.nextStation || currentTrain.destinationName}
              </strong>
              <span className="text-[11px] text-slate-500">ETA: {liveStatus?.estimatedArrival || currentTrain.arrivalTime}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Data Source</span>
              <strong className="text-slate-900 text-sm block font-mono">
                {liveStatus?.dataSource || 'SIMULATED_DEMO'}
              </strong>
              <span className="text-[11px] text-amber-700 font-medium">Auto-advances periodically</span>
            </div>
          </div>

          {/* Interactive Visual Route Map Component */}
          <div className="p-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-600" />
                <span>Station Track Route Map</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Coordinates & Station Halts
              </span>
            </div>

            {/* Stylized SVG Railway Track Map */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-inner">
              <div className="text-[11px] text-slate-400 mb-6 flex items-center justify-between">
                <span>Route Coordinates Topology</span>
                <span className="font-mono text-amber-400">Total Halts: {stops.length}</span>
              </div>

              {/* Station sequence with track line */}
              <div className="relative py-8">
                {/* Track Line */}
                <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-700 -translate-y-1/2 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                    style={{ width: `${liveStatus?.journeyProgress || 35}%` }}
                  ></div>
                </div>

                {/* Stations */}
                <div className="relative flex justify-between items-center">
                  {stops.map((stop, idx) => {
                    const isPassed = (liveStatus?.journeyProgress || 35) >= (idx / (stops.length - 1)) * 100;
                    const isCurrent = Math.abs((liveStatus?.journeyProgress || 35) - (idx / (stops.length - 1)) * 100) < 25;

                    return (
                      <div key={stop.stationCode} className="flex flex-col items-center text-center max-w-[120px] relative">
                        {/* Node */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-400/30 scale-110'
                              : isPassed
                              ? 'bg-emerald-500 text-white border-slate-900'
                              : 'bg-slate-800 text-slate-400 border-slate-600'
                          }`}
                        >
                          {isCurrent ? <TrainIcon className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        {/* Station Name & Info */}
                        <div className="mt-3 space-y-0.5">
                          <span className="font-bold text-xs block text-slate-100 truncate">
                            {stop.stationName}
                          </span>
                          <span className="font-mono text-[10px] text-amber-400 font-bold block">
                            {stop.stationCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Arr: {stop.arrivalTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            PF {stop.platform}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Announcement ticker */}
              {liveStatus?.notes && (
                <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{liveStatus.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
