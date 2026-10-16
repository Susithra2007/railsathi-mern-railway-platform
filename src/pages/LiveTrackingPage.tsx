import React, { useState, useEffect, useRef } from 'react';
import { Train, TrainLiveStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Train as TrainIcon,
  Search,
  MapPin,
  Clock,
  Radio,
  Play,
  Pause,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Info,
  Sliders,
  Volume2,
  Gauge,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Workflow,
  Compass,
  Zap,
} from 'lucide-react';

interface LiveTrackingPageProps {
  trains: Train[];
  initialTrainNumber?: string;
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({
  trains,
  initialTrainNumber = '20607',
}) => {
  const { user, isAdmin } = useAuth();
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(initialTrainNumber);
  const [trackingData, setTrackingData] = useState<{
    train: Train;
    liveStatus: TrainLiveStatus;
    stops: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'TIMELINE' | 'RADAR' | 'CONTROLS'>('TIMELINE');
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);

  // Simulation Controller States
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [simDelayInput, setSimDelayInput] = useState<number>(0);
  const [simPlatformInput, setSimPlatformInput] = useState<number>(1);
  const [broadcastNote, setBroadcastNote] = useState<string>('');
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Fetch Tracking Data
  const fetchTracking = async (tNum: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const data = await api.getLiveTrainTracking(tNum);
      setTrackingData(data);
      if (data.liveStatus) {
        setSimDelayInput(data.liveStatus.delayMinutes || 0);
        setSimPlatformInput(data.liveStatus.currentPlatform || 1);
      }
    } catch (err: any) {
      console.warn('Tracking fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(selectedTrainNumber);
  }, [selectedTrainNumber]);

  // Periodic automatic simulation or poll (every 10 seconds or faster if autoplay is on)
  useEffect(() => {
    const intervalMs = autoPlay ? Math.max(3000, 10000 / simSpeed) : 12000;
    const timer = setInterval(() => {
      if (autoPlay) {
        handleManualAdvance();
      } else if (selectedTrainNumber) {
        api.getLiveTrainTracking(selectedTrainNumber)
          .then((data) => setTrackingData(data))
          .catch(() => {});
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [selectedTrainNumber, autoPlay, simSpeed]);

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
      setSearchError(`No train found matching "${searchInput}". Please pick from the fleet chips below.`);
    }
  };

  const handleBroadcastDelay = async (delay: number, customMessage?: string) => {
    if (!user) {
      setSearchError('Please sign in as Admin to broadcast manual live status updates.');
      return;
    }
    setLoading(true);
    try {
      const curTrain = currentTrain;
      await api.updateLiveStatus(
        selectedTrainNumber,
        {
          status: delay > 0 ? 'DELAYED' : 'ON_TIME',
          delayMinutes: delay,
          currentStation: liveStatus?.currentStation || curTrain?.sourceCode || 'MAS',
          nextStation: liveStatus?.nextStation || curTrain?.destinationCode || 'SBC',
          currentPlatform: simPlatformInput,
          notes: customMessage || (delay > 0 ? `Running late by ${delay} mins due to speed restriction / block clearing.` : 'Operating right on scheduled time.'),
        },
        user
      );
      setBroadcastSuccess(`Live status updated: ${delay > 0 ? `${delay} min delay` : 'On Time'} broadcasted!`);
      fetchTracking(selectedTrainNumber);
      setTimeout(() => setBroadcastSuccess(null), 3500);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to update delay');
    } finally {
      setLoading(false);
    }
  };

  // Play synthetic train horn / whistle using Web Audio API
  const playTrainHorn = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(311.13, ctx.currentTime); // D#4
      osc2.frequency.setValueAtTime(369.99, ctx.currentTime); // F#4 (classic railway dual-tone horn)

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio not supported or blocked by browser policy
    }
  };

  const currentTrain = trackingData?.train || trains.find((t) => t.trainNumber === selectedTrainNumber) || trains[0];
  const liveStatus = trackingData?.liveStatus || currentTrain?.liveStatus;
  const stops = trackingData?.stops || currentTrain?.stops || [];
  const isDelayed = (liveStatus?.delayMinutes || 0) > 0;
  const progressPct = liveStatus?.journeyProgress || 35;

  // Approximate live speed calculation based on train type and progress
  const simulatedSpeed = Math.round(
    currentTrain?.trainType === 'VANDE_BHARAT'
      ? 110 + ((progressPct % 17) - 8)
      : currentTrain?.trainType === 'RAJDHANI'
      ? 100 + ((progressPct % 15) - 7)
      : 80 + ((progressPct % 12) - 6)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with Fleet Quick Switch */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Where Is My Train · Real-Time GPS Tracking &amp; Simulator</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Live Train Tracking &amp; Route Telemetry</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track intermediate station halts, real-time platform updates, live train speed, delay alerts, and signal clearance.
            </p>
          </div>

          {/* Audio Whistle & Auto Simulator Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={playTrainHorn}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              title="Sound Locomotive Whistle / Horn"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>Train Horn</span>
            </button>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                autoPlay
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
              }`}
              title="Continuous Journey Auto Simulation"
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{autoPlay ? 'Auto-Running (Active)' : 'Auto-Run Simulation'}</span>
            </button>

            <button
              onClick={handleManualAdvance}
              disabled={simulating}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              title="Move train to the next halt"
            >
              <RotateCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Advancing...' : 'Advance Next Sector ⚡'}</span>
            </button>
          </div>
        </div>

        {/* Popular Train Quick Select Chips */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Active Train to Track:</span>
            <span className="text-[10px] text-slate-400">5 Pre-Loaded Trains</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trains.map((t) => {
              const isSelected = t.trainNumber === selectedTrainNumber;
              return (
                <button
                  key={t.trainNumber}
                  onClick={() => setSelectedTrainNumber(t.trainNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-amber-400 shadow-sm border border-slate-800'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <TrainIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>#{t.trainNumber} {t.trainName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'}`}>
                    {t.sourceCode} → {t.destinationCode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Train Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-1 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search train by number or name (e.g. 20607, 12622, Vande Bharat, Tamil Nadu)..."
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
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </div>
            <button onClick={() => setSearchError(null)} className="text-rose-700 hover:text-rose-900 font-bold text-xs ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* EXPLANATORY WORKFLOW INSPECTOR ACCORDION */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 text-white p-5 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Live Tracking System Workflow Explained</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  செயல்முறை விளக்கம்
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                How live train positioning, GPS telemetry, delay calculation, and station alerts work
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span>{showWorkflowGuide ? 'Hide Workflow' : 'View Workflow Steps'}</span>
            {showWorkflowGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showWorkflowGuide && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px] flex items-center justify-center">1</span>
                <Radio className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <strong className="text-slate-200 block font-semibold">GPS &amp; Telemetry</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The locomotive engine transmits real-time GPS coordinates, track speed ({simulatedSpeed} km/h), and timestamp to the central railway database.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">2</span>
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <strong className="text-slate-200 block font-semibold">Block Section Signal</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Track sensors and axle counters detect when the train departs {liveStatus?.previousStation || currentTrain.sourceName} and enters the next block section.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center">3</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <strong className="text-slate-200 block font-semibold">Dynamic ETA Engine</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If the train halts or slows down, the algorithm calculates delay ({liveStatus?.delayMinutes || 0} mins) and dynamically updates estimated arrival times.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px] flex items-center justify-center">4</span>
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <strong className="text-slate-200 block font-semibold">Platform Assignment</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Station masters assign platform numbers (e.g. Platform {liveStatus?.currentPlatform || 1}) which synchronize immediately across all passenger screens.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px] flex items-center justify-center">5</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <strong className="text-slate-200 block font-semibold">Push Alerts to Users</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Passengers holding PNRs for this train receive live push notifications, delay advisories, and alternative route suggestions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Train Card */}
      {currentTrain && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cockpit / HUD Header Strip */}
          <div className="p-6 bg-slate-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded text-xs border border-slate-700">
                    #{currentTrain.trainNumber}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{currentTrain.trainName}</h2>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                    {currentTrain.trainType}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {currentTrain.sourceName} ({currentTrain.sourceCode}) → {currentTrain.destinationName} ({currentTrain.destinationCode}) · Total Distance: {currentTrain.distanceKm} km · Departure: {currentTrain.departureTime} · Expected: {currentTrain.arrivalTime}
                </p>
              </div>

              {/* Status and Speed Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Speedometer HUD */}
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 shadow-2xs">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Track Speed</span>
                    <strong className="text-sm text-cyan-300 font-bold">{simulatedSpeed} km/h</strong>
                  </div>
                </div>

                {/* On-Time / Late Status Badge */}
                {isDelayed ? (
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center gap-2 font-mono shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    <div>
                      <span className="text-[10px] text-amber-400 block leading-none">Current Status</span>
                      <span>Late by {liveStatus?.delayMinutes} mins</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-2 font-mono shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <div>
                      <span className="text-[10px] text-emerald-400 block leading-none">Current Status</span>
                      <span>Right Time (On Schedule)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Journey Progress Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">Journey Completed:</span>
                  <span className="font-mono text-amber-400 font-bold">{progressPct}%</span>
                  <span className="text-slate-400 font-mono">
                    ({Math.round((progressPct / 100) * currentTrain.distanceKm)} km of {currentTrain.distanceKm} km)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Telemetry Updated: {new Date(liveStatus?.lastUpdated || Date.now()).toLocaleTimeString()}
                </div>
              </div>

              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-700 relative"
                  style={{ width: `${Math.max(5, progressPct)}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full opacity-90 shadow-sm animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50 border-b border-slate-200">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-slate-500 font-medium block">Current Position / Sector</span>
              <strong className="text-slate-900 text-sm block truncate">
                {liveStatus?.currentStation || currentTrain.stops[1]?.stationName}
              </strong>
              <span className="text-[11px] font-mono text-amber-700 font-bold">
                Platform #{liveStatus?.currentPlatform || 1}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-slate-500 font-medium block">Previous Station Passed</span>
              <strong className="text-slate-900 text-sm block truncate">
                {liveStatus?.previousStation || currentTrain.sourceName}
              </strong>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Cleared block section</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-slate-500 font-medium block">Next Upcoming Halt</span>
              <strong className="text-slate-900 text-sm block truncate">
                {liveStatus?.nextStation || currentTrain.destinationName}
              </strong>
              <span className="text-[11px] text-blue-700 font-mono font-semibold">
                ETA: {liveStatus?.estimatedArrival || currentTrain.arrivalTime}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-slate-500 font-medium block">Data Feed &amp; Signal</span>
              <strong className="text-slate-900 text-sm block font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{liveStatus?.dataSource || 'SIMULATED_GPS'}</span>
              </strong>
              <span className="text-[11px] text-slate-500">Auto-refreshing live</span>
            </div>
          </div>

          {/* Interactive View Mode Tabs */}
          <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveViewTab('TIMELINE')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeViewTab === 'TIMELINE'
                    ? 'border-amber-500 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrainIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>"Where Is My Train" Station Timeline</span>
              </button>

              <button
                onClick={() => setActiveViewTab('RADAR')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeViewTab === 'RADAR'
                    ? 'border-amber-500 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Track Radar &amp; Topology Map</span>
              </button>

              <button
                onClick={() => setActiveViewTab('CONTROLS')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeViewTab === 'CONTROLS'
                    ? 'border-amber-500 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulation Controls &amp; Delay Broadcast</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 pb-2 hidden sm:block">
              Route: <span className="font-mono font-bold text-slate-800">{stops.length} Station Halts</span>
            </div>
          </div>

          {/* TAB 1: AUTHENTIC "WHERE IS MY TRAIN" STATION TIMELINE */}
          {activeViewTab === 'TIMELINE' && (
            <div className="p-6">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-900">
                      Station-by-Station Live Track Timeline
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Live Indicator matches exact train telemetry
                  </span>
                </div>

                {/* Vertical Timeline container */}
                <div className="relative pl-6 sm:pl-10 space-y-8 py-2">
                  {/* Vertical Rail Line */}
                  <div className="absolute top-4 bottom-4 left-9 sm:left-13 w-1.5 bg-slate-300 rounded-full">
                    {/* Passed portion filled with emerald */}
                    <div
                      className="w-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ height: `${Math.min(100, Math.max(0, progressPct))}%` }}
                    ></div>
                  </div>

                  {stops.map((stop, idx) => {
                    const stopProgressThreshold = (idx / Math.max(1, stops.length - 1)) * 100;
                    const isPassed = progressPct > stopProgressThreshold + 5;
                    const isCurrent = Math.abs(progressPct - stopProgressThreshold) <= 15 || idx === Math.floor((progressPct / 100) * stops.length);
                    const isUpcoming = progressPct < stopProgressThreshold - 5;

                    return (
                      <div key={stop.stationCode} className="relative flex items-start gap-4 sm:gap-6 group">
                        {/* Node icon on line */}
                        <div className="relative z-10 flex-shrink-0">
                          {isCurrent ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg ring-4 ring-amber-400/30 animate-bounce">
                              <TrainIcon className="w-4 h-4 fill-slate-950" />
                            </div>
                          ) : isPassed ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-400 text-slate-600 font-bold text-xs flex items-center justify-center shadow-xs">
                              {idx + 1}
                            </div>
                          )}
                        </div>

                        {/* Station details card */}
                        <div
                          className={`flex-1 p-3.5 sm:p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                              : isPassed
                              ? 'bg-white border-slate-200'
                              : 'bg-white/70 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {stop.stationName}
                                </h4>
                                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                                  {stop.stationCode}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold animate-pulse">
                                    TRAIN AT THIS STATION
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Distance from origin: <strong className="text-slate-700">{stop.distanceKm} km</strong> · Halt: <strong className="text-slate-700">{stop.haltMinutes} mins</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-auto">
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-slate-900">
                                  Arr: {stop.arrivalTime}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  Dep: {stop.departureTime}
                                </div>
                              </div>

                              <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-center">
                                <span className="text-[9px] text-slate-400 uppercase block font-semibold">Platform</span>
                                <span className="text-xs font-mono font-bold text-slate-900">PF {stop.platform}</span>
                              </div>
                            </div>
                          </div>

                          {/* Extra info if delayed or passing */}
                          {isCurrent && liveStatus?.notes && (
                            <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{liveStatus.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SVG TRACK TOPOLOGY & RADAR */}
          {activeViewTab === 'RADAR' && (
            <div className="p-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-inner space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-200">Horizontal Railway Track Radar</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-cyan-400 font-bold">Speed: {simulatedSpeed} km/h</span>
                    <span className="text-amber-400 font-bold">Progress: {progressPct}%</span>
                  </div>
                </div>

                {/* SVG Visual Horizontal Track */}
                <div className="relative py-12 px-4">
                  {/* Outer track bar */}
                  <div className="absolute top-1/2 left-4 right-4 h-2 bg-slate-800 -translate-y-1/2 rounded-full border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Stations nodes */}
                  <div className="relative flex justify-between items-center">
                    {stops.map((stop, idx) => {
                      const isPassed = progressPct >= (idx / (stops.length - 1)) * 100;
                      const isCurrent = Math.abs(progressPct - (idx / (stops.length - 1)) * 100) < 20;

                      return (
                        <div key={stop.stationCode} className="flex flex-col items-center text-center max-w-[130px] relative z-10">
                          {/* Circle Node */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-400/40 scale-125 shadow-lg'
                                : isPassed
                                ? 'bg-emerald-500 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-800 text-slate-400 border-slate-600'
                            }`}
                          >
                            {isCurrent ? <TrainIcon className="w-4 h-4 fill-slate-950" /> : idx + 1}
                          </div>

                          {/* Station label */}
                          <div className="mt-4 space-y-0.5">
                            <span className="font-bold text-xs block text-slate-100 truncate">
                              {stop.stationName}
                            </span>
                            <span className="font-mono text-[10px] text-amber-400 font-bold block">
                              {stop.stationCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              PF {stop.platform} · {stop.arrivalTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Announcement ticker */}
                {liveStatus?.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span className="font-mono">
                      <strong className="text-amber-400">OFFICIAL DESPATCH NOTE:</strong> {liveStatus.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATION CONTROLS & DELAY BROADCAST */}
          {activeViewTab === 'CONTROLS' && (
            <div className="p-6 space-y-6">
              <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Train Operation Simulator &amp; Delay Broadcaster
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold">
                    Admin / Controller Mode
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Simulate unforeseen track events (speed restrictions, block clearance, signal holds) to see how the live tracking engine recalibrates ETAs and updates passenger notifications.
                </p>

                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preset 1: On-Time */}
                  <button
                    onClick={() => handleBroadcastDelay(0, 'Operating on schedule. All signals clear.')}
                    className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all shadow-2xs group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                      <span>Clear Route (On-Time)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Reset delay to 0 mins. Train runs right on schedule.
                    </p>
                  </button>

                  {/* Preset 2: 15 min delay */}
                  <button
                    onClick={() => handleBroadcastDelay(15, '15-minute speed restriction near intermediate junction.')}
                    className="p-3 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all shadow-2xs group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-amber-800 flex items-center justify-between">
                      <span>Simulate +15 Min Delay</span>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Adds 15m delay to all downstream stops and updates ETAs.
                    </p>
                  </button>

                  {/* Preset 3: 45 min delay */}
                  <button
                    onClick={() => handleBroadcastDelay(45, '45-minute delay due to OHE power line inspection.')}
                    className="p-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-all shadow-2xs group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-rose-800 flex items-center justify-between">
                      <span>Simulate +45 Min Delay</span>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Simulates major delay and triggers alternative journey options.
                    </p>
                  </button>
                </div>

                {/* Simulation Speed Control */}
                <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Auto-Run Speed:</span>
                    <div className="flex gap-1">
                      {[1, 2, 5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSimSpeed(spd)}
                          className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                            simSpeed === spd
                              ? 'bg-slate-900 text-amber-400'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleManualAdvance}
                    disabled={simulating}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Step Train Forward 1 Halt</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
