import React, { useState } from 'react';
import { Train } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Radio, AlertTriangle, CheckCircle2, Send, Clock, Layers } from 'lucide-react';

interface LiveStatusSimulatorProps {
  trains: Train[];
  onStatusBroadcasted: () => void;
}

export const LiveStatusSimulator: React.FC<LiveStatusSimulatorProps> = ({
  trains,
  onStatusBroadcasted,
}) => {
  const { user } = useAuth();
  const [selectedTrain, setSelectedTrain] = useState(trains[0]?.trainNumber || '20607');
  const [statusType, setStatusType] = useState<'ON_TIME' | 'DELAYED' | 'ARRIVED'>('DELAYED');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [platform, setPlatform] = useState(3);
  const [customNote, setCustomNote] = useState('Signal clearance delay near Katpadi junction');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      const train = trains.find((t) => t.trainNumber === selectedTrain);
      await api.updateLiveStatus(
        selectedTrain,
        {
          status: statusType,
          delayMinutes: statusType === 'DELAYED' ? delayMinutes : 0,
          currentStation: train?.sourceCode || 'MAS',
          nextStation: train?.destinationCode || 'SBC',
          currentPlatform: platform,
          notes: customNote,
        },
        user
      );

      setSuccessMsg(`Live update broadcasted for train #${selectedTrain}! Notifications triggered.`);
      onStatusBroadcasted();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <h3 className="font-bold text-slate-900 text-sm">
            Live Train Status Simulator (College Demo Console)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
          Socket.IO / Push Event Broadcast
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Simulate real-time railway track conditions, platform changes, and route delay events to demonstrate instant passenger timeline reactions and notification alerts.
      </p>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Select Train */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Train Schedule</label>
            <select
              value={selectedTrain}
              onChange={(e) => setSelectedTrain(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              {trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} - {t.trainName} ({t.sourceCode} → {t.destinationCode})
                </option>
              ))}
            </select>
          </div>

          {/* Running Status */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Operational Status</label>
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              <option value="ON_TIME">Right Time (On Schedule)</option>
              <option value="DELAYED">Delayed (Behind Schedule)</option>
              <option value="ARRIVED">Arrived at Terminal</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delay in mins */}
          {statusType === 'DELAYED' && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Delay Duration (Minutes)</label>
              <input
                type="number"
                value={delayMinutes}
                min={1}
                max={240}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          )}

          {/* Current Platform */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Assigned Platform Number</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => (
                <option key={p} value={p}>
                  Platform {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Event Note */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Status Announcement Note</label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Platform change from 2 to 5 due to traffic clearance"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{loading ? 'Broadcasting...' : 'Broadcast Real-Time Event & Alert Passengers'}</span>
        </button>
      </form>
    </div>
  );
};
