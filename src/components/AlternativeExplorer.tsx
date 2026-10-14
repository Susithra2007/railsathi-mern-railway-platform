import React from 'react';
import { AlternativeJourneyOption, SeatClassCode } from '../types';
import { Shuffle, ArrowRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AlternativeExplorerProps {
  directAlternatives: AlternativeJourneyOption[];
  connectingAlternatives: AlternativeJourneyOption[];
  onSelectAlternative: (option: AlternativeJourneyOption) => void;
}

export const AlternativeExplorer: React.FC<AlternativeExplorerProps> = ({
  directAlternatives,
  connectingAlternatives,
  onSelectAlternative,
}) => {
  return (
    <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
          <Shuffle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Smart Alternative Journey Explorer
          </h3>
          <p className="text-xs text-slate-600">
            Suggested alternatives using verified schedules when preferred trains or classes are full
          </p>
        </div>
      </div>

      {/* Direct Alternative Trains */}
      {directAlternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Alternative Departure Timings (Same Corridor)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {directAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {alt.trainName} ({alt.trainNumber})
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {alt.availableSeats} Seats Avbl
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-mono">
                    <span>Dep: {alt.departureTime}</span>
                    <span>→</span>
                    <span>Arr: {alt.arrivalTime}</span>
                    <span>({alt.duration})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic">
                    Reason: {alt.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Est. Fare: <strong className="font-mono text-amber-900 text-sm">₹{alt.estimatedFare}</strong>
                  </span>
                  <button
                    onClick={() => onSelectAlternative(alt)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors"
                  >
                    Select Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connecting Routes Through Hub Stations */}
      {connectingAlternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Connecting Routes via Junction Hubs (1 Transfer)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectingAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Via {alt.hubName} ({alt.hubCode})
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Layover: {alt.transferDuration}
                  </span>
                </div>

                {/* 2 Legs visualization */}
                <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Leg 1: {alt.leg1?.trainName}</span>
                    <span className="font-mono text-slate-500">{alt.leg1?.departureTime} → {alt.leg1?.arrivalTime}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <span className="font-medium text-slate-700">Leg 2: {alt.leg2?.trainName}</span>
                    <span className="font-mono text-slate-500">{alt.leg2?.departureTime} → {alt.leg2?.arrivalTime}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  Reason: {alt.reason}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Total Time: <strong className="text-slate-800">{alt.totalDuration}</strong>
                  </span>
                  <button
                    onClick={() => onSelectAlternative(alt)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Explore Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
