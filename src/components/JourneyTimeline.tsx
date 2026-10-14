import React from 'react';
import { Booking, IntermediateStop } from '../types';
import { MapPin, Clock, Train, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface JourneyTimelineProps {
  booking: Booking;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ booking }) => {
  const stops: IntermediateStop[] = booking.stops || [
    {
      stationCode: booking.sourceCode,
      stationName: booking.sourceName,
      arrivalTime: booking.departureTime,
      departureTime: booking.departureTime,
      haltMinutes: 0,
      distanceKm: 0,
      dayCount: 1,
      platform: booking.departurePlatform || 2,
    },
    {
      stationCode: 'KPD',
      stationName: 'Katpadi Junction',
      arrivalTime: '07:13',
      departureTime: '07:15',
      haltMinutes: 2,
      distanceKm: 130,
      dayCount: 1,
      platform: 1,
    },
    {
      stationCode: booking.destinationCode,
      stationName: booking.destinationName,
      arrivalTime: booking.arrivalTime,
      departureTime: booking.arrivalTime,
      haltMinutes: 0,
      distanceKm: 359,
      dayCount: 1,
      platform: 7,
    },
  ];

  const liveStatus = booking.trainLiveStatus;
  const isDelayed = (liveStatus?.delayMinutes || 0) > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-sm">Smart Journey Companion: Live Timeline</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track progress, intermediate platform numbers, and journey ETA
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          {isDelayed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Running {liveStatus?.delayMinutes} mins late</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Right Time (On Schedule)</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Route Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stops.map((stop, idx) => {
          const isSource = idx === 0;
          const isDestination = idx === stops.length - 1;
          const isCurrentStop = idx === 1; // Simulated current stop

          return (
            <div key={stop.stationCode} className="relative group">
              {/* Node dot icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                  isCurrentStop
                    ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100 text-amber-600'
                    : isSource
                    ? 'border-emerald-500 text-emerald-600'
                    : isDestination
                    ? 'border-slate-800 text-slate-800'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {isCurrentStop ? (
                  <Train className="w-3 h-3 text-amber-600 animate-bounce" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                )}
              </div>

              {/* Station Details */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrentStop
                    ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{stop.stationName}</span>
                      <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        {stop.stationCode}
                      </span>
                      {isCurrentStop && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-full">
                          Current Location
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>Distance: {stop.distanceKm} km</span>
                      {stop.haltMinutes > 0 && <span>Halt: {stop.haltMinutes} mins</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-slate-500 text-[10px]">Arr / Dep</div>
                      <div className="font-bold text-slate-800">
                        {stop.arrivalTime} / {stop.departureTime}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-slate-200 text-slate-900 font-bold text-xs">
                      PF {stop.platform}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coach Position Guide */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2">
        <div className="flex items-center justify-between font-bold">
          <span>Coach Formation & Train Position:</span>
          <span className="text-amber-400 font-mono">Your Coach: {booking.passengers[0]?.coach || 'C3'}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          <div className="px-2.5 py-1.5 rounded bg-slate-800 font-mono text-[11px] text-slate-400 border border-slate-700">
            ENG
          </div>
          {['C1', 'C2', 'C3', 'C4', 'E1', 'E2'].map((coach) => {
            const isUserCoach = coach === (booking.passengers[0]?.coach || 'C3');
            return (
              <div
                key={coach}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all border ${
                  isUserCoach
                    ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {coach}
              </div>
            );
          })}
          <div className="px-2.5 py-1.5 rounded bg-slate-800 font-mono text-[11px] text-slate-400 border border-slate-700">
            SLR
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Coach {booking.passengers[0]?.coach || 'C3'} is positioned around 40 meters from the main platform entrance.
        </p>
      </div>
    </div>
  );
};
